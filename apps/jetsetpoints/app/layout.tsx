import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "JetSet Points",
  description: "Loyalty vault for JetSet Points",
  manifest: "/manifest.json",
};

import AuthGate from "@/components/AuthGate";

function AppHeader() {
  return (
    <div className="sticky top-0 z-40 px-5 py-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
      <Link href="/" className="text-lg font-semibold">JetSet Points</Link>
      <div className="flex items-center gap-2">
        <Link href="/region" className="rounded-full bg-neutral-800 px-3 py-1 text-sm">Region</Link>
        <Link href="/login" className="rounded-full bg-neutral-800 px-3 py-1 text-sm">Account</Link>
      </div>
    </div>
  );
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[92%] rounded-full bg-neutral-900/95 border border-neutral-800 shadow-2xl backdrop-blur px-4 py-2 flex items-center justify-between">
      <Link href="/" className="flex flex-col items-center text-xs text-white"><span className="text-xl">🏠</span>Home</Link>
      <Link href="/topup" className="-mt-9"><div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl border-4 border-neutral-900 shadow-xl">＋</div></Link>
      <Link href="/utilities" className="flex flex-col items-center text-xs text-neutral-400"><span className="text-xl">🧰</span>Utilities</Link>
    </nav>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-[#0a0a0a] text-white">
        <AuthGate>
          <AppHeader />
          <main className="pb-28">{children}</main>
          <BottomNav />
        </AuthGate>
      </body>
    </html>
  );
}
