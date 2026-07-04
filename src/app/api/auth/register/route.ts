import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { setSessionCookie, toSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  email: z.email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(8, "Phone number is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function POST(request: Request) {
  const payload = registerSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { message: payload.error.issues[0]?.message ?? "Invalid registration details." },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.data.email },
  });

  if (existingUser) {
    return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(payload.data.password, 10);
  const user = await prisma.user.create({
    data: {
      fullName: payload.data.fullName,
      email: payload.data.email,
      phone: payload.data.phone,
      passwordHash,
    },
  });

  const sessionUser = toSessionUser(user);
  await setSessionCookie(sessionUser);

  return NextResponse.json({ user: sessionUser }, { status: 201 });
}
