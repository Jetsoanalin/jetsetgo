"use client";
import { useEffect, useMemo, useState } from "react";
import { getPayments, type Payment } from "@/lib/payments";
import BottomNav from "@/components/BottomNav";

const FLAG: Record<string, string> = { TH: "🇹🇭", IN: "🇮🇳", ID: "🇮🇩", US: "🇺🇸" };

export default function PaymentsMapPage() {
  const [items, setItems] = useState<Payment[]>([]);
  useEffect(() => { setItems(getPayments()); }, []);

  const byCountry = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of items) {
      if (!p.countryCode) continue;
      map[p.countryCode] = (map[p.countryCode] || 0) + 1;
    }
    return map;
  }, [items]);

  const total = Object.values(byCountry).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="px-5 pt-6 pb-4 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">Places Paid</div>
          <div className="rounded-full bg-neutral-800 px-3 py-1 text-sm text-neutral-300">{total} total</div>
        </div>
      </div>

      <div className="px-5 pb-28">
        <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
          <div className="text-neutral-400 text-sm">Map mock</div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.keys(byCountry).length === 0 && (
              <div className="col-span-2 text-neutral-500">No locations yet</div>
            )}
            {Object.entries(byCountry).map(([code, count]) => {
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={code} className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">{FLAG[code] || '🏳️'}</div>
                      <div>
                        <div className="font-semibold">{code}</div>
                        <div className="text-xs text-neutral-500">{count} payments</div>
                      </div>
                    </div>
                    <div className="text-sm text-neutral-400">{pct}%</div>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded mt-3">
                    <div className="h-2 bg-blue-500 rounded" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
} 