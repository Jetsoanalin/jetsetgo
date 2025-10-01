import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@jetset/shared/dist/supabaseAdmin';

export async function GET(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || '';
    if (!userId) return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 });
    const { data, error } = await admin.from('user_chain_addresses').select('address').eq('userid', userId).limit(1);
    if (error) throw error;
    const exists = Array.isArray(data) && data.length > 0;
    return NextResponse.json({ ok: true, exists });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
} 