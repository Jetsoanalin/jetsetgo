import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@jetset/shared/dist/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const body = await req.json();
    if (!body?.paymentId || !body?.scheme) {
      return NextResponse.json({ ok: false, error: 'paymentId and scheme are required' }, { status: 400 });
    }
    const row = {
      payment_id: body.paymentId,
      scheme: body.scheme,
      mode: body.mode ?? null,
      aid: body.aid ?? null,
      billerid: body.billerId ?? null,
      proxyid: body.proxyId ?? null,
      merchantname: body.merchantName ?? null,
      ref1: body.ref1 ?? null,
      ref2: body.ref2 ?? null,
      rawpayload: body.rawPayload ?? null,
      decoded: body.decoded ?? {},
    };
    const { data, error } = await admin
      .from('payment_qr_details')
      .upsert(row as any, { onConflict: 'payment_id' })
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
} 