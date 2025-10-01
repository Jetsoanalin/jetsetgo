"use client";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { addPayment } from "@/lib/payments";
import { COUNTRIES, convertLocalToJP, type CountryCode } from "@jetset/shared/dist/countries";

function parsePayload(text: string) {
  const map: Record<string, { merchantId: string; amount: number; currency: string; countryCode?: string; placeName?: string }> = {
    "upi://pay?pa=coffee@upi&am=250": { merchantId: "COFFEE_INDIA", amount: 250, currency: "INR", countryCode: 'IN', placeName: 'Delhi - Coffee House' },
    "000201010211...QRIS...5204...": { merchantId: "COFFEE_JAKARTA", amount: 50000, currency: "IDR", countryCode: 'ID', placeName: 'Jakarta - Coffee House' },
    "000201010212...PROMPTPAY...5303764...": { merchantId: "COFFEE_BANGKOK", amount: 100, currency: "THB", countryCode: 'TH', placeName: 'Bangkok - Coffee House' },
  };
  if (map[text]) return map[text];
  const parts = Object.fromEntries(
    text.split(";").map((kv) => {
      const [k, v] = kv.split(":");
      return [k?.trim(), v?.trim()];
    })
  );
  const merchantId = (parts["merchant"] as string) || "UNKNOWN_MERCHANT";
  const amount = Number(parts["amount"]) || 0;
  const currency = (parts["currency"] as string) || "THB";
  const countryCode = (parts["country"] as string) || undefined;
  const placeName = (parts["place"] as string) || undefined;
  return { merchantId, amount, currency, countryCode, placeName };
}

export default function ConfirmPage() {
  const params = useSearchParams();
  const router = useRouter();
  const payload = params.get("payload") || "";
  const parsed = useMemo(() => parsePayload(decodeURIComponent(payload)), [payload]);
  const [method, setMethod] = useState<"wallet" | "points" | null>(null);
  const [countryCode, setCountryCode] = useState<CountryCode>((parsed.countryCode as CountryCode) || "TH");
  const [placeName, setPlaceName] = useState<string>(parsed.placeName || "Bangkok - Coffee House");

  const pointsNeeded = useMemo(() => convertLocalToJP(parsed.amount, countryCode), [parsed.amount, countryCode]);

  function onConfirm() {
    const tx = addPayment({
      merchantId: parsed.merchantId,
      amount: parsed.amount,
      currency: parsed.currency,
      method: method || "wallet",
      countryCode,
      placeName,
    });
    const qs = new URLSearchParams(Object.entries({
      merchantId: tx.merchantId,
      amount: String(tx.amount),
      currency: tx.currency,
      method: tx.method,
    })).toString();
    router.replace(`/success?${qs}`);
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Confirm Payment</h1>
      <div className="text-sm text-neutral-500 mb-6">Parsed from QR payload</div>

      <div className="rounded border p-4 space-y-2">
        <div><span className="font-medium">Merchant:</span> {parsed.merchantId}</div>
        <div><span className="font-medium">Amount:</span> {parsed.amount} {parsed.currency}</div>
        <div className="mt-2">
          <label className="block text-sm font-medium mb-1">Country</label>
          <select value={countryCode} onChange={(e) => setCountryCode(e.target.value as CountryCode)} className="border rounded px-2 py-1">
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
            ))}
          </select>
        </div>
        <div className="mt-2">
          <label className="block text-sm font-medium mb-1">Place name</label>
          <input value={placeName} onChange={(e) => setPlaceName(e.target.value)} className="border rounded px-2 py-1 w-full" />
        </div>
        <div className="text-sm text-neutral-600">If paying with Points: {pointsNeeded.toLocaleString()} JP</div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => setMethod("wallet")} className={`px-3 py-1 rounded border ${method === "wallet" ? "bg-black text-white" : ""}`}>Wallet</button>
          <button onClick={() => setMethod("points")} className={`px-3 py-1 rounded border ${method === "points" ? "bg-black text-white" : ""}`}>Points</button>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link href="/scan" className="underline">Back</Link>
        <button onClick={onConfirm} className="px-4 py-2 rounded border font-medium">Confirm Pay</button>
      </div>
    </div>
  );
} 