import { createClient } from '@supabase/supabase-js';

let adminCached: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase admin envs');
  }
  if (adminCached) return adminCached;
  adminCached = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  return adminCached;
} 