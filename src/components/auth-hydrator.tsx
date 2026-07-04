"use client";

import { useEffect } from "react";

import type { AppUser } from "@/lib/auth-types";
import { useAppStore } from "@/store/use-app-store";

type SessionResponse = {
  user: AppUser | null;
};

export function AuthHydrator() {
  const hydrateUser = useAppStore((state) => state.hydrateUser);
  const refreshAddresses = useAppStore((state) => state.refreshAddresses);
  const refreshOrders = useAppStore((state) => state.refreshOrders);

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
          if (data.user) {
            await Promise.all([refreshAddresses(), refreshOrders()]);
          } else {
            await Promise.all([refreshAddresses(), refreshOrders()]);
          }
        }
      } catch {
        if (active) {
          hydrateUser(null);
          await Promise.all([refreshAddresses(), refreshOrders()]);
        }
      }
    };

    void loadSession();

    return () => {
      active = false;
    };
  }, [hydrateUser, refreshAddresses, refreshOrders]);

  return null;
}
