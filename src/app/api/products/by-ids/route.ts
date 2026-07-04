import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

type Payload = { ids: string[] };

export async function POST(request: Request) {
  const payload = (await request.json()) as Payload;
  const ids = Array.isArray(payload?.ids) ? payload.ids.filter((id) => typeof id === "string") : [];

  if (ids.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const items = await prisma.product.findMany({ where: { id: { in: ids } } });
  return NextResponse.json({ items });
}

