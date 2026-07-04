import { NextResponse } from "next/server";

import { demoOrders } from "@/lib/mock-data";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { orderId } = await context.params;
  const order = demoOrders.find((entry) => entry.id === orderId);

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    orderId: order.id,
    status: order.status,
    etaMinutes: order.etaMinutes,
    rider: order.rider,
    timeline: order.timeline,
  });
}
