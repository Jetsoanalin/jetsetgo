"use client";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";

const SESSION_KEY = "jetset_session";

export default function AuthGate({ children }: { children: ReactNode }) {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  const isPublic = pathname?.startsWith("/login") || pathname?.startsWith("/region") || pathname?.startsWith("/api/") || false;

  useEffect(() => {
    async function maybeExchange() {
      try {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        if (!url) return;
        const hasCode = url.includes("?code=") || url.includes("#access_token=") || url.includes("type=magiclink");
        if (hasCode) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (!error && data.session) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      } catch {}
    }

    async function init() {
      await maybeExchange();
      const { data } = await supabase.auth.getSession();
      const sess = data.session || null;
      if (sess) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
        setReady(true);
        if (pathname === "/login") router.replace("/");
      } else if (!isPublic) {
        setReady(true);
        router.replace("/login");
      } else {
        setReady(true);
      }
    }
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        if (pathname === "/login") router.replace("/");
      } else {
        localStorage.removeItem(SESSION_KEY);
        if (!isPublic) router.replace("/login");
      }
    });
    return () => { sub.subscription.unsubscribe(); };
  }, [supabase, router, pathname, isPublic]);

  if (!ready) return null;
  return <>{children}</>;
} 