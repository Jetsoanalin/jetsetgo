import { NextResponse } from "next/server";

export async function GET() {
  // Mock: 1,000 JP = 1 USD
  const data = {
    base: "JP",
    quote: {
      USD: 0.001,
      INR: 0.083,
      IDR: 15.5,
      THB: 0.037,
    },
    updatedAt: new Date().toISOString(),
  };
  return NextResponse.json(data);
} 