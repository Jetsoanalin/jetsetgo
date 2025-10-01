import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@jetset/shared/dist/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const body = await req.json();
    const { userId, balance, deltaJP, description } = body as { userId: string; balance: number; deltaJP: number; description: string };

    // Upsert balance
    const { data: bal, error: upErr } = await admin.from('points_balances').upsert({ userId, balance }, { onConflict: 'userId' }).select('*').single();
    if (upErr) throw upErr;

    // Insert ledger
    const { data: ledger, error: ledErr } = await admin.from('points_ledger').insert({ userId, deltaJP, description }).select('*').single();
    if (ledErr) throw ledErr;

    return NextResponse.json({ ok: true, balance: bal, ledger });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || '';
    const { data: bal } = await admin.from('points_balances').select('*').eq('userId', userId).single();
    const { data: ledger } = await admin.from('points_ledger').select('*').eq('userId', userId).order('createdAt', { ascending: false }).limit(100);
    return NextResponse.json({ ok: true, balance: bal, ledger });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
} 