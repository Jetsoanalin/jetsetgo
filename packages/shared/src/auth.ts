import { getSupabaseClient } from './supabaseClient';

export async function getAuthUserId(): Promise<string | null> {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id || null;
  } catch {
    return null;
  }
} 