"use client";
import { useState } from "react";
import { spendJP } from "@/lib/jp";
import { COUNTRIES, type CountryCode } from "@jetset/shared/dist/countries";

const OPTIONS = [
  { label: 'Basic (1 week)', jp: 20000, usd: 20, cashback: 3 },
  { label: 'Plus (2 weeks)', jp: 35000, usd: 35, cashback: 5 },
  { label: 'Premium (1 month)', jp: 60000, usd: 60, cashback: 7 },
];

export default function InsurancePage() {
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [country, setCountry] = useState<CountryCode>('TH');

  async function buy(plan: typeof OPTIONS[number]) {
    const { ok } = await spendJP(plan.jp, `Travel Insurance ${plan.label} (${country})`);
    if (ok) setConfirmed(`INS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
    else alert("Not enough JP");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-5 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Travel Insurance</h1>
        <div className="text-sm text-neutral-400">Pay with points • Instant cashback</div>
      </div>
      {!confirmed ? (
        <>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Country</label>
            <select value={country} onChange={(e) => setCountry(e.target.value as CountryCode)} className="border rounded px-2 py-1 text-black">
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="mt-5 space-y-4">
            {OPTIONS.map((o) => (
              <div key={o.label} className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{o.label}</div>
                    <div className="text-sm text-neutral-400">{o.jp.toLocaleString()} JP • ≈ ${o.usd}</div>
                  </div>
                  <div className="text-emerald-400 text-xs">{o.cashback}% cashback</div>
                </div>
                <button onClick={() => buy(o)} className="mt-3 w-full rounded-full bg-blue-600 py-3 font-semibold">Checkout</button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4 mt-6">
          <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-6">
            <div className="text-4xl">✅</div>
            <div className="text-xl font-semibold mt-2">Coverage active</div>
            <div className="text-neutral-400 mt-1">Confirmation: {confirmed}</div>
          </div>
          <a href="tel:+18001234567" className="fixed right-6 bottom-24 rounded-full bg-emerald-600 px-5 py-4 shadow-xl">Call Assistance</a>
        </div>
      )}
    </div>
  );
} 