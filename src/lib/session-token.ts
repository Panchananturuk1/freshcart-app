import { SignJWT, jwtVerify } from "jose";

import type { AppUser } from "@/lib/auth-types";

export const SESSION_COOKIE_NAME = "freshcart_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

const getAuthSecret = () =>
  new TextEncoder().encode(process.env.AUTH_SECRET ?? "freshcart-dev-auth-secret");

export const createSessionToken = async (user: AppUser) =>
  new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getAuthSecret());

export const verifySessionToken = async (token: string): Promise<AppUser | null> => {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());

    return {
      id: String(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as AppUser["role"],
    };
  } catch {
    return null;
  }
};
