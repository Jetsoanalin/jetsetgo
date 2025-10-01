import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@jetset/shared/dist/supabaseAdmin';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.from('payments').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
} 