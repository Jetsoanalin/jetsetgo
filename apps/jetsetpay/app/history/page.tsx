"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPayments, type Payment } from "@/lib/payments";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";
import { mockTxHash } from "@jetset/shared/dist/mockTx";
import BottomNav from "@/components/BottomNav";

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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="px-5 pt-6 pb-4 bg-gradient-to-b from-neutral-900 to-neutral-950 flex items-center justify-between">
        <div className="text-2xl font-bold">Recent Transactions</div>
        <Link href="/map" className="rounded-full bg-neutral-800 px-3 py-1 text-sm text-neutral-300">Map</Link>
      </div>

      <div className="px-5 pb-28">
        <ul className="mt-4 space-y-3">
          {items.map((tx) => {
            const hash = mockTxHash({ id: tx.id, userId: tx.userId, createdAt: tx.createdAt, amount: tx.amount, currency: tx.currency, method: tx.method, merchantId: tx.merchantId });
            const short = `${hash.slice(0,10)}…${hash.slice(-6)}`;
            const isCredit = tx.merchantId === 'ADMIN_TOPUP';
            return (
              <li key={tx.id} className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 flex items-center justify-between">
                <div>
                  <div className="text-neutral-300">
                    {isCredit ? 'DEPOSIT • Mastercard • 5173 • Deposit' : (tx.merchantId || 'Payment')} {tx.placeName ? `• ${tx.placeName}` : ''}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">{new Date(tx.createdAt).toLocaleString()} {tx.countryCode ? `• ${tx.countryCode}` : ''} • {short}</div>
                </div>
                <div className={`text-right ${isCredit ? 'text-emerald-400' : ''}`}>
                  <div className="font-semibold">{tx.amount} {tx.currency}</div>
                  <div className="text-xs"><Link href={`/receipt?id=${tx.id}`} className="underline">Receipt</Link></div>
                </div>
              </li>
            );
          })}
          {items.length === 0 && <div className="text-neutral-500">No transactions yet</div>}
        </ul>
      </div>

      <BottomNav active="home" />
    </div>
  );
} 