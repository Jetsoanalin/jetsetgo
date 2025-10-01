"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ReceiptPage() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get('id');
  const [tx, setTx] = useState<any | null>(null);
  const [qr, setQr] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch(`/api/payments/${id}`);
        const j = await r.json();
        if (j.ok) setTx(j.data); else setError(j.error);
      } catch (e: any) { setError(e?.message||'error'); }
    }
    if (id) load();
  }, [id]);

  useEffect(() => {
    async function loadQr() {
      if (!id) return;
      try {
        const r = await fetch(`/api/payment-qr-details?paymentId=${id}`);
        const j = await r.json();
        if (j.ok) setQr(j.data);
      } catch {}
    }
    loadQr();
  }, [id]);

  if (!id) return <div className="min-h-screen p-6 max-w-2xl mx-auto text-white bg-[#0a0a0a]">Missing id.</div>;
  if (error) return <div className="min-h-screen p-6 max-w-2xl mx-auto text-white bg-[#0a0a0a]">{error}</div>;
  if (!tx) return <div className="min-h-screen p-6 max-w-2xl mx-auto text-white bg-[#0a0a0a]">Loading…</div>;

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto text-white bg-[#0a0a0a]">
      <div className="rounded-3xl border border-neutral-800 p-6 bg-neutral-950">
        <h1 className="text-3xl font-bold mb-4">Receipt</h1>

        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
          <div className="flex items-center gap-3 text-emerald-400 text-2xl font-semibold">
            <div className="h-10 w-10 rounded-lg bg-emerald-500 grid place-items-center text-black">✓</div>
            {tx.method === 'points' ? 'Points redeem successful' : 'Payment successful'}
          </div>
          <div className="text-neutral-400 mt-1">{new Date(tx.createdAt).toLocaleString()}</div>
          <div className="text-5xl font-bold mt-4">{tx.amount} {tx.currency}</div>
          {tx.method === 'points' && (
            <div className="text-neutral-300 mt-2 text-sm">Points redeemed: {Number(tx.pointsredeemed || 0).toLocaleString()} JP</div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl border border-neutral-800 p-4">
            <div className="text-neutral-400">Merchant Name</div>
            <div className="font-medium">{tx.placeName || qr?.merchantname || (tx.merchantId === 'ADMIN_TOPUP' ? 'Admin Credit' : tx.merchantId)}</div>
          </div>
          <div className="rounded-2xl border border-neutral-800 p-4">
            <div className="text-neutral-400">Merchant ID</div>
            <div className="font-medium">{tx.merchantId}</div>
          </div>
          <div className="rounded-2xl border border-neutral-800 p-4">
            <div className="text-neutral-400">Method</div>
            <div className="font-medium">{tx.method === 'points' ? 'Points' : 'Wallet'}</div>
          </div>
          <div className="rounded-2xl border border-neutral-800 p-4">
            <div className="text-neutral-400">Country</div>
            <div className="font-medium">{tx.countryCode || '-'}</div>
          </div>
          {qr?.ref2 && (
            <div className="rounded-2xl border border-neutral-800 p-4 col-span-2">
              <div className="text-neutral-400">Payment Number</div>
              <div className="font-medium break-all">{qr.ref2}</div>
            </div>
          )}
        </div>

        {id && (
          <div className="mt-8 grid place-items-center">
            <div className="rounded-2xl border border-neutral-800 p-4">
              <div className="text-center text-neutral-400 text-sm mb-2">Scan to view this receipt</div>
              <img alt="qr" src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent((typeof window !== 'undefined' ? window.location.origin : '') + '/api/payments/' + id)}`} />
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button onClick={() => window.print()} className="rounded-full bg-blue-600 px-5 py-3">Print</button>
          <button onClick={() => router.back()} className="rounded-full border border-neutral-700 px-5 py-3">Go back</button>
        </div>
      </div>
    </div>
  );
} 