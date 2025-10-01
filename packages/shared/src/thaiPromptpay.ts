export type PromptPayDecoded = {
  format: 'promptpay';
  mode: 'bill_payment' | 'credit_transfer';
  currency?: string;
  country?: string;
  merchantName?: string;
  city?: string;
  postalCode?: string;
  billerId?: string;
  ref1?: string;
  ref2?: string;
  proxyId?: string;
  aid?: string;
};

// Minimal EMVCo TLV parser for numeric tags
export function parseEmvTlv(payload: string): Record<string, any> {
  const out: Record<string, any> = {};
  let i = 0;
  const read = (n: number) => payload.slice(i, i += n);
  while (i < payload.length) {
    const tag = read(2);
    const len = parseInt(read(2), 10);
    const val = read(len);
    if (!tag || Number.isNaN(len)) break;
    out[tag] = val;
  }
  return out;
}

function parseMerchantInfo(val: string): Record<string, string> {
  const out: Record<string, string> = {};
  let i = 0;
  const read = (n: number) => val.slice(i, i += n);
  while (i < val.length) {
    const tag = read(2);
    const len = parseInt(read(2), 10);
    const v = read(len);
    if (!tag || Number.isNaN(len)) break;
    out[tag] = v;
  }
  return out;
}

export function decodeThaiPromptPay(payload: string): PromptPayDecoded[] {
  const tlv = parseEmvTlv(payload);
  const results: PromptPayDecoded[] = [];
  // 30..31 are MAI templates
  for (const id of ['30','31','29']) {
    if (!tlv[id]) continue;
    const mai = parseMerchantInfo(tlv[id]);
    const aid = mai['00'];
    if (!aid) continue;
    if (aid.startsWith('A000000677010112')) {
      results.push({
        format: 'promptpay',
        mode: 'bill_payment',
        aid,
        currency: tlv['53'],
        country: tlv['58'],
        merchantName: tlv['59'],
        city: tlv['60'],
        postalCode: tlv['61'],
        billerId: mai['01'],
        ref1: mai['02'],
        ref2: mai['03'],
      });
    } else if (aid.startsWith('A000000677010113') || aid.startsWith('A000000677010111')) {
      results.push({
        format: 'promptpay',
        mode: 'credit_transfer',
        aid,
        currency: tlv['53'],
        country: tlv['58'],
        merchantName: tlv['59'],
        proxyId: mai['01'] || mai['03'],
        ref1: mai['02'],
        ref2: mai['03'],
      });
    }
  }
  return results;
} 