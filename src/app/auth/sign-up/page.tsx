"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell, AppTopBar, ScreenContent } from "@/components/app-shell";
import type { AppUser } from "@/lib/auth-types";
import { useAppStore } from "@/store/use-app-store";

type AuthResponse = {
  user?: AppUser;
  message?: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const signIn = useAppStore((state) => state.signIn);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName: String(formData.get("name") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
        password: String(formData.get("password") || ""),
      }),
    });

    const data = (await response.json()) as AuthResponse;

    if (!response.ok || !data.user) {
      setError(data.message ?? "Unable to create your account right now.");
      setIsSubmitting(false);
      return;
    }

    signIn(data.user);
    const redirectTo =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirectTo") : null;
    const destination = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/account";
    router.push(destination);
    router.refresh();
  };

  return (
    <AppShell>
      <AppTopBar title="Create account" subtitle="Register with email and password" showSearchShortcut={false} />
      <ScreenContent>
        <section className="rounded-[2rem] border border-white/8 bg-white/5 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/60">Registration</p>
          <h1 className="mt-3 font-serif text-4xl text-white">Create your account</h1>
          <form method="post" onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input required name="name" placeholder="Full name" className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-emerald-100/45" />
            <input required name="email" type="email" placeholder="Email address" className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-emerald-100/45" />
            <input required name="phone" placeholder="Phone number" className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-emerald-100/45" />
            <input required minLength={8} name="password" type="password" placeholder="Create password" className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-emerald-100/45" />
            {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-lime-300 px-4 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </section>
      </ScreenContent>
    </AppShell>
  );
}
