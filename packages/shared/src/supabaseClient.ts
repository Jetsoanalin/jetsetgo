import { createClient } from '@supabase/supabase-js';

let cached: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient(url?: string, anonKey?: string) {
  const supabaseUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase envs');
  }
  if (cached) return cached;
  cached = createClient(supabaseUrl, supabaseAnonKey);
  return cached;
}
