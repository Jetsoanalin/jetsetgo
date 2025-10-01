import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@jetset/shared/dist/supabaseAdmin';

export async function GET(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || '';
    if (!userId) return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 });
    const { data, error } = await admin.from('user_profiles').select('*').eq('userId', userId).maybeSingle();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const body = await req.json();
    const row = {
      userId: body.userId,
      displayName: body.displayName,
      updatedAt: new Date().toISOString(),
    };
    const { data, error } = await admin.from('user_profiles').upsert(row as any, { onConflict: 'userId' }).select('*').single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
} 