import Link from "next/link";
import { PageHeader, Card } from "@/components/UI";

export default function UtilitiesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PageHeader title="Utilities" subtitle="Extra services powered by JetSet Points" />
      <div className="px-6 -mt-8 grid gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">eSIM Purchase (Mock)</div>
              <div className="text-sm text-neutral-400">Buy Local eSIM • deduct JP • show activated</div>
            </div>
            <Link href="/utilities/esim" className="rounded-full border border-neutral-700 px-4 py-2">Open</Link>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Travel Insurance</div>
              <div className="text-sm text-neutral-400">Weekly coverage • 20,000 JP</div>
            </div>
            <Link href="/utilities/insurance" className="rounded-full border border-neutral-700 px-4 py-2">Open</Link>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">NFT Passport</div>
              <div className="text-sm text-neutral-400">Mint mock ERC-721 on testnet</div>
            </div>
            <Link href="/utilities/passport" className="rounded-full border border-neutral-700 px-4 py-2">Open</Link>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Proof-of-Travel Badges</div>
              <div className="text-sm text-neutral-400">See visited countries map</div>
            </div>
            <Link href="/utilities/badges" className="rounded-full border border-neutral-700 px-4 py-2">Open</Link>
          </div>
        </Card>
      </div>
    </div>
  );
} 