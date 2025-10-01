"use client";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";

export default function AdminPage() {
  const supabase = getSupabaseClient();
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [delta, setDelta] = useState(1000);
  const [walletAmount, setWalletAmount] = useState<number>(0);
  const [walletCurrency, setWalletCurrency] = useState<string>('USD');
  const [status, setStatus] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const em = data.user?.email || null;
      setEmail(em);
      setAuthorized(em === 'jetsoanalin@gmail.com');
    });
  }, [supabase]);

  async function search() {
    const r = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`);
    const j = await r.json();
    setUsers(j.users || []);
  }

  async function allocate() {
    if (!selected) return;
    setStatus("Allocating...");
    const r = await fetch('/api/admin/allocate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: selected.id, deltaJP: delta, description: 'Admin allocation', walletAmount, walletCurrency }) });
    const j = await r.json();
    setStatus(j.ok ? `Saved` : j.error);
  }

  useEffect(() => { setUsers([]); }, [q]);

  if (authorized === false) {
    return (
      <div className="min-h-screen p-6 max-w-2xl mx-auto text-white bg-[#0a0a0a]">
        <h1 className="text-2xl font-bold mb-4">Not authorized</h1>
        <div className="text-neutral-300">You are signed in as {email}. This page is restricted to jetsoanalin@gmail.com.</div>
      </div>
    );
  }

  if (authorized === null) {
    return (
      <div className="min-h-screen p-6 max-w-2xl mx-auto text-white bg-[#0a0a0a]">
        <div className="text-neutral-300">Checking access…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto text-white bg-[#0a0a0a]">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <div className="rounded border border-neutral-800 p-4">
        <div className="text-sm mb-2">Search user by email</div>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="user@example.com" className="flex-1 rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <button onClick={search} className="rounded bg-blue-600 px-4 py-2">Search</button>
        </div>
        <ul className="mt-3 space-y-2">
          {users.map(u => (
            <li key={u.id} className={`rounded border p-2 cursor-pointer ${selected?.id===u.id?'border-blue-500':'border-neutral-800'}`} onClick={() => setSelected(u)}>
              {u.email || '(no email)'}
            </li>
          ))}
        </ul>
      </div>

      {selected && (
        <div className="rounded border border-neutral-800 p-4 mt-4 space-y-3">
          <div className="mb-1">Allocate to <span className="font-mono">{selected.email}</span></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">JetSet Points (JP)</label>
              <input type="number" value={delta} onChange={(e) => setDelta(parseInt(e.target.value,10)||0)} className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Wallet amount</label>
              <input type="number" value={walletAmount} onChange={(e) => setWalletAmount(parseFloat(e.target.value)||0)} className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Wallet currency</label>
              <select value={walletCurrency} onChange={(e) => setWalletCurrency(e.target.value)} className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2">
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="THB">THB</option>
                <option value="SGD">SGD</option>
              </select>
            </div>
          </div>
          <button onClick={allocate} className="mt-2 rounded bg-emerald-600 px-4 py-2">Save Allocation</button>
          {status && <div className="mt-2 text-sm text-neutral-300">{status}</div>}
        </div>
      )}
    </div>
  );
} 