import Link from "next/link";

export default function BottomNav({ active = "pay" as "home" | "pay" | "me" }) {
  return (
    <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[92%] rounded-full bg-neutral-900/95 border border-neutral-800 shadow-2xl backdrop-blur px-4 py-2 flex items-center justify-between">
      <Link href="/" className={`flex flex-col items-center text-xs ${active === "home" ? "text-white" : "text-neutral-400"}`}>
        <span className="text-xl">🏠</span>
        Home
      </Link>
      <Link href="/scan" className="-mt-9">
        <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl border-4 border-neutral-900 shadow-xl">
          ⎘
        </div>
      </Link>
      <Link href="/settings" className={`flex flex-col items-center text-xs ${active === "me" ? "text-white" : "text-neutral-400"}`}>
        <span className="text-xl">👤</span>
        Me
      </Link>
    </nav>
  );
} 