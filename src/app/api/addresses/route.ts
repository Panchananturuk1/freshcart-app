import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

type CreateAddressPayload = {
  label: "HOME" | "WORK" | "OTHER";
  title: string;
  line1: string;
  line2: string;
  city: string;
  eta: string;
  isDefault?: boolean;
};

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ items: addresses });
}

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as CreateAddressPayload;

  if (!payload?.label || !payload?.title || !payload?.line1 || !payload?.line2 || !payload?.city || !payload?.eta) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const created = await prisma.$transaction(async (tx) => {
    if (payload.isDefault) {
      await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }

    return tx.address.create({
      data: {
        userId: user.id,
        label: payload.label,
        title: payload.title,
        line1: payload.line1,
        line2: payload.line2,
        city: payload.city,
        eta: payload.eta,
        isDefault: payload.isDefault ?? false,
      },
    });
  });

  return NextResponse.json(created, { status: 201 });
}

