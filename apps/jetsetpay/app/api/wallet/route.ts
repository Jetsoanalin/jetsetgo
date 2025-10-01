import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@jetset/shared/dist/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const body = await req.json();
    const { userId, currency = 'USD', newBalance } = body as any;
    if (typeof newBalance === 'number' && userId) {
      const { error } = await admin.from('wallet_balances').upsert({ userId, currency, balance: newBalance }, { onConflict: 'userId,currency' });
      if (error) throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || '';
    const currency = searchParams.get('currency') || 'USD';
    const { data, error } = await admin
      .from('wallet_balances')
      .select('*')
      .eq('userId', userId)
      .eq('currency', currency)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({ ok: true, balance: data?.balance || 0 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
} 