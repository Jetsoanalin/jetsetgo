import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@jetset/shared/dist/supabaseAdmin';

export async function GET(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').toLowerCase();
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) throw error;
    const users = (data.users || []).filter((u: any) => (u.email || '').toLowerCase().includes(q)).slice(0, 20);
    return NextResponse.json({ ok: true, users });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
} 