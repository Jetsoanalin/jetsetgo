"use client";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const params = useSearchParams();
  const merchantId = params.get("merchantId");
  const amount = params.get("amount");
  const currency = params.get("currency");
  const method = params.get("method");
  const txHash = params.get("txHash");

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="text-4xl mb-2">✅</div>
      <h1 className="text-2xl font-bold mb-2">Payment Successful</h1>
      <div className="text-neutral-600 mb-6">Thanks! Your payment has been processed.</div>

      <div className="rounded border p-4 space-y-1">
        <div><span className="font-medium">Merchant:</span> {merchantId}</div>
        <div><span className="font-medium">Amount:</span> {amount} {currency}</div>
        <div><span className="font-medium">Method:</span> {method}</div>
        {txHash && (
          <div><span className="font-medium">Tx Hash:</span> <span className="font-mono break-all">{txHash}</span></div>
        )}
      </div>
    </div>
  );
} 