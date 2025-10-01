"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";
import { mockTxHash } from "@jetset/shared/dist/mockTx";

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[92%] rounded-full bg-neutral-900/95 border border-neutral-800 shadow-2xl backdrop-blur px-4 py-2 flex items-center justify-between">
      <Link href="/" className="flex flex-col items-center text-xs text-white"><span className="text-xl">🏠</span>Home</Link>
      <Link href="/topup" className="-mt-9"><div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl border-4 border-neutral-900 shadow-xl">＋</div></Link>
      <Link href="/utilities" className="flex flex-col items-center text-xs text-neutral-400"><span className="text-xl">🧰</span>Utilities</Link>
    </nav>
  );
}

export default function LedgerPage() {
  const supabase = getSupabaseClient();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setItems([]);
      try {
        const r = await fetch(`/api/points?userId=${user.id}`);
        const j = await r.json();
        setItems(j.ledger || []);
      } catch {
        setItems([]);
      }
    }
    load();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="px-5 pt-6 pb-4 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl">←</Link>
          <div className="text-lg font-semibold">Points Ledger</div>
          <div className="w-6" />
        </div>
      </div>

      <div className="px-5 pb-28">
        <ul className="mt-4 space-y-3">
          {items.map((tx: any) => {
            const hash = mockTxHash({ id: tx.id, createdAt: tx.createdAt, deltaJP: tx.deltaJP, desc: tx.description });
            const short = `${hash.slice(0,10)}…${hash.slice(-6)}`;
            return (
              <li key={tx.id} className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 flex items-center justify-between">
                <div>
                  <div className="text-neutral-300">{tx.description || 'Points update'}</div>
                  <div className="text-xs text-neutral-500">{new Date(tx.createdAt).toLocaleString()} • {short}</div>
                </div>
                <div className={tx.deltaJP >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {tx.deltaJP >= 0 ? '+' : ''}{tx.deltaJP} JP
                </div>
              </li>
            );
          })}
          {items.length === 0 && <li className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 text-neutral-500">No ledger items yet</li>}
        </ul>
      </div>

      <BottomNav />
    </div>
  );
} 