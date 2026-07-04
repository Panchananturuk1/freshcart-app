import { NextResponse } from "next/server";

import { randomInt } from "crypto";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

type CreateOrderPayload = {
  addressId?: string | null;
  paymentMethod: "UPI" | "CARD" | "WALLET";
  items: Array<{ productId: string; quantity: number }>;
};

const buildDisplayId = () => `FC-${randomInt(100000, 999999)}`;

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: true } },
      events: { orderBy: { createdAt: "asc" } },
      address: true,
    },
  });

  return NextResponse.json({ items: orders });
}

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as CreateOrderPayload;

  if (!payload?.paymentMethod || !Array.isArray(payload.items) || payload.items.length === 0) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const normalizedItems = payload.items
    .filter((entry) => entry && typeof entry.productId === "string" && Number.isFinite(entry.quantity))
    .map((entry) => ({ productId: entry.productId, quantity: Math.max(1, Math.floor(entry.quantity)) }));

  if (normalizedItems.length === 0) {
    return NextResponse.json({ message: "Invalid items" }, { status: 400 });
  }

  if (payload.addressId) {
    const address = await prisma.address.findFirst({ where: { id: payload.addressId, userId: user.id } });
    if (!address) {
      return NextResponse.json({ message: "Invalid address" }, { status: 400 });
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const productIds = Array.from(new Set(normalizedItems.map((entry) => entry.productId)));
    const products = await tx.product.findMany({ where: { id: { in: productIds } } });
    const productById = new Map(products.map((p) => [p.id, p]));

    for (const item of normalizedItems) {
      const product = productById.get(item.productId);
      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }
      if (product.stock < item.quantity) {
        throw new Error("OUT_OF_STOCK");
      }
    }

    const total = normalizedItems.reduce((sum, item) => {
      const product = productById.get(item.productId)!;
      return sum + product.price * item.quantity;
    }, 0);

    for (const item of normalizedItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const displayId = buildDisplayId();

    const order = await tx.order.create({
      data: {
        displayId,
        userId: user.id,
        addressId: payload.addressId ?? null,
        total,
        paymentMethod: payload.paymentMethod,
        status: "PLACED",
        etaMinutes: 18,
        riderName: "Ravi",
        riderPhoneMasked: "+91 •••• •• 731",
        riderVehicle: "Electric scooter",
        items: {
          create: normalizedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: productById.get(item.productId)!.price,
          })),
        },
        events: {
          create: [
            { status: "PLACED", note: "Order placed" },
            { status: "CONFIRMED", note: "Store confirmed" },
          ],
        },
      },
      include: {
        items: { include: { product: true } },
        address: true,
        events: { orderBy: { createdAt: "asc" } },
      },
    });

    return order;
  });

  return NextResponse.json(
    {
      orderId: result.displayId,
      order: result,
    },
    { status: 201 },
  );
}
