"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [language, setLanguage] = useState("en");
  const [country, setCountry] = useState("TH");

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="border rounded px-2 py-1">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="id">Bahasa</option>
            <option value="th">Thai</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="border rounded px-2 py-1">
            <option value="IN">India</option>
            <option value="ID">Indonesia</option>
            <option value="TH">Thailand</option>
          </select>
        </div>
      </div>
    </div>
  );
} 