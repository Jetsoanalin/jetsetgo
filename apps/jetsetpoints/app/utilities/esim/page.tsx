"use client";
import { useState } from "react";
import { spendJP } from "@/lib/jp";
import { COUNTRIES, type CountryCode } from "@jetset/shared/dist/countries";

const PACKS = [
  { code: "TH", name: "Thailand", variants: [ { gb: 3, priceUSD: 5, jp: 5000 }, { gb: 10, priceUSD: 12, jp: 12000 }, { gb: 20, priceUSD: 18, jp: 18000 } ], flag: "🇹🇭" },
  { code: "ID", name: "Indonesia", variants: [ { gb: 3, priceUSD: 5, jp: 5000 }, { gb: 10, priceUSD: 10, jp: 10000 }, { gb: 20, priceUSD: 16, jp: 16000 } ], flag: "🇮🇩" },
  { code: "IN", name: "India", variants: [ { gb: 5, priceUSD: 7, jp: 7000 }, { gb: 10, priceUSD: 12, jp: 12000 }, { gb: 20, priceUSD: 18, jp: 18000 } ], flag: "🇮🇳" },
];

export default function EsimPage() {
  const [done, setDone] = useState<{ country: string; pack: string } | null>(null);
  const [country, setCountry] = useState<CountryCode>('TH');

  function buy(p: { gb: number; priceUSD: number; jp: number }, name: string) {
    const { ok } = spendJP(p.jp, `eSIM ${name} ${p.gb}GB`);
    if (ok) setDone({ country: name, pack: `${p.gb}GB` });
    else alert("Not enough JP");
  }

  const base = PACKS.find(p => p.code === country);
  const meta = COUNTRIES.find(c => c.code === country);
  const cfg = base || { code: country, name: meta?.name || 'Selected country', flag: meta?.flag || '🏳️', variants: [ { gb: 3, priceUSD: 5, jp: 5000 }, { gb: 10, priceUSD: 12, jp: 12000 }, { gb: 20, priceUSD: 18, jp: 18000 } ] } as any;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-5 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Buy Local eSIM</h1>
        <div className="text-sm text-neutral-400">Pay with JetSet Points</div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Country</label>
        <select value={country} onChange={(e) => setCountry(e.target.value as CountryCode)} className="border rounded px-2 py-1 text-black">
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
          ))}
        </select>
      </div>

      {!done ? (
        <div className="mt-5 space-y-4">
          {cfg.variants.map((v: any) => (
            <div key={v.gb} className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cfg.flag}</span>
                  <div>
                    <div className="font-semibold">{cfg.name} – {v.gb}GB</div>
                    <div className="text-sm text-neutral-400">{v.jp.toLocaleString()} JP • ≈ ${v.priceUSD}</div>
                  </div>
                </div>
                <div className="text-emerald-400 text-xs">3% cashback</div>
              </div>
              <button onClick={() => buy(v, cfg.name)} className="mt-3 w-full rounded-full bg-blue-600 py-3 font-semibold">Checkout</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-6 mt-6">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-xl font-semibold">eSIM activated</div>
          <div className="text-neutral-400 mt-1">{done.country} • {done.pack}</div>
        </div>
      )}
    </div>
  );
} 