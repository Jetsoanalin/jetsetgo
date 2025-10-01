import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@jetset/shared/dist/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const { userId, deltaJP, description, walletAmount, walletCurrency } = await req.json();

    // Points allocation
    if (typeof deltaJP === 'number' && deltaJP !== 0) {
      const { data: cur } = await admin.from('points_balances').select('*').eq('userId', userId).single();
      const newBal = (cur?.balance || 0) + (deltaJP || 0);
      const { error: upErr } = await admin.from('points_balances').upsert({ userId, balance: newBal }, { onConflict: 'userId' });
      if (upErr) throw upErr;
      const { error: ledErr } = await admin.from('points_ledger').insert({ userId, deltaJP, description: description || 'Admin allocation' });
      if (ledErr) throw ledErr;
    }

    // Wallet credit (payments record + wallet_balances upsert)
    if (typeof walletAmount === 'number' && walletAmount > 0) {
      const currency = walletCurrency || 'USD';
      const { error: payErr } = await admin.from('payments').insert({
        userId,
        merchantId: 'ADMIN_TOPUP',
        amount: walletAmount,
        currency,
        method: 'wallet',
        countryCode: null,
        placeName: 'Admin Credit',
      });
      if (payErr) throw payErr;
      const { data: wcur } = await admin.from('wallet_balances').select('*').eq('userId', userId).eq('currency', currency).maybeSingle();
      const newWBal = (wcur?.balance || 0) + walletAmount;
      const { error: wErr } = await admin.from('wallet_balances').upsert({ userId, currency, balance: newWBal }, { onConflict: 'userId,currency' });
      if (wErr) throw wErr;
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
} 