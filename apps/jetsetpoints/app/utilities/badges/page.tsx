"use client";
import { useEffect, useState } from "react";
import { getBadges, getVisitedCountries } from "@/lib/jp";

const COUNTRY_NAMES: Record<string, string> = { TH: "Thailand", IN: "India", ID: "Indonesia" };

export default function BadgesPage() {
  const [visited, setVisited] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    setVisited(getVisitedCountries());
    setBadges(getBadges());
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Proof-of-Travel</h1>
      <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
        <div className="text-neutral-400 text-sm">Visited countries</div>
        <div className="mt-2 grid grid-cols-3 gap-3 text-center">
          {visited.length === 0 && <div className="col-span-3 text-neutral-500">No visits yet</div>}
          {visited.map((c) => (
            <div key={c} className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
              <div className="text-2xl">{c === 'TH' ? '🇹🇭' : c === 'IN' ? '🇮🇳' : c === 'ID' ? '🇮🇩' : '🏳️'}</div>
              <div className="text-sm mt-1">{COUNTRY_NAMES[c] || c}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
        <div className="text-neutral-400 text-sm">Badges</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {badges.length === 0 && <div className="text-neutral-500">No badges yet</div>}
          {badges.map((b) => (
            <span key={b} className="rounded-full bg-neutral-900 border border-neutral-800 px-3 py-1 text-sm">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
} 