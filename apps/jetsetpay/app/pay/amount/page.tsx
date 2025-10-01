"use client";
import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSelectedCountry } from "@jetset/shared/dist/prefs";
import { getCountry, convertLocalToUSD } from "@jetset/shared/dist/countries";
import { PageHeader, Card } from "@/components/UI";

export default function AmountPage() {
  const params = useSearchParams();
  const router = useRouter();
  const payload = params.get('payload') || '';
  const code = getSelectedCountry('TH');
  const country = useMemo(() => getCountry(code), [code]);
  const [amount, setAmount] = useState<string>('');

  function onDigit(d: string) {
    if (d === 'back') { setAmount(a => a.slice(0, -1)); return; }
    if (d === '.' && amount.includes('.')) return;
    setAmount(a => (a + d).replace(/^0(\d)/, '$1'));
  }

  const num = Number(amount || '0');
  const usd = convertLocalToUSD(num, code);

  function review() {
    const qs = new URLSearchParams({ payload, amount: String(num) }).toString();
    router.replace(`/pay/review?${qs}`);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PageHeader title="Payment" subtitle={`Balance • ${country.currencyCode}`} />
      <div className="px-6 pb-32">
        <div className="text-center mt-6">
          <div className="text-[88px] font-semibold">{country.currencyCode === 'THB' ? '฿' : ''}{amount || '0'}</div>
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 mt-2 text-neutral-300">
            🇺🇸 {usd.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
          </div>
        </div>

        <button onClick={review} className="mt-6 w-full rounded-full bg-blue-600 py-4 text-lg font-semibold">Review</button>

        <div className="mt-6 grid grid-cols-3 gap-3 text-2xl">
          {['1','2','3','4','5','6','7','8','9','.','0','back'].map(k => (
            <button key={k} onClick={() => onDigit(k)} className="rounded-2xl border border-neutral-800 bg-neutral-950 py-6">
              {k === 'back' ? '↩' : k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 