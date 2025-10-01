export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@jetset/shared/dist/supabaseAdmin';
import { createHash, randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';

import { Wallet as EthersWallet } from 'ethers';

function userIndexFromId(userId: string): number {
  const h = createHash('sha256').update(userId).digest('hex');
  const n = BigInt('0x' + h) % BigInt(10_000_000);
  return Number(n);
}

function evmAddressFromMnemonic(mnemonic: string, index: number, coinType = 60) {
  const pathDer = `m/44'/${coinType}'/0'/0/${index}`;
  // ethers v6
  // @ts-ignore
  if (EthersWallet.fromPhrase) {
    // @ts-ignore
    const w = EthersWallet.fromPhrase(mnemonic, pathDer);
    return w.address;
  }
  // ethers v5 fallback
  // @ts-ignore
  const w = EthersWallet.fromMnemonic ? EthersWallet.fromMnemonic(mnemonic, pathDer) : EthersWallet.fromPhrase(mnemonic, pathDer);
  return w.address;
}

async function tonAddressFromMnemonicDynamic(mnemonic: string, index: number) {
  const { mnemonicToWalletKey } = await import('@ton/crypto');
  const ton = await import('@ton/ton');
  const kp = await mnemonicToWalletKey(mnemonic.split(' '), `${index}`);
  // @ts-ignore
  const wallet = ton.WalletContractV4.create({ publicKey: kp.publicKey, workchain: 0 });
  // @ts-ignore
  return wallet.address.toString({ testOnly: true });
}

function readMnemonicFallback(): { mnemonic: string; source: string } {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, '.env.local'),
    path.join(cwd, '..', '.env.local'),
    path.join(cwd, '..', '..', '.env.local'),
    path.join(cwd, 'apps', 'jetsetpoints', '.env.local'),
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) {
        const env = fs.readFileSync(file, 'utf8');
        const line = env.split('\n').find((l) => /^MNEMONIC=/.test(l)) || '';
        const m = line.replace(/^MNEMONIC=/, '').trim();
        if (m) return { mnemonic: m, source: file };
      }
    } catch {}
  }
  return { mnemonic: '', source: '' };
}

async function ensureIndices(admin: any, userId: string) {
  let evmindex: number | null = null;
  let tonindex: number | null = null;
  const { data: idxRow } = await admin.from('user_wallet_indices').select('*').eq('userid', userId).maybeSingle();
  if (!idxRow) {
    const idx = userIndexFromId(userId);
    evmindex = idx;
    tonindex = idx;
    const { error: insErr } = await admin.from('user_wallet_indices').insert({ userid: userId, evmindex, tonindex });
    if (insErr) throw insErr;
  } else {
    evmindex = idxRow.evmindex;
    tonindex = idxRow.tonindex;
  }
  return { evmindex: evmindex!, tonindex: tonindex! };
}

async function persistAddress(admin: any, userId: string, chain: string, chainfamily: 'EVM'|'TON', address: string, derivationindex: number) {
  const { data: existing } = await admin
    .from('user_chain_addresses')
    .select('*')
    .eq('userid', userId)
    .eq('chainid', chain)
    .maybeSingle();

  if (!existing) {
    const { error: insErr2 } = await admin.from('user_chain_addresses').insert({ userid: userId, chainfamily, chainid: chain, address, derivationindex });
    if (insErr2) throw insErr2;
  } else if (existing.address !== address) {
    const { error: upErr2 } = await admin
      .from('user_chain_addresses')
      .update({ address, derivationindex, chainfamily })
      .eq('userid', userId)
      .eq('chainid', chain);
    if (upErr2) throw upErr2;
  }
}

function readMnemonic(): string {
  let raw = (process.env.MNEMONIC || process.env.EVM_MNEMONIC || '').toString().trim();
  if (!raw) {
    const fb = readMnemonicFallback();
    raw = fb.mnemonic;
  }
  const MNEMONIC = raw.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  return MNEMONIC;
}

export async function GET(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || '';
    const chain = (searchParams.get('chain') || '').toLowerCase();
    if (!userId || !chain) return NextResponse.json({ ok: false, error: 'userId and chain required' }, { status: 400 });

    // First, try returning an existing address from DB (one-time behavior)
    const { data: existing } = await admin
      .from('user_chain_addresses')
      .select('address, chainfamily, derivationindex')
      .eq('userid', userId)
      .eq('chainid', chain)
      .maybeSingle();
    if (existing?.address) {
      return NextResponse.json({ ok: true, address: existing.address, chain, saved: true, from: 'db' });
    }

    const MNEMONIC = readMnemonic();
    if (!MNEMONIC) {
      const checked = ['MNEMONIC', 'EVM_MNEMONIC']
        .map((k) => `${k}=${process.env[k] ? '***set***' : 'missing'}`)
        .join(', ');
      return NextResponse.json({ ok: false, error: `MNEMONIC not configured on server. Checked env: ${checked}; also searched nearby .env.local files` }, { status: 500 });
    }

    const { evmindex, tonindex } = await ensureIndices(admin, userId);

    let address = '';
    let chainfamily: 'EVM' | 'TON' = 'EVM';
    let derivationindex = evmindex;
    if (chain === 'ton') {
      address = await tonAddressFromMnemonicDynamic(MNEMONIC, tonindex);
      chainfamily = 'TON';
      derivationindex = tonindex;
    } else if (['eth', 'bsc', 'polygon', 'celo'].includes(chain)) {
      address = evmAddressFromMnemonic(MNEMONIC, evmindex, 60);
      chainfamily = 'EVM';
      derivationindex = evmindex;
    } else {
      return NextResponse.json({ ok: false, error: 'unsupported chain' }, { status: 400 });
    }

    await persistAddress(admin, userId, chain, chainfamily, address, derivationindex);

    return NextResponse.json({ ok: true, address, chain, saved: true, from: 'generated' });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const body = await req.json().catch(() => ({}));
    const userId = (body.userId || '').toString();
    const chains = Array.isArray(body.chains) && body.chains.length ? body.chains.map((c: string) => c.toLowerCase()) : ['eth','bsc','polygon','celo','ton'];
    if (!userId) return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 });

    const MNEMONIC = readMnemonic();
    if (!MNEMONIC) {
      const checked = ['MNEMONIC', 'EVM_MNEMONIC']
        .map((k) => `${k}=${process.env[k] ? '***set***' : 'missing'}`)
        .join(', ');
      return NextResponse.json({ ok: false, error: `MNEMONIC not configured on server. Checked env: ${checked}; also searched nearby .env.local files` }, { status: 500 });
    }

    const { evmindex, tonindex } = await ensureIndices(admin, userId);

    const results: Record<string, string> = {};
    for (const chain of chains) {
      // Skip if already exists
      const { data: existing } = await admin
        .from('user_chain_addresses')
        .select('address')
        .eq('userid', userId)
        .eq('chainid', chain)
        .maybeSingle();
      if (existing?.address) { results[chain] = existing.address; continue; }

      if (chain === 'ton') {
        const addr = await tonAddressFromMnemonicDynamic(MNEMONIC, tonindex);
        await persistAddress(admin, userId, chain, 'TON', addr, tonindex);
        results[chain] = addr;
      } else if (['eth','bsc','polygon','celo'].includes(chain)) {
        const addr = evmAddressFromMnemonic(MNEMONIC, evmindex, 60);
        await persistAddress(admin, userId, chain, 'EVM', addr, evmindex);
        results[chain] = addr;
      }
    }

    return NextResponse.json({ ok: true, addresses: results });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
} 