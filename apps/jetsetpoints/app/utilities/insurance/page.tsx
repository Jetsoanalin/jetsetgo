"use client";
import { useState } from "react";
import { spendJP } from "@/lib/jp";
import { COUNTRIES, type CountryCode } from "@jetset/shared/dist/countries";

export default function InsurancePage() {
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [country, setCountry] = useState<CountryCode>('TH');

  function buy() {
    const { ok } = spendJP(20000, `Travel Insurance 1 week (${country})`);
    if (ok) setConfirmed(`INS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
    else alert("Not enough JP");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Travel Insurance</h1>
      {!confirmed ? (
        <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-6">
          <div className="text-lg font-semibold">Weekly package</div>
          <div className="text-neutral-400 text-sm mt-1">20,000 JP = 1 week coverage</div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Country</label>
            <select value={country} onChange={(e) => setCountry(e.target.value as CountryCode)} className="border rounded px-2 py-1 text-black">
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
          <button onClick={buy} className="mt-4 w-full rounded-full bg-blue-600 py-3 font-semibold">Buy 1 week</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-6">
            <div className="text-4xl">✅</div>
            <div className="text-xl font-semibold mt-2">Coverage active</div>
            <div className="text-neutral-400 mt-1">Confirmation: {confirmed}</div>
          </div>
          <a href="tel:+18001234567" className="fixed right-6 bottom-6 rounded-full bg-emerald-600 px-5 py-4 shadow-xl">Call Assistance</a>
        </div>
      )}
    </div>
  );
} 