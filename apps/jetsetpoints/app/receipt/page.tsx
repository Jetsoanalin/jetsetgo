"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";
import { mockTxHash } from "@jetset/shared/dist/mockTx";

export default function JPReceiptPage() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get('id');
  const supabase = getSupabaseClient();
  const [row, setRow] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !id) { setErr('Not found'); return; }
        const r = await fetch(`/api/points?userId=${user.id}`);
        const j = await r.json();
        const f = (j?.ledger || []).find((x: any) => x.id === id);
        if (f) setRow(f); else setErr('Not found');
      } catch (e: any) { setErr(e?.message || 'error'); }
    }
    load();
  }, [id, supabase]);

  if (!id) return <div className="min-h-screen p-6 text-white bg-[#0a0a0a]">Missing id</div>;
  if (err) return <div className="min-h-screen p-6 text-white bg-[#0a0a0a]">{err}</div>;
  if (!row) return <div className="min-h-screen p-6 text-white bg-[#0a0a0a]">Loading…</div>;

  const hash = mockTxHash({ id: row.id, createdAt: row.createdAt, deltaJP: row.deltaJP, desc: row.description });

  return (
    <div className="min-h-screen p-6 text-white bg-[#0a0a0a]">
      <div className="rounded-3xl border border-neutral-800 p-6 bg-neutral-950 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Receipt</h1>
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
          <div className={`flex items-center gap-3 ${row.deltaJP >= 0 ? 'text-emerald-400' : 'text-red-400'} text-2xl font-semibold`}>
            <div className={`h-10 w-10 rounded-lg ${row.deltaJP >= 0 ? 'bg-emerald-500' : 'bg-red-500'} grid place-items-center text-black`}>✓</div>
            {row.deltaJP >= 0 ? 'Points credit' : 'Points redeemed'}
          </div>
          <div className="text-neutral-400 mt-1">{new Date(row.createdAt).toLocaleString()}</div>
          <div className="text-5xl font-bold mt-4">{row.deltaJP >= 0 ? '+' : ''}{row.deltaJP} JP</div>
          <div className="mt-2 text-xs text-neutral-500 font-mono">Tx Hash: <span className="break-all">{hash}</span></div>
        </div>
        <div className="mt-6 rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
          <div className="text-neutral-400 text-sm">Description</div>
          <div className="font-medium">{row.description || 'Points update'}</div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={() => window.print()} className="rounded-full bg-blue-600 px-5 py-3">Print</button>
          <button onClick={() => router.back()} className="rounded-full border border-neutral-700 px-5 py-3">Go back</button>
        </div>
      </div>
    </div>
  );
} 