"use client";
import { useState } from "react";
import { spendJP } from "@/lib/jp";
import { COUNTRIES, type CountryCode } from "@jetset/shared/dist/countries";

const PACKS = [
  { code: "TH", name: "Thailand", gb: 3, priceUSD: 5, jp: 5000, flag: "🇹🇭" },
  { code: "ID", name: "Indonesia", gb: 3, priceUSD: 5, jp: 5000, flag: "🇮🇩" },
  { code: "IN", name: "India", gb: 5, priceUSD: 7, jp: 7000, flag: "🇮🇳" },
];

export default function EsimPage() {
  const [done, setDone] = useState<{ country: string; pack: string } | null>(null);
  const [country, setCountry] = useState<CountryCode>('TH');

  function buy(p: (typeof PACKS)[number]) {
    const { ok } = spendJP(p.jp, `eSIM ${p.name} ${p.gb}GB`);
    if (ok) setDone({ country: p.name, pack: `${p.gb}GB` });
    else alert("Not enough JP");
  }

  const visible = PACKS.filter(p => p.code === country);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Buy Local eSIM</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Country</label>
        <select value={country} onChange={(e) => setCountry(e.target.value as CountryCode)} className="border rounded px-2 py-1 text-black">
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
          ))}
        </select>
      </div>

      {!done ? (
        <div className="grid gap-3">
          {visible.map((p) => (
            <button key={p.code} onClick={() => buy(p)} className="text-left rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.flag}</span>
                  <div>
                    <div className="font-semibold">{p.name} – {p.gb}GB</div>
                    <div className="text-sm text-neutral-400">{p.jp.toLocaleString()} JP (${p.priceUSD})</div>
                  </div>
                </div>
                <span>›</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-6">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-xl font-semibold">eSIM activated</div>
          <div className="text-neutral-400 mt-1">{done.country} • {done.pack}</div>
        </div>
      )}
    </div>
  );
} 