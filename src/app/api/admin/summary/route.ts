import { NextResponse } from "next/server";

import { adminStats, demoOrders } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    stats: adminStats,
    liveOrders: demoOrders,
  });
}
