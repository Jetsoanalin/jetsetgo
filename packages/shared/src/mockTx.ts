export type TxSeed = Record<string, string | number | null | undefined>;

function segHash(s: string, salt: number) {
  let h = (0x811c9dc5 ^ salt) >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function mockTxHash(seed: TxSeed): string {
  const base = JSON.stringify(seed);
  let out = "0x";
  for (let i = 0; i < 8; i++) out += segHash(base + "|" + i, 0x9e3779b9 + i);
  return out;
} 