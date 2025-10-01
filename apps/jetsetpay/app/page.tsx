"use client";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { getSelectedCountry, getLanguage } from "@jetset/shared/dist/prefs";
import { getCountry, convertUSDToLocal } from "@jetset/shared/dist/countries";
import { isWalletAllowed } from "@jetset/shared/dist/regulations";
import { t } from "@jetset/shared/dist/i18n";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [code, setCode] = useState<'TH' | 'IN' | 'SG' | 'MY' | 'ID' | 'VN' | 'PH' | 'KH' | 'LA' | 'MN'>('TH');
  const [lang, setLang] = useState<'en' | 'hi' | 'id' | 'th'>('en');
  const [payMode, setPayMode] = useState<'wallet' | 'points'>('wallet');

  useEffect(() => {
    function refresh() {
      const c = getSelectedCountry('TH');
      setCode(c);
      setLang(getLanguage('en'));
      setPayMode(isWalletAllowed(c) ? 'wallet' : 'points');
    }
    refresh();
    window.addEventListener('jetset:prefs-updated', refresh as EventListener);
    return () => window.removeEventListener('jetset:prefs-updated', refresh as EventListener);
  }, []);

  const country = useMemo(() => getCountry(code), [code]);
  const walletUsd = 0.45; // mock
  const local = useMemo(() => convertUSDToLocal(walletUsd, code), [walletUsd, code]);
  const pointsJP = 12345; // mock JP balance (could be read from shared or Supabase later)

  const walletAllowed = isWalletAllowed(code);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="px-5 pt-6 pb-4 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="flex items-center justify-between">
          <button className="text-2xl">≡</button>
          <button className="rounded-full bg-neutral-800 px-4 py-2 text-sm">{t('earn_bonus', lang)}</button>
        </div>

        <Link href="/region" className="mt-4 block rounded-2xl bg-neutral-900 border border-neutral-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-neutral-300 text-sm">
              <span>{country.flag}</span>
              <span>{t('personalized_for_country', lang, { country: country.name })}</span>
            </div>
            <span>›</span>
          </div>
        </Link>

        <div className="mt-6 text-center">
          {walletAllowed ? (
            <>
              <div className="text-neutral-400 text-sm">{t('wallet_title', lang, { name: 'Analin Jetso' })}</div>
              <div className="text-[84px] leading-none font-semibold mt-3">{walletUsd.toFixed(2)}</div>
              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900/70 border border-neutral-800 px-4 py-2 mt-4">
                <span>{country.flag}</span>
                <span className="text-neutral-300">{local.toLocaleString(undefined, { maximumFractionDigits: 2 })} {country.currencyCode}</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-neutral-400 text-sm">JetSet Points</div>
              <div className="text-[84px] leading-none font-semibold mt-3">{pointsJP.toLocaleString()}</div>
              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900/70 border border-neutral-800 px-4 py-2 mt-4">
                <span>{country.flag}</span>
                <span className="text-neutral-300">{t('conversion_chip', lang, { currency: country.currencyCode })}</span>
              </div>
            </>
          )}

          <div className="mt-6">
            <Link href="/topup" className="inline-flex items-center gap-3 rounded-full border-2 border-blue-600 px-6 py-3 font-medium bg-neutral-950">+ {walletAllowed ? t('add_money', lang) : t('add_points', lang)}</Link>
          </div>
        </div>
      </div>

      <div className="px-5 pb-28">
        <section className="mt-5">
          <h2 className="text-xl font-semibold">{t('cash_summary', lang)} <span className="text-neutral-500 text-base">ⓘ</span></h2>
          <div className="mt-3 rounded-2xl bg-neutral-950 border border-neutral-800">
            {walletAllowed && (
              <>
                <div className="flex items-center justify-between px-4 py-4">
                  <div className="text-neutral-400">{t('available_cash', lang)}</div>
                  <div>{walletUsd.toFixed(2)} USD</div>
                </div>
                <div className="h-px bg-neutral-800" />
                <div className="flex items-center justify-between px-4 py-4">
                  <div className="text-neutral-400">{t('cash_in_transit', lang)} <span className="text-neutral-500">ⓘ</span></div>
                  <div>0 USD</div>
                </div>
              </>
            )}
            <div className="flex items-center justify-between px-4 py-4">
              <div className="text-neutral-400">JetSet Points</div>
              <div>{pointsJP.toLocaleString()} JP</div>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Payment mode</h2>
            {walletAllowed ? (
              <div className="rounded-full border border-neutral-700 p-1 flex items-center gap-1">
                <button onClick={() => setPayMode('wallet')} className={`px-3 py-1 rounded-full text-sm ${payMode==='wallet' ? 'bg-blue-600' : ''}`}>Wallet</button>
                <button onClick={() => setPayMode('points')} className={`px-3 py-1 rounded-full text-sm ${payMode==='points' ? 'bg-blue-600' : ''}`}>Points</button>
              </div>
            ) : (
              <div className="text-neutral-400 text-sm">Points only in this region</div>
            )}
          </div>
          <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
            <div className="text-neutral-400 text-sm">Current mode</div>
            <div className="text-lg font-semibold mt-1">{walletAllowed ? (payMode==='wallet' ? 'Wallet (USD)' : 'Points (JP)') : 'Points (JP)'}</div>
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('recent_activity', lang)}</h2>
            <Link href="/history" className="text-blue-400">{t('see_all', lang)}</Link>
          </div>
          <ul className="mt-3 space-y-3">
            <li className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 flex items-center justify-between">
              <div>
                <div className="text-neutral-300">SCB มณี SHOP</div>
                <div className="text-xs text-neutral-500">Payment • Sep 22</div>
              </div>
              <div className="text-right">
                <div className="text-neutral-300">9.49 USD</div>
                <div className="text-xs text-neutral-500">300 THB</div>
              </div>
            </li>
            <li className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 flex items-center justify-between">
              <div>
                <div className="text-neutral-300">Credit USD</div>
                <div className="text-xs text-neutral-500">Credit • Sep 21</div>
              </div>
              <div className="text-emerald-400">+ 4.75 USD</div>
            </li>
          </ul>
        </section>
      </div>

      <BottomNav active="pay" />
    </div>
  );
}
