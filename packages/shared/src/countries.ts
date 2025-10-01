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
  { code: 'IN', name: 'India', currencyCode: 'INR', per1000JP: 100, qrSystem: 'UPI QR', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapore', currencyCode: 'SGD', per1000JP: 1.35, qrSystem: 'PayNow', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', currencyCode: 'MYR', per1000JP: 4.70, qrSystem: 'DuitNow', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', currencyCode: 'IDR', per1000JP: 15500, qrSystem: 'QRIS', flag: '🇮🇩' },
  { code: 'TH', name: 'Thailand', currencyCode: 'THB', per1000JP: 36, qrSystem: 'PromptPay', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', currencyCode: 'VND', per1000JP: 24500, qrSystem: 'VietQR', flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', currencyCode: 'PHP', per1000JP: 56, qrSystem: 'QR Ph', flag: '🇵🇭' },
  { code: 'KH', name: 'Cambodia', currencyCode: 'USD', per1000JP: 1, qrSystem: 'Bakong', flag: '🇰🇭' },
  { code: 'LA', name: 'Laos', currencyCode: 'LAK', per1000JP: 20000, qrSystem: 'LaoQR', flag: '🇱🇦' },
  { code: 'MN', name: 'Mongolia', currencyCode: 'MNT', per1000JP: 3400, qrSystem: 'Wallet QR', flag: '🇲🇳' },
];

export function getCountry(code: CountryCode): CountryConfig {
  const found = COUNTRIES.find((c) => c.code === code);
  return found || COUNTRIES[0];
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