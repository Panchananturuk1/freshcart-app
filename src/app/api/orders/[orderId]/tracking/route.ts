import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

const statusLabel = (status: string) => {
  switch (status) {
    case "PLACED":
      return "Placed";
    case "CONFIRMED":
      return "Confirmed";
    case "PICKING":
      return "Picking";
    case "PACKED":
      return "Packed";
    case "OUT_FOR_DELIVERY":
      return "Out for delivery";
    case "DELIVERED":
      return "Delivered";
    default:
      return status;
  }
};

export async function GET(_: Request, context: RouteContext) {
  const { orderId } = await context.params;
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ displayId: orderId }, { id: orderId }],
      ...(user.role === "admin" || user.role === "ops" ? {} : { userId: user.id }),
    },
    include: { events: { orderBy: { createdAt: "asc" } }, address: true },
  });

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: order.displayId,
    status: statusLabel(order.status),
    etaMinutes: order.etaMinutes,
    addressLabel: order.address?.title ?? "Saved Address",
    rider: {
      name: order.riderName,
      phoneMasked: order.riderPhoneMasked,
      vehicle: order.riderVehicle,
    },
    timeline: order.events.map((event) => ({
      status: statusLabel(event.status),
      time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(event.createdAt),
      note: event.note,
    })),
  });
}
