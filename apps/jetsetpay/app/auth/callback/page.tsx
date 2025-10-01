"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@jetset/shared/dist/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    async function handle() {
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      }
      router.replace('/');
    }
    handle();
  }, [params, router, supabase]);

  return null;
} 