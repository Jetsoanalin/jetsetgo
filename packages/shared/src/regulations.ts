import type { CountryCode } from './countries';

type Regulation = {
  walletAllowed: boolean;
  note?: string;
};

const MATRIX: Record<CountryCode, Regulation> = {
  IN: { walletAllowed: false, note: 'Wallet very restricted, PSP only. Use loyalty points.' },
  ID: { walletAllowed: true, note: 'Via local PSP partner, merchant QR only.' },
  VN: { walletAllowed: true, note: 'Merchant QR, wallet allowed with partner.' },
  TH: { walletAllowed: true, note: 'Merchant QR only, P2P not supported.' },
  MY: { walletAllowed: true, note: 'Wallet and loyalty both possible.' },
  SG: { walletAllowed: true, note: 'Wallet + loyalty, open regulations.' },
  PH: { walletAllowed: true, note: 'Wallet + loyalty, multiple PSPs.' },
  KH: { walletAllowed: true, note: 'Wallet + loyalty, open regulatory stance.' },
  LA: { walletAllowed: true, note: 'Merchant QR possible via partner.' },
  MN: { walletAllowed: true, note: 'Developing market, wallet feasible with partners.' },
};

export function isWalletAllowed(code: CountryCode): boolean {
  return (MATRIX[code]?.walletAllowed ?? true) === true;
}

export function getRegulation(code: CountryCode): Regulation {
  return MATRIX[code] || { walletAllowed: true };
} 