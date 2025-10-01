"use client";
import Link from "next/link";
import { getSelectedCountry, getLanguage, type Lang } from "@jetset/shared/dist/prefs";
import { getCountry, COUNTRIES, convertLocalToJP, type CountryCode } from "@jetset/shared/dist/countries";
import { t } from "@jetset/shared/dist/i18n";
import { useEffect, useMemo, useState } from "react";
import { getAuthUserId } from "@jetset/shared/dist/auth";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";

type PaymentRow = { merchantId: string | null; amount: number | null; currency: string | null };

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
  const [lang, setLang] = useState<Lang>('en');
  const [points, setPoints] = useState<number>(0);
  const [recent, setRecent] = useState<any[]>([]);
  const supabase = getSupabaseClient();
  const [perUnitJP, setPerUnitJP] = useState<number>(1250);
  const [spendJP, setSpendJP] = useState<number>(0);

  useEffect(() => {
    async function load() {
      setCode(getSelectedCountry('TH'));
      setLang(getLanguage('en'));
      const uid = await getAuthUserId();
      if (uid) {
        try {
          const res = await fetch(`/api/points?userId=${uid}`);
          const j = await res.json();
          if (j?.balance?.balance != null) setPoints(j.balance.balance);
          if (Array.isArray(j.ledger)) setRecent(j.ledger.slice(0, 5));
        } catch {}

        // Load spend-based tier data from payments (exclude admin topups)
        try {
          const { data } = await supabase
            .from('payments')
            .select('merchantId, amount, currency')
            .eq('userId', uid)
            .limit(1000);
          const currencyToCode: Record<string, CountryCode> = Object.fromEntries(COUNTRIES.map(c => [c.currencyCode, c.code]));
          let totalJP = 0;
          for (const p of ((data as PaymentRow[]) || [])) {
            if (p.merchantId === 'ADMIN_TOPUP') continue; // exclude deposits/credits
            const ccode = currencyToCode[(p.currency || '') as string] as CountryCode | undefined;
            if (!ccode) continue;
            totalJP += convertLocalToJP(Number(p.amount || 0), ccode);
          }
          setSpendJP(totalJP);
        } catch {}
      }
    }
    load();
    function refresh() { setCode(getSelectedCountry('TH')); setLang(getLanguage('en')); }
    window.addEventListener('jetset:prefs-updated', refresh as EventListener);
    return () => window.removeEventListener('jetset:prefs-updated', refresh as EventListener);
  }, []);

  useEffect(() => {
    async function loadRate() {
      try {
        const r = await fetch('/api/conversion');
        if (!r.ok) return;
        const j = await r.json();
        const currency = getCountry(code).currencyCode;
        const perOneJP = j?.quote?.[currency];
        if (typeof perOneJP === 'number' && perOneJP > 0) {
          setPerUnitJP(1 / perOneJP);
        }
      } catch {}
    }
    loadRate();
  }, [code]);

  const country = useMemo(() => getCountry(code), [code]);
  const per1000Local = useMemo(() => {
    if (perUnitJP && perUnitJP > 0) return (1000 / perUnitJP);
    return getCountry(code).per1000JP;
  }, [perUnitJP, code]);

  // Tier thresholds in JP equivalent (1 USD == 1000 JP)
  const TIER_LABELS = ["Silver", "Gold", "Platinum"] as const;
  const THRESHOLDS_JP = [10000 * 1000, 20000 * 1000, 40000 * 1000];
  const currentTierIndex = spendJP >= THRESHOLDS_JP[2] ? 2 : spendJP >= THRESHOLDS_JP[1] ? 1 : spendJP >= THRESHOLDS_JP[0] ? 0 : -1;
  const currentTierLabel = currentTierIndex >= 0 ? TIER_LABELS[currentTierIndex as 0 | 1 | 2] : "Member";
  const nextTierIndex = currentTierIndex + 1;
  const nextTargetJP = nextTierIndex < THRESHOLDS_JP.length ? THRESHOLDS_JP[nextTierIndex] : null;
  const progressNumeratorJP = spendJP;
  const progressDenominatorJP = nextTargetJP ?? progressNumeratorJP;
  const progressPct = Math.min(100, Math.round((progressNumeratorJP / (progressDenominatorJP || 1)) * 100));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="px-5 pt-6 pb-4 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="flex items-center justify-between">
          <button className="text-2xl">≡</button>
          <div className="flex items-center gap-2">
            {/* <Link href="/utilities" className="rounded-full bg-neutral-800 px-4 py-2 text-sm">{t('utilities', lang)}</Link> */}
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
          <div className="text-[84px] leading-none font-semibold mt-3">{points.toLocaleString()}</div>
          <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900/70 border border-neutral-800 px-4 py-2 mt-4 text-neutral-300">
            1,000 JP ≈ {per1000Local.toLocaleString(undefined, { maximumFractionDigits: 4 })} {country.currencyCode}
          </div>
          <div className="mt-2 text-xs text-neutral-500 px-6">{t('points_disclaimer' as any, lang)}</div>

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
                <div className="text-neutral-300">{currentTierLabel}</div>
                {nextTargetJP ? (
                  <div className="text-xs text-neutral-500">Next: {TIER_LABELS[(nextTierIndex as 0 | 1 | 2)]} at {nextTargetJP.toLocaleString()} JP (spend equivalent)</div>
                ) : (
                  <div className="text-xs text-neutral-500">Top tier achieved</div>
                )}
              </div>
              <div className="text-sm text-neutral-400">{progressNumeratorJP.toLocaleString()} {nextTargetJP ? `/ ${nextTargetJP.toLocaleString()}` : ''} JP</div>
            </div>
            <div className="h-2 bg-neutral-800 rounded mt-3">
              <div className="h-2 bg-emerald-500 rounded" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('recent_activity', lang)}</h2>
            <Link href="/ledger" className="text-blue-400">{t('see_all', lang)}</Link>
          </div>
          <ul className="mt-3 space-y-3">
            {recent.map((tx) => (
              <li key={tx.id} className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 flex items-center justify-between">
                <div>
                  <div className="text-neutral-300">{tx.description || 'Points update'}</div>
                  <div className="text-xs text-neutral-500">{new Date(tx.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className={tx.deltaJP >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {tx.deltaJP >= 0 ? '+' : ''}{tx.deltaJP} JP
                  </div>
                  <div className="text-xs"><Link href={`/receipt?id=${tx.id}`} className="underline">Receipt</Link></div>
                </div>
              </li>
            ))}
            {recent.length === 0 && (
              <li className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 text-neutral-500">No recent activity</li>
            )}
          </ul>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
