"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPayments, type Payment } from "@/lib/payments";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";

export default function HistoryPage() {
  const supabase = getSupabaseClient();
  const [items, setItems] = useState<Payment[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const r = await fetch(`/api/payments?userId=${user.id}`);
          const j = await r.json();
          if (j.ok) setItems(j.data || []); else setItems([]);
        } catch {
          setItems(getPayments());
        }
      } else {
        setItems(getPayments());
      }
    }
    load();
  }, [supabase]);

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Recent Transactions</h1>
        <Link href="/map" className="text-blue-600">Map</Link>
      </div>
      <ul className="space-y-3">
        {items.map((tx) => (
          <li key={tx.id} className="rounded border p-3 flex items-center justify-between">
            <div>
              <div className="text-sm">{tx.merchantId === 'ADMIN_TOPUP' ? 'Admin Credit' : tx.merchantId} {tx.placeName ? `• ${tx.placeName}` : ''}</div>
              <div className="text-xs text-neutral-500">{new Date(tx.createdAt).toLocaleString()} {tx.countryCode ? `• ${tx.countryCode}` : ''}</div>
            </div>
            <div className={tx.merchantId === 'ADMIN_TOPUP' ? 'text-emerald-600' : ''}>
              {tx.amount} {tx.currency}
              <div className="text-xs"><Link href={`/receipt?id=${tx.id}`} className="underline">Receipt</Link></div>
            </div>
          </li>
        ))}
        {items.length === 0 && <div className="text-neutral-500">No transactions yet</div>}
      </ul>
    </div>
  );
} 