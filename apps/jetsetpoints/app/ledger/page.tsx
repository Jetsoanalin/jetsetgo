"use client";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";

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
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Points Ledger</h1>
      <ul className="space-y-3">
        {items.map((tx: any) => (
          <li key={tx.id} className="rounded border p-3 flex items-center justify-between">
            <div>
              <div className="text-sm">{tx.description || 'Points update'}</div>
              <div className="text-xs text-neutral-500">{new Date(tx.createdAt).toLocaleString()}</div>
            </div>
            <div className={tx.deltaJP >= 0 ? 'text-emerald-600' : 'text-red-600'}>
              {tx.deltaJP >= 0 ? '+' : ''}{tx.deltaJP} JP
            </div>
          </li>
        ))}
        {items.length === 0 && <div className="text-neutral-500">No ledger items yet</div>}
      </ul>
    </div>
  );
} 