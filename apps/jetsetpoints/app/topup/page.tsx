"use client";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";
import { getAuthUserId } from "@jetset/shared/dist/auth";
import Link from "next/link";
import { mockTxHash } from "@jetset/shared/dist/mockTx";

const CHAINS = [
  { id: 'eth', name: 'Ethereum', evm: true, logo: 'https://cdn.simpleicons.org/ethereum/ffffff' },
  { id: 'bsc', name: 'Binance', evm: true, logo: 'https://cdn.simpleicons.org/binance/ffffff' },
  { id: 'polygon', name: 'Polygon', evm: true, logo: 'https://cdn.simpleicons.org/polygon/ffffff' },
  { id: 'celo', name: 'Celo', evm: true, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5567.png' },
  { id: 'ton', name: 'Ton', evm: false, logo: 'https://cdn.simpleicons.org/ton/ffffff' },
] as const;

const TOKENS = [
  { id: 'usdc', name: 'USDC', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
  { id: 'usdt', name: 'USDT', logo: 'https://cdn.simpleicons.org/tether/50af95' },
  { id: 'cusd', name: 'cUSD', logo: 'https://raw.githubusercontent.com/celo-org/celo-monorepo/master/packages/images/tokens/cUSD.png' },
  { id: 'usde', name: 'USDe', logo: 'https://assets.coingecko.com/coins/images/35875/standard/usde.png' },
  { id: 'fdusd', name: 'FDUSD', logo: 'https://assets.coingecko.com/coins/images/30095/standard/fdusd.png' },
] as const;

type ChainId = typeof CHAINS[number]['id'];

type TokenId = 'usdc' | 'usdt' | 'cusd' | 'usde' | 'fdusd';

const TOKENS_BY_CHAIN: Record<ChainId, TokenId[]> = {
  eth: ['usdc', 'usdt'],
  bsc: ['usdc', 'usdt'],
  polygon: ['usdc', 'usdt'],
  celo: ['cusd', 'usdt', 'usdc'],
  ton: ['usdt', 'usde', 'fdusd'],
};

function tokenMeta(id: TokenId) {
  const t = TOKENS.find((x) => x.id === id)!;
  return t || { id, name: id.toUpperCase(), logo: '/globe.svg' } as any;
}

export default function PointsTopup() {
  const supabase = getSupabaseClient();
  const [userId, setUserId] = useState<string>('');
  const [token, setToken] = useState<TokenId>('usdc');
  const [chain, setChain] = useState<ChainId>('eth');
  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('0');
  const [crediting, setCrediting] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [genError, setGenError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  useEffect(() => {
    (async () => {
      const id = await getAuthUserId();
      if (id) {
        setUserId(id);
      }
    })();
  }, []);

  useEffect(() => {
    async function loadAddress() {
      if (!userId) return;
      if (step !== 3) return;
      try {
        setGenerating(true);
        setGenError('');
        const r = await fetch(`/api/deposit/address?userId=${userId}&chain=${chain}`);
        const j = await r.json();
        if (r.ok && j?.ok) setAddress(j.address);
        else {
          setAddress('');
          setGenError(j?.error || 'Unable to generate address');
        }
      } catch {
        setAddress('');
        setGenError('Network error while generating address');
      } finally {
        setGenerating(false);
      }
    }
    loadAddress();
  }, [userId, chain, step]);

  function onKey(k: string) {
    if (k === "<") return setAmount((a) => (a.length ? a.slice(0, -1) : ""));
    if (k === ".") {
      if (amount.includes(".")) return;
      return setAmount((a) => (a ? a + "." : "0."));
    }
    setAmount((a) => (a === "0" ? k : a + k));
  }

  async function creditPoints() {
    if (!userId) return;
    const amt = Number(amount || 0);
    if (amt <= 0) return;
    setCrediting(true);
    try {
      const points = Math.round(amt * 1000); // 1 stablecoin = 1 USD = 1000 JP
      const r = await fetch(`/api/points?userId=${userId}`);
      const j = await r.json();
      const cur = Number(j?.balance?.balance || 0);
      const newBal = cur + points;
      await fetch('/api/points', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId, balance: newBal, deltaJP: points, description: `Deposit ${amt} ${token.toUpperCase()} on ${chain.toUpperCase()}` }) });
      setStep(4);
    } catch (e) {
      console.error(e);
      alert('Failed to credit points');
    } finally {
      setCrediting(false);
    }
  }

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 pb-36">
      <div className="text-neutral-400 text-sm mb-2">
        <Link href="/">← Back</Link>
      </div>
      <h1 className="text-2xl font-bold">Add points (crypto deposit)</h1>
      <p className="text-neutral-400 mt-1">Select token and network, then deposit to your custodial address. Stablecoin only, based on chain availability.</p>

      {step === 1 && (
        <div className="mt-6">
          <div className="text-center">
            <div className="text-[64px] leading-none">${amount || "0"}</div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-300">
              🇺🇸 USD ▾
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 pb-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent">
            <div className="px-6 grid grid-cols-3 gap-4 text-2xl">
              {["1","2","3","4","5","6","7","8","9",".","0","<"].map((k) => (
                <button key={k} onClick={() => onKey(k)} className="py-4 rounded-xl bg-neutral-900 border border-neutral-800 active:scale-95 transition">
                  {k}
                </button>
              ))}
            </div>
            <div className="px-6 mt-4">
              <button onClick={() => setStep(2)} disabled={Number(amount||0) <= 0} className="w-full rounded-full bg-blue-600 py-4 text-lg font-semibold disabled:opacity-50">Continue</button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6">
          <div className="text-neutral-400 mb-2">Choose network</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CHAINS.map((c) => (
              <button key={c.id} onClick={() => { setChain(c.id); setToken(TOKENS_BY_CHAIN[c.id][0]); }} className={`rounded-xl border px-4 py-3 ${chain===c.id ? 'border-blue-500 bg-neutral-900' : 'border-neutral-800 bg-neutral-950'}`}>
                <div className="flex items-center gap-2"><img src={c.logo} alt={c.name} className="h-5 w-5" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/globe.svg'; }} /> <span className="font-medium">{c.name}</span></div>
              </button>
            ))}
          </div>

          <div className="text-neutral-400 mt-6 mb-2">Choose stablecoin</div>
          <div className="grid grid-cols-2 gap-3">
            {TOKENS_BY_CHAIN[chain].map((t) => {
              const m = tokenMeta(t);
              return (
                <button key={t} onClick={() => setToken(t)} className={`rounded-xl border px-4 py-3 ${token===t ? 'border-blue-500 bg-neutral-900' : 'border-neutral-800 bg-neutral-950'}`}>
                  <div className="flex items-center gap-2"><img src={m.logo} alt={m.name} className="h-5 w-5" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/globe.svg'; }} /> <span className="font-medium">{m.name}</span></div>
                </button>
              );
            })}
          </div>

          <button onClick={() => setStep(3)} className="mt-6 w-full rounded-full bg-blue-600 py-3 font-semibold">Next</button>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6 rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
          <div className="text-neutral-400">Deposit address</div>
          {genError && <div className="mt-2 text-red-400 text-sm">{genError}</div>}
          <div className="mt-1 font-mono break-all flex items-center gap-2">
            <span className="flex-1 truncate">{address || (generating ? 'Generating…' : 'Unavailable')}</span>
            {address && (
              <button onClick={copyAddress} className="rounded-md border border-neutral-700 px-2 py-1 text-sm hover:bg-neutral-800" title="Copy address">
                {copied ? '✅ Copied' : '📋 Copy'}
              </button>
            )}
          </div>
          <div className="mt-3 grid place-items-center">
            {address && (
              <img alt="qr" src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(address)}`} />
            )}
          </div>
          {address && chain === 'ton' && (
            <div className="mt-3 text-sm">
              <a className="text-blue-400 underline" href={`https://testnet.tonscan.org/address/${address}`} target="_blank" rel="noreferrer">Open in TonScan (testnet)</a>
              <div className="text-neutral-500 text-xs mt-1">New TON wallets won’t appear until they’re activated with a first transaction.</div>
            </div>
          )}
          <div className="text-neutral-500 text-xs mt-3">Only send {token.toUpperCase()} on {chain.toUpperCase()} to this address. Other assets may be lost.</div>

          <div className="mt-6 rounded-2xl bg-neutral-950">
            <div className="text-sm text-neutral-400 mb-2">Amount</div>
            <div className="text-xl">{amount} {token.toUpperCase()}</div>
            <button disabled={crediting || !address} onClick={creditPoints} className="mt-4 w-full rounded-full bg-blue-600 py-3 font-semibold disabled:opacity-50">{crediting ? 'Crediting…' : 'I have deposited'}</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-8 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-green-600 grid place-items-center text-white text-4xl">✓</div>
          <div className="mt-4 text-xl font-semibold">Deposit recorded</div>
          <div className="mt-2 text-neutral-400">{amount} {token.toUpperCase()} on {chain.toUpperCase()} credited as {(Math.round(Number(amount||0)*1000)).toLocaleString()} JP.</div>
          <div className="mt-2 text-xs text-neutral-500 font-mono">Tx Hash: <span className="break-all">{mockTxHash({ userId, amount, token, chain, createdAt: new Date().toISOString() })}</span></div>
          <div className="mt-6 flex gap-3">
            <Link href="/ledger" className="rounded-full bg-neutral-800 px-4 py-2">View ledger</Link>
            <button onClick={() => { setStep(1); setAmount('0'); }} className="rounded-full bg-blue-600 px-4 py-2">New deposit</button>
          </div>
        </div>
      )}
    </div>
  );
} 