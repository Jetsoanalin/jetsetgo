"use client";
import { useState } from "react";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";
import { getSelectedCountry } from "@jetset/shared/dist/prefs";
import { getCountry } from "@jetset/shared/dist/countries";

export default function LoginPage() {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const country = getCountry(getSelectedCountry('TH'));

  async function signIn() {
    setStatus("Sending magic link…");
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    setStatus(error ? error.message : "Check your email for a secure login link.");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="px-6 pt-10 pb-16 bg-gradient-to-b from-neutral-900 to-neutral-950 text-center">
        <h1 className="mt-6 text-3xl font-bold">Welcome to JetSet Points</h1>
        <p className="mt-2 text-neutral-400">Sign in to access your points and rewards</p>
      </div>

      <div className="px-6 -mt-10">
        <div className="mx-auto max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-xl">
          <label className="block text-sm text-neutral-300 mb-2">Email address</label>
          <div className="flex items-center rounded-xl border border-neutral-800 bg-neutral-900 px-3">
            <span className="text-neutral-500 mr-2">@</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-transparent py-3 outline-none" />
          </div>
          <button onClick={signIn} className="mt-4 w-full rounded-full bg-blue-600 py-3 font-semibold">Send Login Link</button>
          {status && <div className="mt-3 text-sm text-neutral-300">{status}</div>}
          <div className="mt-6 text-xs text-neutral-500">By continuing, you agree to our Terms and acknowledge our Privacy Policy.</div>
        </div>
      </div>
    </div>
  );
} 