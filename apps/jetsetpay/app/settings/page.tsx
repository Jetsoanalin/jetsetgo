"use client";
import { useState } from "react";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";
import { PageHeader, Card } from "@/components/UI";

export default function SettingsPage() {
  const supabase = getSupabaseClient();
  const [language, setLanguage] = useState("en");
  const [country, setCountry] = useState("TH");

  async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem("jetset_session");
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PageHeader title="Settings" subtitle="Control your JetSet Pay experience" />
      <div className="px-6 -mt-8">
        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-300">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="border rounded px-2 py-2 bg-neutral-900 border-neutral-800 w-full">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="id">Bahasa</option>
                <option value="th">Thai</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-300">Country</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="border rounded px-2 py-2 bg-neutral-900 border-neutral-800 w-full">
                <option value="IN">India</option>
                <option value="ID">Indonesia</option>
                <option value="TH">Thailand</option>
              </select>
            </div>
            <button onClick={logout} className="mt-2 rounded-full bg-red-600 text-white px-4 py-2">Logout</button>
          </div>
        </Card>
      </div>
    </div>
  );
} 