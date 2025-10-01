export type CountryCode = 'IN' | 'SG' | 'MY' | 'ID' | 'TH' | 'VN' | 'PH' | 'KH' | 'LA' | 'MN';

export type CountryConfig = {
  code: CountryCode;
  name: string;
  currencyCode: string;
  per1000JP: number; // local currency value for 1,000 JP (equals 1 USD in our model)
  qrSystem: string;
  flag: string;
};

export const COUNTRIES: CountryConfig[] = [
  { code: 'IN', name: 'India', currencyCode: 'INR', per1000JP: 91, qrSystem: 'UPI', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapore', currencyCode: 'SGD', per1000JP: 1.36, qrSystem: 'PayNow', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', currencyCode: 'MYR', per1000JP: 4.30, qrSystem: 'DuitNow', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', currencyCode: 'IDR', per1000JP: 15300, qrSystem: 'QRIS', flag: '🇮🇩' },
  { code: 'TH', name: 'Thailand', currencyCode: 'THB', per1000JP: 36.5, qrSystem: 'PromptPay', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', currencyCode: 'VND', per1000JP: 24600, qrSystem: 'VietQR', flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', currencyCode: 'PHP', per1000JP: 56.5, qrSystem: 'QR Ph', flag: '🇵🇭' },
  { code: 'KH', name: 'Cambodia', currencyCode: 'KHR', per1000JP: 4100, qrSystem: 'Bakong', flag: '🇰🇭' },
  { code: 'LA', name: 'Laos', currencyCode: 'LAK', per1000JP: 21000, qrSystem: 'LaoQR', flag: '🇱🇦' },
  { code: 'MN', name: 'Mongolia', currencyCode: 'MNT', per1000JP: 3450, qrSystem: 'Wallet QR', flag: '🇲🇳' },
];

export function getCountry(code: CountryCode): CountryConfig {
  const found = COUNTRIES.find((c) => c.code === code);
  return found || COUNTRIES[0];
}

// Loyalty redemption peg: JP required for 1 unit of local currency.
// Default 1,250 JP = 1 unit. Override per market here if needed.
export function getRedemptionJPPerLocalUnit(_code: CountryCode): number {
  return 1250;
}

export async function fetchDynamicRedemptionJP(code: CountryCode): Promise<number> {
  // Try App A conversion API; fallback to default peg
  try {
    const res = await fetch('/api/conversion');
    if (res.ok) {
      const j = await res.json();
      // If API returns base=JP with quote map per currency, compute JP for 1 unit
      // 1,000 JP = quote[currency] -> 1 {currency} = 1000 / quote
      const cfg = getCountry(code);
      const per1000 = j?.quote?.[cfg.currencyCode];
      if (typeof per1000 === 'number' && per1000 > 0) {
        return Math.round(1000 / per1000);
      }
    }
  } catch {}
  return getRedemptionJPPerLocalUnit(code);
}

export function convertLocalToJP(amountLocal: number, code: CountryCode): number {
  const { per1000JP } = getCountry(code);
  return Math.round((amountLocal / per1000JP) * 1000);
}

export function convertJPToLocal(amountJP: number, code: CountryCode): number {
  const { per1000JP } = getCountry(code);
  return (amountJP / 1000) * per1000JP;
}

// In this model 1 USD == 1,000 JP. So per1000JP also equals the local value of 1 USD.
export function convertUSDToLocal(amountUSD: number, code: CountryCode): number {
  const { per1000JP } = getCountry(code);
  return amountUSD * per1000JP;
}

export function convertLocalToUSD(amountLocal: number, code: CountryCode): number {
  const { per1000JP } = getCountry(code);
  return amountLocal / per1000JP;
}

export function currencySymbol(currencyCode: string): string {
  switch (currencyCode) {
    case 'INR': return '₹';
    case 'THB': return '฿';
    case 'IDR': return 'Rp';
    case 'VND': return '₫';
    case 'PHP': return '₱';
    case 'USD': return '$';
    case 'SGD': return 'S$';
    case 'MYR': return 'RM';
    case 'KHR': return '៛';
    case 'LAK': return '₭';
    case 'MNT': return '₮';
    default: return '';
  }
} 