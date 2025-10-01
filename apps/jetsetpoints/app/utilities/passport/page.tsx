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
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">JetSet NFT Passport</h1>
      <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-6">
        {state.minted ? (
          <>
            <div className="text-lg font-semibold">Passport minted</div>
            <div className="text-sm text-neutral-400">Polygon/BNB Testnet</div>
            <div className="mt-3 text-xs font-mono break-all">{state.txHash}</div>
          </>
        ) : (
          <>
            <div className="text-neutral-300">Mint your JetSet NFT Passport on testnet.</div>
            <button onClick={mint} className="mt-4 rounded-full bg-blue-600 px-5 py-3 font-semibold">Mint Passport</button>
          </>
        )}
      </div>
    </div>
  );
} 