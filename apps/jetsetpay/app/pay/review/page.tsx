"use client";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSelectedCountry } from "@jetset/shared/dist/prefs";
import { getCountry } from "@jetset/shared/dist/countries";
import { convertLocalToJP } from "@jetset/shared/dist/countries";
import { PageHeader, Card } from "@/components/UI";
import { SlideToPay } from "@/components/SlideToPay";
import { decodeThaiPromptPay } from "@jetset/shared/dist/thaiPromptpay";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";
import { addPayment } from "@/lib/payments";

export default function ReviewPage() {
  const params = useSearchParams();
  const router = useRouter();
  const payload = params.get('payload') || '';
  const amount = Number(params.get('amount') || '0');
  const code = getSelectedCountry('TH');
  const country = useMemo(() => getCountry(code), [code]);
  const [decoded, setDecoded] = useState<any[]>([]);
  const [method, setMethod] = useState<'wallet'|'points'>('wallet');
  const [submitting, setSubmitting] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (code === 'TH') setDecoded(decodeThaiPromptPay(payload));
    else setDecoded([]);
  }, [payload, code]);

  const bill = useMemo(() => decoded.find((d: any) => d.mode === 'bill_payment') || null, [decoded]);
  const credit = useMemo(() => decoded.find((d: any) => d.mode === 'credit_transfer') || null, [decoded]);
  const jpNeeded = useMemo(() => convertLocalToJP(amount, code), [amount, code]);

  async function onPay() {
    if (submitting) return;
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // If paying with points, deduct from points balance and write ledger
    if (method === 'points') {
      try {
        const r = await fetch(`/api/points?userId=${user.id}`);
        const j = await r.json();
        const curBal = Number(j?.balance?.balance || 0);
        const newBal = Math.max(0, curBal - jpNeeded);
        await fetch('/api/points', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: user.id, balance: newBal, deltaJP: -jpNeeded, description: `Points redeemed at ${bill?.merchantName || credit?.merchantName || 'Merchant'}` }) });
      } catch {}
    }

    const tx = await addPayment({ userId: user.id, merchantId: bill?.billerId || credit?.proxyId || 'PROMPTPAY', amount, currency: country.currencyCode, method, countryCode: code, placeName: bill?.merchantName || credit?.merchantName, extra: { scheme: 'promptpay' }, fxSnapshot: null, createdAt: new Date().toISOString(), pointsRedeemed: method === 'points' ? jpNeeded : 0 });

    // Deduct wallet USD is handled elsewhere; keep only points logic here to avoid duplicates

    // Persist QR details
    try {
      const chosen = bill || credit;
      if (chosen) {
        const resp = await fetch('/api/payment-qr-details', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
          paymentId: tx.id,
          scheme: 'promptpay',
          mode: chosen.mode,
          aid: chosen.aid,
          billerId: chosen.billerId,
          proxyId: chosen.proxyId,
          merchantName: chosen.merchantName,
          ref1: chosen.ref1,
          ref2: chosen.ref2,
          rawPayload: payload,
          decoded: chosen,
        }) });
        // eslint-disable-next-line no-console
        console.log('qr-details status', resp.status);
      }
    } catch {}
    setTimeout(() => router.replace(`/success?id=${tx.id}`), 200);
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PageHeader title="Payment" subtitle={`Balance • ${country.currencyCode}`} />
      <div className="px-6 pb-28">
        <div className="text-center mt-6">
          <div className="text-[88px] font-semibold">{country.currencyCode === 'THB' ? '฿' : ''}{amount}</div>
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 mt-2 text-neutral-300">1 USD = {getCountry('TH').per1000JP.toFixed(2)} {country.currencyCode}</div>
        </div>

        <Card className="mt-6 text-sm">
          <div className="flex items-center justify-between"><div className="text-neutral-400">From</div><div>JetSet Pvt Ltd account</div></div>
          <div className="h-px my-3 bg-neutral-800" />
          <div className="flex items-center justify-between"><div className="text-neutral-400">To</div><div>{bill?.merchantName || credit?.merchantName || 'Merchant'}</div></div>
          <div className="h-px my-3 bg-neutral-800" />
          <div className="flex items-center justify-between"><div className="text-neutral-400">Exchange rate</div><div>1 USD = {getCountry('TH').per1000JP.toFixed(2)} {country.currencyCode}</div></div>
          <div className="h-px my-3 bg-neutral-800" />
          <div className="flex items-center justify-between"><div className="text-neutral-400">Our fees</div><div>Free</div></div>
          <div className="h-px my-3 bg-neutral-800" />
          <div className="flex items-center justify-between"><div className="text-neutral-400">Points to be used</div><div>{jpNeeded.toLocaleString()} JP</div></div>
        </Card>

        <div className="mt-4 rounded-full border border-neutral-700 p-1 flex items-center gap-1 w-full">
          <button onClick={() => setMethod('wallet')} className={`flex-1 px-4 py-2 rounded-full text-sm ${method==='wallet' ? 'bg-blue-600' : ''}`}>Wallet</button>
          <button onClick={() => setMethod('points')} className={`flex-1 px-4 py-2 rounded-full text-sm ${method==='points' ? 'bg-blue-600' : ''}`}>Points</button>
        </div>

        <div className="mt-6">
          <SlideToPay onComplete={onPay} />
        </div>
      </div>
    </div>
  );
} 