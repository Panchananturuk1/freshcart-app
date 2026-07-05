"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { AppShell, AppTopBar, ScreenContent } from "@/components/app-shell";
import type { AppUser } from "@/lib/auth-types";
import { useAppStore } from "@/store/use-app-store";

type AuthResponse = {
  user?: AppUser;
  message?: string;
};

function SignUpLink() {
  const searchParams = useSearchParams();
  const signUpHref = useMemo(() => {
    const redirectTo = searchParams.get("redirectTo");
    if (redirectTo && redirectTo.startsWith("/")) {
      return `/auth/sign-up?redirectTo=${encodeURIComponent(redirectTo)}`;
    }
    return "/auth/sign-up";
  }, [searchParams]);

  return (
    <Link href={signUpHref} className="font-semibold text-lime-300">
      Create an account
    </Link>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const signIn = useAppStore((state) => state.signIn);
  const refreshAddresses = useAppStore((state) => state.refreshAddresses);
  const refreshOrders = useAppStore((state) => state.refreshOrders);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") || ""),
        password: String(formData.get("password") || ""),
      }),
    });

    const data = (await response.json()) as AuthResponse;

    if (!response.ok || !data.user) {
      setError(data.message ?? "Unable to sign in right now.");
      setIsSubmitting(false);
      return;
    }

    signIn(data.user);
    await Promise.all([refreshAddresses(), refreshOrders()]);
    const redirectTo =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirectTo") : null;
    const destination =
      redirectTo && redirectTo.startsWith("/")
        ? redirectTo
        : data.user.role === "admin" || data.user.role === "ops"
          ? "/admin"
          : "/account";
    router.push(destination);
    router.refresh();
  };

  return (
    <AppShell>
      <AppTopBar title="Sign in" subtitle="Use your saved FreshCart account" showSearchShortcut={false} />
      <ScreenContent>
        <section className="rounded-[2rem] border border-white/8 bg-white/5 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/60">Authentication</p>
          <h1 className="mt-3 font-serif text-4xl text-white">Sign in securely</h1>
          <form method="post" onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input name="email" type="email" placeholder="Email address" className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-emerald-100/45" />
            <input name="password" type="password" placeholder="Password" className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-emerald-100/45" />
            {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-lime-300 px-4 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="mt-5 text-sm text-emerald-50/72">
            New here?{" "}
            <Suspense
              fallback={
                <Link href="/auth/sign-up" className="font-semibold text-lime-300">
                  Create an account
                </Link>
              }
            >
              <SignUpLink />
            </Suspense>
          </p>
        </section>
      </ScreenContent>
    </AppShell>
  );
}
