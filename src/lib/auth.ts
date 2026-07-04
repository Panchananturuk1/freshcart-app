import { UserRole, type User } from "@prisma/client";
import { cookies } from "next/headers";

import type { AppUser } from "@/lib/auth-types";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  verifySessionToken,
} from "@/lib/session-token";

const roleMap: Record<UserRole, AppUser["role"]> = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  OPS: "ops",
  DELIVERY: "delivery",
};

export const toSessionUser = (user: Pick<User, "id" | "fullName" | "email" | "role">): AppUser => ({
  id: user.id,
  name: user.fullName,
  email: user.email,
  role: roleMap[user.role],
});

export const setSessionCookie = async (user: AppUser) => {
  const cookieStore = await cookies();
  const token = await createSessionToken(user);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });
};

export const clearSessionCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
};

export const getSessionUser = async (): Promise<AppUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
};
