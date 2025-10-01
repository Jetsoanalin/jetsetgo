"use client";
import { useEffect, useMemo, useState } from "react";
import { getPayments, type Payment } from "@/lib/payments";

const FLAG: Record<string, string> = { TH: "🇹🇭", IN: "🇮🇳", ID: "🇮🇩" };

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

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Places Paid</h1>
      <div className="rounded-2xl border p-4">
        <div className="text-sm text-neutral-600">Map mock</div>
        <div className="grid grid-cols-3 gap-3 mt-3 text-center">
          {Object.keys(byCountry).length === 0 && <div className="col-span-3 text-neutral-500">No locations yet</div>}
          {Object.entries(byCountry).map(([code, count]) => (
            <div key={code} className="rounded-xl border p-4">
              <div className="text-3xl">{FLAG[code] || '🏳️'}</div>
              <div className="text-sm mt-1">{code}</div>
              <div className="text-xs text-neutral-500">{count} payments</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 