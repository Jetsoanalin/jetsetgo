"use client";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { addPayment } from "@/lib/payments";
import { COUNTRIES, convertLocalToJP, type CountryCode, getCountry } from "@jetset/shared/dist/countries";
import { decodeThaiPromptPay } from "@jetset/shared/dist/thaiPromptpay";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";
import { PageHeader, Card } from "@/components/UI";
import { SlideToPay } from "@/components/SlideToPay";

function parsePayload(text: string) {
  return decodeURIComponent(text);
}

export default function ConfirmPage() {
  const params = useSearchParams();
  const router = useRouter();
  const payload = params.get("payload") || "";
  const [countryCode, setCountryCode] = useState<CountryCode>('TH');
  const [placeName, setPlaceName] = useState<string>("");
  const [method, setMethod] = useState<"wallet" | "points">('wallet');
  const [amount, setAmount] = useState<number>(0);
  const [decoded, setDecoded] = useState<any[]>([]);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const c = getCountry(countryCode);
    (async () => {
      try {
        // Use shared decoder for TH
        if (countryCode === 'TH') {
          const d = decodeThaiPromptPay(parsePayload(payload));
          setDecoded(d);
        } else {
          setDecoded([]);
        }
      } catch { setDecoded([]); }
    })();
  }, [payload, countryCode]);

  const bill = useMemo(() => decoded.find(d => d.mode === 'bill_payment') || null, [decoded]);
  const credit = useMemo(() => decoded.find(d => d.mode === 'credit_transfer') || null, [decoded]);
  const pointsNeeded = useMemo(() => convertLocalToJP(amount, countryCode), [amount, countryCode]);

  async function onPay() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (method === 'points') {
      // deduct points via API
      const r = await fetch('/api/points', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: user.id, balance: undefined, deltaJP: -pointsNeeded, description: `Spend at ${bill?.merchantName || credit?.merchantName || 'Merchant'}` }) });
      // record payment
      const tx = await addPayment({ userId: user.id, merchantId: bill?.billerId || credit?.proxyId || 'PROMPTPAY', amount, currency: getCountry(countryCode).currencyCode, method: 'points', countryCode, placeName: placeName || bill?.merchantName || credit?.merchantName });
      router.replace(`/success?id=${tx.id}`);
      return;
    } else {
      // deduct wallet USD equivalent is not needed; we store local amount payment entry and update wallet only if using USD wallet
      const tx = await addPayment({ userId: user.id, merchantId: bill?.billerId || credit?.proxyId || 'PROMPTPAY', amount, currency: getCountry(countryCode).currencyCode, method: 'wallet', countryCode, placeName: placeName || bill?.merchantName || credit?.merchantName });
      router.replace(`/success?id=${tx.id}`);
      return;
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PageHeader title="Confirm payment" subtitle="Review details and choose how to pay" />

      <div className="px-5 pb-28 max-w-2xl mx-auto">
        <Card className="space-y-4">
          <div className="flex items-center justify-between text-sm text-neutral-400">
            <div>Country</div>
            <div className="text-neutral-300">{countryCode}</div>
          </div>
        {bill && (
          <Card>
            <div className="text-neutral-400 text-sm">PromptPay Bill Payment</div>
            <div className="mt-2 space-y-1">
              <div>Biller ID: <span className="font-mono text-neutral-200">{bill.billerId}</span></div>
              {bill.merchantName && <div>Name: <span className="text-neutral-200">{bill.merchantName}</span></div>}
              {bill.ref1 && <div>Ref1: <span className="font-mono text-neutral-200">{bill.ref1}</span></div>}
              {bill.ref2 && <div>Ref2: <span className="font-mono text-neutral-200">{bill.ref2}</span></div>}
            </div>
          </Card>
        )}
        {!bill && credit && (
          <Card>
            <div className="text-neutral-400 text-sm">PromptPay Credit Transfer</div>
            <div className="mt-2 space-y-1">
              {credit.proxyId && <div>Proxy: <span className="font-mono text-neutral-200">{credit.proxyId}</span></div>}
              {credit.merchantName && <div>Name: <span className="text-neutral-200">{credit.merchantName}</span></div>}
            </div>
          </Card>
        )}

        <div className="mt-2">
          <label className="block text-sm text-neutral-400 mb-1">Amount ({getCountry(countryCode).currencyCode})</label>
          <input type="number" inputMode="decimal" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-3 text-lg" placeholder="0.00" />
          <div className="text-xs text-neutral-500 mt-1">If paying with Points: {pointsNeeded.toLocaleString()} JP</div>
        </div>

        <div className="mt-4 rounded-full border border-neutral-700 p-1 flex items-center gap-1 w-full">
          <button onClick={() => setMethod('wallet')} className={`flex-1 px-4 py-2 rounded-full text-sm ${method==='wallet' ? 'bg-blue-600' : ''}`}>Wallet</button>
          <button onClick={() => setMethod('points')} className={`flex-1 px-4 py-2 rounded-full text-sm ${method==='points' ? 'bg-blue-600' : ''}`}>Points</button>
        </div>

        <div className="mt-6">
          <SlideToPay onComplete={onPay} />
        </div>
      </Card>

      <div className="mt-6 px-5">
        <Link href="/scan" className="underline">Back</Link>
      </div>
      </div>
    </div>
  );
} 