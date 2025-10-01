export type Payment = {
  id: string;
  userId?: string;
  merchantId: string;
  amount: number;
  currency: string;
  method: 'wallet' | 'points';
  countryCode?: string; // e.g., 'TH', 'IN', 'ID'
  placeName?: string; // e.g., 'Bangkok - Coffee House'
  createdAt: string;
  status?: string;
  txRef?: string;
  extra?: any;
  fxSnapshot?: any;
  pointsRedeemed?: number;
};

const KEY_PAYMENTS = 'pay_history_with_locations';

export async function addPayment(p: Omit<Payment, 'id' | 'createdAt'> & { createdAt?: string; qrDetails?: any }): Promise<Payment> {
  const payload = { createdAt: p.createdAt || new Date().toISOString(), ...p } as Omit<Payment, 'id'> & { qrDetails?: any };
  let server: Payment | null = null;
  if (typeof window !== 'undefined') {
    try {
      const r = await fetch('/api/payments', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (j?.ok && j?.data?.id) {
        server = j.data as Payment;
      }
    } catch {}
  }
  const final: Payment = server || ({ id: crypto.randomUUID(), ...payload } as Payment);
  if (typeof window !== 'undefined') {
    const cur = getPayments();
    cur.unshift(final);
    localStorage.setItem(KEY_PAYMENTS, JSON.stringify(cur));
  }
  return final;
}

export function getPayments(): Payment[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(KEY_PAYMENTS);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
} 