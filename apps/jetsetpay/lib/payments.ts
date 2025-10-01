export type Payment = {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  method: 'wallet' | 'points';
  countryCode?: string; // e.g., 'TH', 'IN', 'ID'
  placeName?: string; // e.g., 'Bangkok - Coffee House'
  createdAt: string;
};

const KEY_PAYMENTS = 'pay_history_with_locations';

export function addPayment(p: Omit<Payment, 'id' | 'createdAt'> & { createdAt?: string }): Payment {
  const full: Payment = {
    id: crypto.randomUUID(),
    createdAt: p.createdAt || new Date().toISOString(),
    ...p,
  };
  const cur = getPayments();
  cur.unshift(full);
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY_PAYMENTS, JSON.stringify(cur));
    // Notify App A to update visited/badges (hackathon bridge)
    try { window.postMessage({ type: 'jetset:new-payment', payment: full }, '*'); } catch {}
  }
  return full;
}

export function getPayments(): Payment[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(KEY_PAYMENTS);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
} 