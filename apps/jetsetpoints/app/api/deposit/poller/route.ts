import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@jetset/shared/dist/supabaseAdmin';
import { ethers } from 'ethers';

// Minimal config; in production make these envs per chain
const RPCS: Record<string, string> = {
  eth: process.env.ALCHEMY_URL || process.env.ALCHEMY_MAINNET || process.env.ALCHEMY_SEPOLIA || '',
  bsc: process.env.BSC_RPC_TESTNET || '',
  polygon: process.env.POLYGON_RPC_TESTNET || '',
  celo: process.env.CELO_RPC_TESTNET || '',
};

// ERC20 ABI fragment
const ERC20_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'function decimals() view returns (uint8)'
];

// Configure your ERC20 addresses (USDC/USDT) per chain
// Defaults for Ethereum mainnet if env not provided
const TOKENS: Record<string, { usdc?: string; usdt?: string }> = {
  eth: {
    usdc: process.env.SEPL_USDC || process.env.ETH_USDC || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    usdt: process.env.SEPL_USDT || process.env.ETH_USDT || '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  bsc: { usdc: process.env.BSC_USDC || undefined, usdt: process.env.BSC_USDT || undefined },
  polygon: { usdc: process.env.POLY_USDC || undefined, usdt: process.env.POLY_USDT || undefined },
  celo: { usdc: process.env.CELO_USDC || undefined, usdt: process.env.CELO_USDT || undefined },
};

// Last-seen table suggestion: deposit_cursors(address text pk, lastBlock bigint)
async function getLastBlock(admin: any, address: string) {
  const { data } = await admin.from('deposit_cursors').select('*').eq('address', address.toLowerCase()).maybeSingle();
  return Number(data?.lastBlock || 0);
}
async function setLastBlock(admin: any, address: string, block: number) {
  await admin.from('deposit_cursors').upsert({ address: address.toLowerCase(), lastBlock: block });
}

async function creditJP(admin: any, userId: string, usd: number, chainId: string, symbol: string) {
  const jp = Math.round(usd * 1000);
  const { data: balRow } = await admin.from('points_balances').select('*').eq('userId', userId).maybeSingle();
  const newBal = (Number(balRow?.balance || 0) + jp);
  await admin.from('points_balances').upsert({ userId, balance: newBal }, { onConflict: 'userId' });
  await admin.from('points_ledger').insert({ userId, deltaJP: jp, description: `Deposit ${usd} ${symbol} on ${chainId.toUpperCase()}` });
}

async function scanEvmChain(admin: any, chainId: string) {
  const rpc = RPCS[chainId];
  if (!rpc) return;
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const tokens = TOKENS[chainId];
  if (!tokens) return;

  const watch = [] as Array<{ symbol: string; contract: ethers.Contract; decimals: number }>;
  for (const [symbol, addr] of Object.entries(tokens)) {
    if (addr) watch.push({ symbol, contract: new ethers.Contract(addr, ERC20_ABI, provider), decimals: 6 });
  }
  if (watch.length === 0) return;

  const { data: rows } = await admin.from('user_chain_addresses').select('*').eq('chainFamily', 'EVM').eq('chainId', chainId);
  if (!rows || rows.length === 0) return;

  const latest = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latest - 5000);

  for (const w of watch) {
    const filter = w.contract.filters.Transfer();
    const logs = await w.contract.queryFilter(filter, fromBlock, latest);
    for (const log of logs) {
      const parsed = w.contract.interface.parseLog(log);
      const to = (parsed.args.to as string).toLowerCase();
      const value = parsed.args.value as ethers.BigNumber;
      const usd = Number(value) / 10 ** w.decimals;
      const match = rows.find((r: any) => (r.address || '').toLowerCase() === to);
      if (match && usd > 0) {
        await creditJP(admin, match.userId, usd, chainId, w.symbol.toUpperCase());
      }
    }
  }
}

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    await scanEvmChain(admin, 'eth');
    await scanEvmChain(admin, 'bsc');
    await scanEvmChain(admin, 'polygon');
    await scanEvmChain(admin, 'celo');
    // TON: TODO – add Jetton wallet poller (requires minter + wallet address resolution). You can use toncenter to read balances and compare deltas per user.
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
} 