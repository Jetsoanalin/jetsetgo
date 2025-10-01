"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";
import { mockTxHash } from "@jetset/shared/dist/mockTx";

export default function SuccessPage() {
  const params = useSearchParams();
  const id = params.get('id');
  const [tx, setTx] = useState<any | null>(null);
  const [qr, setQr] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    async function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }
    async function fetchById(pid: string): Promise<any | null> {
      const r = await fetch(`/api/payments/${pid}`);
      const j = await r.json();
      if (j.ok && j.data) return j.data;
      return null;
    }

    async function load() {
      try {
        if (id) {
          let found: any | null = null;
          for (let i = 0; i < 20; i++) {
            found = await fetchById(id);
            if (found) break;
            await sleep(500);
          }
          if (found) { setTx(found); return; }
          setError('Receipt not available yet. Please wait a moment and refresh.');
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError('Not found'); return; }
        const r2 = await fetch(`/api/payments?userId=${user.id}`);
        const j2 = await r2.json();
        if (j2.ok && Array.isArray(j2.data) && j2.data.length > 0) {
          setTx(j2.data[0]);
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('id', j2.data[0].id);
            window.history.replaceState({}, '', url.toString());
          }
        } else {
          setError('Not found');
        }
      } catch (e: any) { setError(e?.message || 'error'); }
    }
    load();
  }, [id, supabase]);

  useEffect(() => {
    async function loadQr() {
      if (!tx?.id) return;
      try {
        const r = await fetch(`/api/payment-qr-details?paymentId=${tx.id}`);
        const j = await r.json();
        if (j.ok) setQr(j.data);
      } catch {}
    }
    loadQr();
  }, [tx?.id]);

  const txHash = useMemo(() => tx ? mockTxHash({ id: tx.id, userId: tx.userId, createdAt: tx.createdAt, amount: tx.amount, currency: tx.currency, method: tx.method, merchantId: tx.merchantId }) : null, [tx]);

  if (error && !tx) return <div className="min-h-screen p-6 text-white">{error}</div>;
  if (!tx) return <div className="min-h-screen p-6 text-white">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="px-6 pt-10 pb-4">
        <h1 className="text-3xl font-bold">Receipt</h1>
      </div>
      <div className="px-6 pb-28">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
            <div className="flex items-center gap-3 text-emerald-400 text-2xl font-semibold">
              <div className="h-10 w-10 rounded-lg bg-emerald-500 grid place-items-center text-black">✓</div>
              {tx.method === 'points' ? 'Points redeem successful' : 'Payment successful'}
            </div>
            <div className="text-neutral-400 mt-1">{new Date(tx.createdAt).toLocaleString()}</div>
            <div className="text-5xl font-bold mt-4">{tx.amount} {tx.currency}</div>
            {txHash && (
              <div className="mt-2 text-xs text-neutral-500 font-mono">Tx Hash: <span className="break-all">{txHash}</span></div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl border border-neutral-800 p-4">
              <div className="text-neutral-400">Merchant Name</div>
              <div className="font-medium">{tx.placeName || qr?.merchantname || tx.merchantId}</div>
            </div>
            <div className="rounded-2xl border border-neutral-800 p-4">
              <div className="text-neutral-400">Merchant ID</div>
              <div className="font-medium">{tx.merchantId}</div>
            </div>
            {qr?.ref2 && (
              <div className="rounded-2xl border border-neutral-800 p-4 col-span-2">
                <div className="text-neutral-400">Payment Number</div>
                <div className="font-medium break-all">{qr.ref2}</div>
              </div>
            )}
          </div>

          {qr?.rawpayload && (
            <div className="mt-6 grid place-items-center">
              <div className="rounded-2xl border border-neutral-800 p-4">
                <div className="text-center text-neutral-400 text-sm mb-2">Scan to view this receipt</div>
                <img alt="qr" src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent((typeof window !== 'undefined' ? window.location.origin : '') + '/api/payments/' + tx.id)}`} />
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button onClick={() => window.print()} className="rounded-full bg-blue-600 px-5 py-3">Print</button>
            <Link href="/" className="rounded-full border border-neutral-700 px-5 py-3">Done</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 