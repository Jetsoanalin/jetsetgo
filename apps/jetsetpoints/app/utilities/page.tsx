import Link from "next/link";

export default function UtilitiesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Utilities</h1>
      <div className="grid gap-4">
        <Link href="/utilities/esim" className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
          <div className="text-lg font-semibold">eSIM Purchase (Mock)</div>
          <div className="text-sm text-neutral-400">Buy Local eSIM • deduct JP • show activated</div>
        </Link>
        <Link href="/utilities/insurance" className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
          <div className="text-lg font-semibold">Travel Insurance</div>
          <div className="text-sm text-neutral-400">Weekly coverage • 20,000 JP</div>
        </Link>
        <Link href="/utilities/passport" className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
          <div className="text-lg font-semibold">NFT Passport</div>
          <div className="text-sm text-neutral-400">Mint mock ERC-721 on testnet</div>
        </Link>
        <Link href="/utilities/badges" className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
          <div className="text-lg font-semibold">Proof-of-Travel Badges</div>
          <div className="text-sm text-neutral-400">See visited countries map</div>
        </Link>
      </div>
    </div>
  );
} 