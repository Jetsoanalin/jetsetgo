"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";
import { addPayment } from "@/lib/payments";

export default function TopupReviewPage() {
  const params = useSearchParams();
  const router = useRouter();
  const amount = Number(params.get('amount') || '0');
  const [method, setMethod] = useState<'card'|'sepa'|'ukbank'>('card');
  const [showMethods, setShowMethods] = useState(false);
  const feeRate = 0.025; // 2.5%
  const bankFee = Number((amount * feeRate).toFixed(2));
  const total = Number((amount + bankFee).toFixed(2));
  const supabase = getSupabaseClient();

  function methodLabel(m: 'card'|'sepa'|'ukbank') {
    if (m === 'card') return 'Mastercard • 5173';
    if (m === 'sepa') return 'European bank (SEPA)';
    return 'United Kingdom bank (FAST)';
  }

  async function onAdd() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
      // Update wallet USD balance (add amount)
      const wr = await fetch(`/api/wallet?userId=${user.id}&currency=USD`);
      const wj = await wr.json();
      const current = Number(wj?.balance || 0);
      const newBalance = Number((current + amount).toFixed(2));
      await fetch('/api/wallet', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: user.id, currency: 'USD', newBalance }) });
      // Create a deposit payment record for receipt
      const tx = await addPayment({ userId: user.id, merchantId: 'DEPOSIT', amount, currency: 'USD', method: 'wallet', countryCode: 'US', placeName: `${methodLabel(method)} • Deposit`, createdAt: new Date().toISOString() });
      router.replace(`/success?id=${tx.id}`);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-28">
      <div className="text-lg text-neutral-400 mb-4">Add money</div>
      <div className="text-center mb-6">
        <div className="text-[80px] leading-none">${amount.toFixed(0)}</div>
      </div>

      <div className="rounded-2xl bg-neutral-950 border border-neutral-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="text-neutral-400">Paying in</div>
          <div>🇺🇸 USD ▴</div>
        </div>
        <div className="h-px bg-neutral-800" />
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-neutral-400">Paying with</div>
            <button className="rounded-full border border-neutral-700 px-3 py-1 bg-neutral-900" onClick={() => setShowMethods((v) => !v)}>
              💳 {methodLabel(method)} ▾
            </button>
          </div>
          {showMethods && (
            <div className="mt-3 space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900">
                <div className="flex items-center gap-3"><span>🧾</span> <span>Debit or credit card</span></div>
                <input type="radio" name="pm" checked={method==='card'} onChange={() => { setMethod('card'); setShowMethods(false); }} />
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900">
                <div className="flex items-center gap-3"><span>🇪🇺</span> <span>European bank (SEPA)</span></div>
                <input type="radio" name="pm" checked={method==='sepa'} onChange={() => { setMethod('sepa'); setShowMethods(false); }} />
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900">
                <div className="flex items-center gap-3"><span>🇬🇧</span> <span>United Kingdom bank (FAST)</span></div>
                <input type="radio" name="pm" checked={method==='ukbank'} onChange={() => { setMethod('ukbank'); setShowMethods(false); }} />
              </label>
            </div>
          )}
        </div>
        <div className="h-px bg-neutral-800" />
        <div className="px-4 py-4">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="font-medium">⚡ Instant</div>
            <div className="text-sm text-neutral-400">Few seconds • {feeRate * 100}%</div>
          </div>
        </div>
        <div className="h-px bg-neutral-800" />
        <div className="px-4 py-4 text-sm text-neutral-300 space-y-2">
          <div className="flex items-center justify-between"><span>Bank fee</span><span>{bankFee.toFixed(2)} USD</span></div>
          <div className="flex items-center justify-between font-semibold"><span>Total cost</span><span>{total.toFixed(2)} USD</span></div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
        <button onClick={onAdd} className="w-full rounded-full bg-blue-600 py-4 text-lg font-semibold">Add {amount.toFixed(0)} USD</button>
      </div>
    </div>
  );
} 