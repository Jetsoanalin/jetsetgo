"use client";
import Link from "next/link";
import { getSelectedCountry, getLanguage } from "@jetset/shared/dist/prefs";
import { getCountry } from "@jetset/shared/dist/countries";
import { t } from "@jetset/shared/dist/i18n";
import { useEffect, useMemo, useState } from "react";

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[92%] rounded-full bg-neutral-900/95 border border-neutral-800 shadow-2xl backdrop-blur px-4 py-2 flex items-center justify-between">
      <Link href="/" className="flex flex-col items-center text-xs text-white"><span className="text-xl">🏠</span>Home</Link>
      <Link href="/topup" className="-mt-9"><div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl border-4 border-neutral-900 shadow-xl">＋</div></Link>
      <Link href="/utilities" className="flex flex-col items-center text-xs text-neutral-400"><span className="text-xl">🧰</span>{t('utilities', getLanguage('en'))}</Link>
    </nav>
  );
}

export default function Home() {
  const [code, setCode] = useState<'TH' | 'IN' | 'SG' | 'MY' | 'ID' | 'VN' | 'PH' | 'KH' | 'LA' | 'MN'>('TH');
  const [lang, setLang] = useState<'en' | 'hi' | 'id' | 'th'>('en');

  useEffect(() => {
    function refresh() {
      setCode(getSelectedCountry('TH'));
      setLang(getLanguage('en'));
    }
    refresh();
    window.addEventListener('jetset:prefs-updated', refresh as EventListener);
    return () => window.removeEventListener('jetset:prefs-updated', refresh as EventListener);
  }, []);

  const country = useMemo(() => getCountry(code), [code]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="px-5 pt-6 pb-4 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="flex items-center justify-between">
          <button className="text-2xl">≡</button>
          <div className="flex items-center gap-2">
            <Link href="/utilities" className="rounded-full bg-neutral-800 px-4 py-2 text-sm">{t('utilities', lang)}</Link>
            <button className="rounded-full bg-neutral-800 px-4 py-2 text-sm">{t('streak_zero', lang)}</button>
          </div>
        </div>

        <Link href="/region" className="mt-4 block rounded-2xl bg-neutral-900 border border-neutral-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-neutral-300 text-sm">
              <span>🎖️</span>
              <span>{t('personalized_for_country', lang, { country: country.name })}</span>
            </div>
            <span>›</span>
          </div>
        </Link>

        <div className="mt-6 text-center">
          <div className="text-neutral-400 text-sm">{t('points_balance', lang)}</div>
          <div className="text-[84px] leading-none font-semibold mt-3">12,345</div>
          <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900/70 border border-neutral-800 px-4 py-2 mt-4 text-neutral-300">
            {t('conversion_chip', lang, { currency: country.currencyCode })}
          </div>

          <div className="mt-6">
            <Link href="/topup" className="inline-flex items-center gap-3 rounded-full border-2 border-blue-600 px-6 py-3 font-medium bg-neutral-950">+ {t('add_points', lang)}</Link>
          </div>
        </div>
      </div>

      <div className="px-5 pb-28">
        <section className="mt-5">
          <h2 className="text-xl font-semibold">{t('tier', lang)}</h2>
          <div className="mt-3 rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-neutral-300">Gold</div>
                <div className="text-xs text-neutral-500">Next: Platinum at 20,000 JP</div>
              </div>
              <div className="text-sm text-neutral-400">12,345 / 20,000</div>
            </div>
            <div className="h-2 bg-neutral-800 rounded mt-3">
              <div className="h-2 bg-emerald-500 rounded" style={{ width: "38%" }} />
            </div>
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('recent_activity', lang)}</h2>
            <Link href="/ledger" className="text-blue-400">{t('see_all', lang)}</Link>
          </div>
          <ul className="mt-3 space-y-3">
            <li className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 flex items-center justify-between">
              <div>
                <div className="text-neutral-300">USDT Top-up</div>
                <div className="text-xs text-neutral-500">Credit • Sep 22</div>
              </div>
              <div className="text-emerald-400">+ 10,000 JP</div>
            </li>
            <li className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 flex items-center justify-between">
              <div>
                <div className="text-neutral-300">Redeem at Coffee House</div>
                <div className="text-xs text-neutral-500">Debit • Sep 21</div>
              </div>
              <div className="text-red-400">- 5,000 JP</div>
            </li>
          </ul>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
