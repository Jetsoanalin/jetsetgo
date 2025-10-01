import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@jetset/shared/dist/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const body = await req.json();
    const row = {
      userId: body.userId ?? null,
      merchantId: body.merchantId ?? null,
      amount: body.amount != null ? Number(body.amount) : null,
      currency: body.currency ?? null,
      method: body.method ?? null,
      countryCode: body.countryCode ?? null,
      placeName: body.placeName ?? null,
      createdAt: body.createdAt ?? null,
      status: body.status ?? 'success',
      txref: body.txRef ?? body.txref ?? null,
      extra: body.extra ?? {},
      fxsnapshot: body.fxSnapshot ?? body.fxsnapshot ?? null,
      pointsredeemed: body.pointsRedeemed != null ? Number(body.pointsRedeemed) : (body.pointsredeemed != null ? Number(body.pointsredeemed) : 0),
    } as const;
    const { data, error } = await admin.from('payments').insert(row as any).select('*').single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || '';
    const { data, error } = await admin
      .from('payments')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
} 