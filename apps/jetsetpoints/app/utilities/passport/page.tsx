"use client";
import { useState, useEffect } from "react";
import { getNftPassport, setNftPassport } from "@/lib/jp";

export default function PassportPage() {
  const [state, setState] = useState<{ minted: boolean; txHash?: string }>({ minted: false });

  useEffect(() => {
    setState(getNftPassport());
  }, []);

  function mint() {
    const hash = `0x${crypto.getRandomValues(new Uint32Array(4)).reduce((a, n) => a + n.toString(16), "")}`;
    setNftPassport(hash);
    setState({ minted: true, txHash: hash });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-5 py-6">
      <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-neutral-800">
        <img src="https://images.unsplash.com/photo-1520975682031-564e2a7e04a6?q=80&w=1200&auto=format&fit=crop" alt="Passport" className="h-40 w-full object-cover" />
      </div>
      <div className="mt-4 rounded-2xl bg-neutral-950 border border-neutral-800 p-6">
        {state.minted ? (
          <>
            <div className="text-lg font-semibold">Passport minted</div>
            <div className="text-sm text-neutral-400">Polygon/BNB Testnet</div>
            <div className="mt-3 text-xs font-mono break-all">{state.txHash}</div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-semibold">JetSet NFT Passport</div>
                <div className="text-sm text-neutral-400">Identity for your journeys</div>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 font-semibold">10,000 JP</div>
                <div className="text-xs text-neutral-500">≈ $10 • 2% cashback</div>
              </div>
            </div>
            <button onClick={mint} className="mt-4 rounded-full bg-blue-600 px-5 py-3 font-semibold w-full">Mint Passport</button>
          </>
        )}
      </div>
    </div>
  );
} 