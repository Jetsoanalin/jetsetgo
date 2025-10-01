"use client";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";
import { getSelectedCountry } from "@jetset/shared/dist/prefs";
import { getCountry, convertLocalToJP, type CountryCode } from "@jetset/shared/dist/countries";
import BottomNav from "@/components/BottomNav";

export default function MePage() {
  const supabase = getSupabaseClient();
  const code = getSelectedCountry('TH');
  const country = useMemo(() => getCountry(code), [code]);
  const [usdCashback, setUsdCashback] = useState(0);
  const [lifetime, setLifetime] = useState(0);
  const [name, setName] = useState("Analin Jetso Jerald");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        const r = await fetch(`/api/profile?userId=${user.id}`);
        const j = await r.json();
        if (j?.ok && j.data?.displayName) setName(j.data.displayName);
        else if (user.email) setName(user.email);
      } catch {}

      // Compute cashback from points redemptions: 5 USD per 100 USD spent (5%)
      try {
        const pr = await fetch(`/api/payments?userId=${user.id}`);
        const pj = await pr.json();
        if (pj?.ok && Array.isArray(pj.data)) {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          let usdThisMonth = 0;
          let usdLifetime = 0;
          for (const p of pj.data) {
            if (p?.method !== 'points') continue;
            const ccode = (p?.countryCode || code) as CountryCode;
            const usd = (convertLocalToJP(Number(p.amount || 0), ccode) / 1000) || 0; // 1 USD = 1000 JP
            usdLifetime += usd;
            const created = new Date(p.createdAt);
            if (created >= startOfMonth) usdThisMonth += usd;
          }
          setLifetime(Number((usdLifetime * 0.05).toFixed(2)));
          setUsdCashback(Number((usdThisMonth * 0.05).toFixed(2)));
        }
      } catch {}
    })();
  }, [supabase, code]);

  async function saveName() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await fetch('/api/profile', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: user.id, displayName: name }) });
  }

  async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem("jetset_session");
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-28">
      <div className="px-6 pt-10 pb-4">
        <div className="flex items-start gap-4">
          
          <div className="flex-1">
            <input value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} className="bg-transparent text-3xl font-bold outline-none border-b border-transparent focus:border-neutral-700" />
            <div className="text-neutral-400 mt-1">Member since ’25</div>
          </div>
        
        </div>
        <button className="mt-6 w-full rounded-full bg-blue-600 py-4 text-lg font-semibold">Transfer</button>
      </div>

      <div className="px-6">
        <h2 className="text-2xl font-semibold mt-6">Cash back rewards <span className="text-neutral-500">ⓘ</span></h2>
        <div className="mt-3 rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative h-28 w-28">
                <svg viewBox="0 0 36 36" className="h-28 w-28">
                  <path className="text-neutral-800" stroke="currentColor" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-blue-500" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={`${Math.min(usdCashback/5 * 100, 100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-xl font-bold">{usdCashback.toFixed(2)} USD</div>
              </div>
              <div>
                <div className="text-neutral-400">Cash back balance</div>
                <div className="text-neutral-500 text-sm">Goal: 5 USD</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-neutral-400">Earned this month</div>
              <div>{usdCashback.toFixed(2)} USD</div>
              <div className="text-neutral-400 mt-2">Lifetime earned</div>
              <div>{lifetime.toFixed(2)} USD</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-neutral-500">Every purchase earns cash back. To redeem rewards, have at least 5 USD in your cash back balance.</div>
            <button className="rounded-full bg-blue-600 px-4 py-2">Redeem</button>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-8">Payment methods</h2>
        <div className="mt-3 rounded-2xl bg-neutral-950 border border-neutral-800 p-6 flex items-center justify-center text-neutral-300">
          <div className="rounded-xl border border-blue-600 text-blue-400 px-4 py-3">+ Add payment method</div>
        </div>

        <h2 className="text-2xl font-semibold mt-8">Discover more</h2>
        <div className="mt-3 space-y-3">
          <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">Pay for Grab</div>
              <div className="text-neutral-400 text-sm">Scan and pay for Grab with JetSet Pay.</div>
            </div>
            <div className="text-2xl">🟩</div>
          </div>
          <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">No US bank? No problem</div>
              <div className="text-neutral-400 text-sm">Open a USD wallet easily.</div>
            </div>
            <div className="text-2xl">💳</div>
          </div>
        </div>

        <button onClick={logout} className="mt-8 w-full rounded-full bg-red-600 py-3">Logout</button>
      </div>

      <BottomNav active="me" />
    </div>
  );
} 