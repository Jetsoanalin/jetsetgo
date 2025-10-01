"use client";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { getSelectedCountry, getLanguage, type Lang } from "@jetset/shared/dist/prefs";
import { getCountry } from "@jetset/shared/dist/countries";
import { isWalletAllowed } from "@jetset/shared/dist/regulations";
import { t } from "@jetset/shared/dist/i18n";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";
import type { Payment } from "@/lib/payments";

function currencySymbol(code: string) {
  switch (code) {
    case 'INR': return '₹';
    case 'THB': return '฿';
    case 'IDR': return 'Rp';
    case 'VND': return '₫';
    case 'PHP': return '₱';
    case 'USD': return '$';
    case 'SGD': return 'S$';
    case 'MYR': return 'RM';
    default: return '';
  }
}

async function getDynamicJPPerUnit(currencyCode: string): Promise<number | null> {
  try {
    const r = await fetch('/api/conversion');
    if (!r.ok) return null;
    const j = await r.json();
    const perOneJP = j?.quote?.[currencyCode];
    if (typeof perOneJP === 'number' && perOneJP > 0) {
      // perUnitJP = JP needed for 1 local unit
      return 1 / perOneJP;
    }
  } catch {}
  return null;
}

export default function Home() {
  const [code, setCode] = useState<'TH' | 'IN' | 'SG' | 'MY' | 'ID' | 'VN' | 'PH' | 'KH' | 'LA' | 'MN'>('TH');
  const [lang, setLang] = useState<Lang>('en');
  const [payMode, setPayMode] = useState<'wallet' | 'points'>('wallet');
  const [showModal, setShowModal] = useState(false);
  const [points, setPoints] = useState<number>(0);
  const [walletUsd, setWalletUsd] = useState<number>(0);
  const [perUnitJP, setPerUnitJP] = useState<number>(1250);
  const [recent, setRecent] = useState<Payment[]>([]);
  const supabase = getSupabaseClient();

  useEffect(() => {
    function refreshPrefs() {
      const c = getSelectedCountry('TH');
      setCode(c);
      setLang(getLanguage('en'));
      setPayMode(isWalletAllowed(c) ? 'wallet' : 'points');
    }
    refreshPrefs();
    window.addEventListener('jetset:prefs-updated', refreshPrefs as EventListener);
    return () => window.removeEventListener('jetset:prefs-updated', refreshPrefs as EventListener);
  }, []);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        const r = await fetch(`/api/points?userId=${user.id}`);
        const j = await r.json();
        if (j?.balance?.balance != null) setPoints(j.balance.balance);
      } catch {}
      try {
        const wr = await fetch(`/api/wallet?userId=${user.id}&currency=USD`);
        const wj = await wr.json();
        if (wj?.ok) setWalletUsd(Number(wj.balance || 0));
      } catch {}
      try {
        const hr = await fetch(`/api/payments?userId=${user.id}`);
        const hj = await hr.json();
        if (hj?.ok && Array.isArray(hj.data)) setRecent(hj.data.slice(0, 5));
      } catch {}
    }
    loadData();

    // Realtime: wallet balance and payments
    let channel: any;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      channel = supabase.channel(`rt-wallet-payments-${user.id}` as any)
        .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'wallet_balances', filter: `userId=eq.${user.id}` } as any, () => loadData())
        .on('postgres_changes' as any, { event: 'insert', schema: 'public', table: 'payments', filter: `userId=eq.${user.id}` } as any, () => loadData())
        .subscribe();
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [supabase]);

  useEffect(() => {
    async function loadRate() {
      const cfg = getCountry(code);
      const dyn = await getDynamicJPPerUnit(cfg.currencyCode);
      setPerUnitJP(dyn || 1250);
    }
    loadRate();
  }, [code]);

  const country = useMemo(() => getCountry(code), [code]);
  const symbol = currencySymbol(country.currencyCode);
  const local = walletUsd * country.per1000JP; // 1 USD = per1000JP local (based on our model)
  const walletAllowed = isWalletAllowed(code);
  const perUnitLocal = 1;
  const per1000Local = useMemo(() => {
    if (perUnitJP && perUnitJP > 0) return 1000 / perUnitJP;
    return getCountry(code).per1000JP;
  }, [perUnitJP, code]);

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
          {walletAllowed && payMode==='wallet' ? (
            <>
              <div className="text-neutral-400 text-sm">{t('wallet_title', lang, { name: 'Analin Jetso' })}</div>
              <div className="text-[84px] leading-none font-semibold mt-3">{walletUsd.toFixed(2)}</div>
              <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-full bg-neutral-900/70 border border-neutral-800 px-4 py-2 mt-4">
                <span>{country.flag}</span>
                <span className="text-neutral-300">{local.toLocaleString(undefined, { maximumFractionDigits: 4 })} {country.currencyCode}</span>
              </button>
            </>
          ) : (
            <>
              <div className="text-neutral-400 text-sm">JetSet Points</div>
              <div className="text-[84px] leading-none font-semibold mt-3">{points.toLocaleString()}</div>
              <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-full bg-neutral-900/70 border border-neutral-800 px-4 py-2 mt-4">
                <span>{country.flag}</span>
                <span className="text-neutral-300">1,000 JP ≈ {per1000Local.toLocaleString(undefined, { maximumFractionDigits: 4 })} {country.currencyCode}</span>
              </button>
              <div className="mt-2 text-xs text-neutral-500 px-6">{t('points_disclaimer' as any, lang)}</div>
            </>
          )}

          {walletAllowed && payMode==='wallet' && (
            <div className="mt-6">
              <Link href="/topup" className="inline-flex items-center gap-3 rounded-full border-2 border-blue-600 px-6 py-3 font-medium bg-neutral-950">+ {t('add_money', lang)}</Link>
            </div>
          )}
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
              <div>{points.toLocaleString()} JP</div>
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
            {recent.map((tx) => (
              <li key={tx.id} className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 flex items-center justify-between">
                <div>
                  <div className="text-neutral-300">{tx.merchantId === 'ADMIN_TOPUP' ? 'Admin Credit' : tx.merchantId} {tx.placeName ? `• ${tx.placeName}` : ''}</div>
                  <div className="text-xs text-neutral-500">{new Date(tx.createdAt).toLocaleString()} {tx.countryCode ? `• ${tx.countryCode}` : ''}</div>
                </div>
                <div className={tx.merchantId === 'ADMIN_TOPUP' ? 'text-emerald-400' : ''}>
                  {tx.amount} {tx.currency}
                  <div className="text-xs"><Link href={`/receipt?id=${tx.id}`} className="underline">Receipt</Link></div>
                </div>
              </li>
            ))}
            {recent.length === 0 && <li className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 text-neutral-500">No transactions yet</li>}
          </ul>
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-end" onClick={() => setShowModal(false)}>
          <div className="w-full rounded-t-3xl bg-neutral-950 border-t border-neutral-800 p-6 pb-28" onClick={(e) => e.stopPropagation()}>
            {walletAllowed && payMode==='wallet' ? (
              <>
                <h3 className="text-2xl font-semibold mb-2">Conversion estimate</h3>
                <div className="rounded-xl border border-neutral-800 p-4 text-center text-xl font-semibold">1 USD = {symbol}{(getCountry(code).per1000JP).toLocaleString(undefined, { maximumFractionDigits: 4 })} {country.currencyCode}</div>
                <div className="text-neutral-400 mt-3 text-sm">Updated just now</div>
                <p className="text-neutral-300 mt-4 text-center">The amount shown is an estimate of your balance in {country.currencyCode} based on the current exchange rate. This calculation does not account for fees and rate fluctuations.</p>
                <button className="mt-6 w-full rounded-full bg-blue-600 py-4 text-lg font-semibold" onClick={() => setShowModal(false)}>Dismiss</button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-semibold mb-2">Today's points value</h3>
                <div className="rounded-xl border border-neutral-800 p-4 text-center text-xl font-semibold">{perUnitJP.toLocaleString()} JetSet Points = {symbol}{perUnitLocal.toLocaleString(undefined, { maximumFractionDigits: 4 })} {country.currencyCode}</div>
                <div className="text-neutral-400 mt-3 text-sm">Updated just now</div>
                <p className="text-neutral-300 mt-4 text-center">Redemption value varies by partner and market conditions. This is a loyalty program estimate, not a foreign exchange quote.</p>
                <button className="mt-6 w-full rounded-full bg-blue-600 py-4 text-lg font-semibold" onClick={() => setShowModal(false)}>Dismiss</button>
              </>
            )}
          </div>
        </div>
      )}

      <BottomNav active="pay" />
    </div>
  );
}
