"use client";
import { useState } from "react";
import Link from "next/link";

export default function TopupPage() {
  const [lastTx, setLastTx] = useState<string | null>(null);

  function mockTopup(kind: "crypto" | "card") {
    // Credit JP instantly and return mock tx hash
    const txHash = kind === "crypto" ? "0xMINT_TX_HASH" : "stripe_test_tx_123";
    setLastTx(txHash);
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Top-up JetSet Points</h1>
      <div className="text-sm text-neutral-500 mb-6">Choose a method to add balance</div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => mockTopup("crypto")} className="rounded border py-3 font-medium">Demo USDT/USDC</button>
        <button onClick={() => mockTopup("card")} className="rounded border py-3 font-medium">Stripe (Test)</button>
      </div>

      {lastTx && (
        <div className="mt-6 rounded border p-4">
          <div className="font-semibold mb-1">Blockchain Proof</div>
          <div className="text-sm">Mint tx hash:</div>
          <div className="font-mono break-all text-xs">{lastTx}</div>
        </div>
      )}

      <div className="mt-6">
        <Link href="/" className="underline text-sm">Back to Dashboard</Link>
      </div>
    </div>
  );
} 