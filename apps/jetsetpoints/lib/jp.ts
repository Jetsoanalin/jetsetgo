export type JPLedgerItem = {
  id: string;
  type: 'credit' | 'debit';
  amountJP: number;
  description: string;
  createdAt: string;
};

const KEY_BALANCE = 'jp_balance';
const KEY_LEDGER = 'jp_ledger';
const KEY_NFT_PASSPORT = 'jp_nft_passport';
const KEY_BADGES = 'jp_badges';
const KEY_VISITED = 'jp_visited_countries';

export function getBalanceJP(): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(KEY_BALANCE);
  if (!raw) {
    localStorage.setItem(KEY_BALANCE, '0');
    return 0;
  }
  return Number(raw) || 0;
}

export function setBalanceJP(v: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_BALANCE, String(Math.max(0, Math.floor(v))));
}

export function addLedger(item: Omit<JPLedgerItem, 'id' | 'createdAt'> & { createdAt?: string }): JPLedgerItem {
  const current = getLedger();
  const full: JPLedgerItem = {
    id: crypto.randomUUID(),
    createdAt: item.createdAt || new Date().toISOString(),
    ...item,
  } as JPLedgerItem;
  current.unshift(full);
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY_LEDGER, JSON.stringify(current));
  }
  return full;
}

export function getLedger(): JPLedgerItem[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(KEY_LEDGER);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export async function spendJP(amountJP: number, description: string): Promise<{ ok: boolean; newBalance: number }> {
  const bal = getBalanceJP();
  if (bal < amountJP) return { ok: false, newBalance: bal };
  const next = bal - amountJP;
  setBalanceJP(next);
  addLedger({ type: 'debit', amountJP, description });
  try {
    await fetch('/api/points', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: 'local', balance: next, deltaJP: -amountJP, description }) });
  } catch {}
  return { ok: true, newBalance: next };
}

export async function creditJP(amountJP: number, description: string) {
  const next = getBalanceJP() + amountJP;
  setBalanceJP(next);
  addLedger({ type: 'credit', amountJP, description });
  try {
    await fetch('/api/points', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: 'local', balance: next, deltaJP: amountJP, description }) });
  } catch {}
}

export function getNftPassport(): { minted: boolean; txHash?: string } {
  if (typeof window === 'undefined') return { minted: false };
  const raw = localStorage.getItem(KEY_NFT_PASSPORT);
  if (!raw) return { minted: false };
  try { return JSON.parse(raw); } catch { return { minted: false }; }
}

export function setNftPassport(txHash: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_NFT_PASSPORT, JSON.stringify({ minted: true, txHash }));
}

export function getBadges(): string[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(KEY_BADGES);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function addBadge(label: string) {
  const cur = new Set(getBadges());
  cur.add(label);
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY_BADGES, JSON.stringify(Array.from(cur)));
  }
}

export function getVisitedCountries(): string[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(KEY_VISITED);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function addVisitedCountry(code: string) {
  const cur = new Set(getVisitedCountries());
  cur.add(code);
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY_VISITED, JSON.stringify(Array.from(cur)));
  }
} 