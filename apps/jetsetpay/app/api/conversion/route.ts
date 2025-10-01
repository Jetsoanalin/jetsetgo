import { NextResponse } from "next/server";
import { COUNTRIES } from "@jetset/shared/dist/countries";

export async function GET() {
  // Base JP → per-1-JP quote in local currency derived from per1000JP.
  const quote: Record<string, number> = {};
  for (const c of COUNTRIES) {
    // 1 JP = per1000JP / 1000 in local currency
    quote[c.currencyCode] = Number((c.per1000JP / 1000).toFixed(6));
  }
  const data = {
    base: "JP",
    quote,
    updatedAt: new Date().toISOString(),
  };
  return NextResponse.json(data);
} 