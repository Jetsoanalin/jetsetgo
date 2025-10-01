import Link from "next/link";
import { PageHeader } from "@/components/UI";

const SERVICES = [
  {
    id: 'esim',
    title: 'Local eSIM Packages',
    subtitle: 'Stay connected as you travel',
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop',
    priceJP: 5000,
    priceUSD: 5,
    cashbackPct: 3,
    href: '/utilities/esim',
  },
  {
    id: 'insurance',
    title: 'Travel Insurance (1 week)',
    subtitle: 'Medical + baggage + delay',
    img: 'https://images.pexels.com/photos/1309644/pexels-photo-1309644.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&dpr=2',
    priceJP: 20000,
    priceUSD: 20,
    cashbackPct: 5,
    href: '/utilities/insurance',
  },
  {
    id: 'passport',
    title: 'JetSet NFT Passport',
    subtitle: 'Own your travel identity',
    img: 'https://images.pexels.com/photos/346798/pexels-photo-346798.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&dpr=2',
    priceJP: 10000,
    priceUSD: 10,
    cashbackPct: 2,
    href: '/utilities/passport',
  },
  {
    id: 'badges',
    title: 'Proof-of-Travel Badges',
    subtitle: 'Collect stamps for every country',
    img: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?q=80&w=1200&auto=format&fit=crop',
    priceJP: 0,
    priceUSD: 0,
    cashbackPct: 0,
    href: '/utilities/badges',
  },
];

export default function UtilitiesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PageHeader title="Services" subtitle="Book travel essentials and pay with JetSet Points" />

      <div className="px-6 -mt-8 space-y-5">
        {SERVICES.map((s) => (
          <div key={s.id} className="overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-800">
            <div className="relative h-40 w-full overflow-hidden">
              <img src={s.img} alt={s.title} className="h-40 w-full object-cover" />
              {s.cashbackPct > 0 && (
                <div className="absolute top-3 right-3 rounded-full bg-emerald-600 text-white text-xs px-3 py-1 shadow">{s.cashbackPct}% cashback</div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{s.title}</div>
                  <div className="text-sm text-neutral-400">{s.subtitle}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-semibold">{s.priceJP.toLocaleString()} JP</div>
                  <div className="text-xs text-neutral-500">≈ ${s.priceUSD}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Link href={s.href} className="flex-1 rounded-full bg-blue-600 text-center py-2 font-semibold">Checkout</Link>
                <button className="rounded-full border border-neutral-700 px-4 py-2">Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 mt-6 pb-28">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
          Pay using your JetSet Points at checkout. Redemption values may vary by partner and market conditions. Cashback is credited instantly after purchase.
        </div>
      </div>
    </div>
  );
} 