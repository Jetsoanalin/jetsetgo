"use client";
import { useState } from "react";

export default function AddMoneyPage() {
  const [amount, setAmount] = useState("10");
  const [method, setMethod] = useState("Mastercard • 5173");

  function onKey(k: string) {
    if (k === "<") return setAmount((a) => (a.length ? a.slice(0, -1) : ""));
    if (k === ".") {
      if (amount.includes(".")) return;
      return setAmount((a) => (a ? a + "." : "0."));
    }
    setAmount((a) => (a === "0" ? k : a + k));
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-36">
      <h1 className="text-lg text-center text-neutral-400 mb-8">Add money</h1>

      <div className="text-center">
        <div className="text-[80px] leading-none">${amount || "0"}</div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-300">
          🇺🇸 USD ▾
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-neutral-950 border border-neutral-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="text-neutral-400">Paying with</div>
          <button className="text-right">{method} ▾</button>
        </div>
        <div className="h-px bg-neutral-800" />
        <div className="px-4 py-4">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="font-medium">⚡ Instant</div>
            <div className="text-sm text-neutral-400">Few seconds • 2.5%</div>
          </div>
        </div>
        <div className="h-px bg-neutral-800" />
        <div className="px-4 py-4 text-sm text-neutral-300 space-y-2">
          <div className="flex items-center justify-between"><span>Bank fee</span><span>0.25 USD</span></div>
          <div className="flex items-center justify-between font-semibold"><span>Total cost</span><span>10.25 USD</span></div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 pb-6 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="px-6 grid grid-cols-3 gap-4 text-2xl">
          {["1","2","3","4","5","6","7","8","9",".","0","<"].map((k) => (
            <button key={k} onClick={() => onKey(k)} className="py-4 rounded-xl bg-neutral-900 border border-neutral-800 active:scale-95 transition">
              {k}
            </button>
          ))}
        </div>
        <div className="px-6 mt-4">
          <button className="w-full rounded-full bg-blue-600 py-4 text-lg font-semibold">Add {amount || 0} USD</button>
        </div>
      </div>
    </div>
  );
} 