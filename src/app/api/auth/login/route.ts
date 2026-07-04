import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { setSessionCookie, toSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const loginSchema = z.object({
  email: z.email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required."),
});

export async function POST(request: Request) {
  const payload = loginSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { message: payload.error.issues[0]?.message ?? "Invalid login details." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: payload.data.email },
  });

  if (!user) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  const passwordMatches = await bcrypt.compare(payload.data.password, user.passwordHash);

  if (!passwordMatches) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  const sessionUser = toSessionUser(user);
  await setSessionCookie(sessionUser);

  return NextResponse.json({ user: sessionUser });
}
