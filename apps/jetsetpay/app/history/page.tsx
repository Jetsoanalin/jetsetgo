"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPayments, type Payment } from "@/lib/payments";

export default function HistoryPage() {
  const [items, setItems] = useState<Payment[]>([]);
  useEffect(() => { setItems(getPayments()); }, []);

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Recent Transactions</h1>
        <Link href="/map" className="text-blue-600">Map</Link>
      </div>
      <ul className="space-y-3">
        {items.map((tx) => (
          <li key={tx.id} className="rounded border p-3 flex items-center justify-between">
            <div>
              <div className="text-sm">{tx.merchantId} {tx.placeName ? `• ${tx.placeName}` : ''}</div>
              <div className="text-xs text-neutral-500">{new Date(tx.createdAt).toLocaleString()} {tx.countryCode ? `• ${tx.countryCode}` : ''}</div>
            </div>
            <div className={tx.method === 'points' ? 'text-emerald-600' : ''}>
              {tx.amount} {tx.currency}
            </div>
          </li>
        ))}
        {items.length === 0 && <div className="text-neutral-500">No transactions yet</div>}
      </ul>
    </div>
  );
} 