import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser, setSessionCookie, toSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  phone: z.string().trim().min(8).optional(),
  email: z.email().transform((value) => value.toLowerCase()).optional(),
});

export async function GET() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, fullName: true, email: true, phone: true, role: true, createdAt: true, updatedAt: true },
  });

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = updateProfileSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ message: "Invalid profile payload." }, { status: 400 });
  }

  if (!payload.data.fullName && !payload.data.phone && !payload.data.email) {
    return NextResponse.json({ message: "Nothing to update." }, { status: 400 });
  }

  if (payload.data.email) {
    const existing = await prisma.user.findUnique({ where: { email: payload.data.email } });
    if (existing && existing.id !== sessionUser.id) {
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
    }
  }

  const updated = await prisma.user.update({
    where: { id: sessionUser.id },
    data: {
      ...(payload.data.fullName ? { fullName: payload.data.fullName } : {}),
      ...(payload.data.phone ? { phone: payload.data.phone } : {}),
      ...(payload.data.email ? { email: payload.data.email } : {}),
    },
    select: { id: true, fullName: true, email: true, phone: true, role: true },
  });

  await setSessionCookie(toSessionUser(updated));

  return NextResponse.json({ user: updated });
}

