"use client";

import { useEffect } from "react";

import type { AppUser } from "@/lib/auth-types";
import { useAppStore } from "@/store/use-app-store";

type SessionResponse = {
  user: AppUser | null;
};

export function AuthHydrator() {
  const hydrateUser = useAppStore((state) => state.hydrateUser);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = (await response.json()) as SessionResponse;

        if (active) {
          hydrateUser(data.user ?? null);
        }
      } catch {
        if (active) {
          hydrateUser(null);
        }
      }
    };

    void loadSession();

    return () => {
      active = false;
    };
  }, [hydrateUser]);

  return null;
}
