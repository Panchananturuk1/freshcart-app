"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppShell, AppTopBar, ScreenContent, SectionHeader } from "@/components/app-shell";
import { useAppStore } from "@/store/use-app-store";

export default function AccountPage() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const signOut = useAppStore((state) => state.signOut);
  const addresses = useAppStore((state) => state.addresses);
  const orders = useAppStore((state) => state.orders);

  return (
    <AppShell>
      <AppTopBar title="My account" subtitle="Addresses, orders, and profile settings" showSearchShortcut={false} />
      <ScreenContent>
        <section className="space-y-5">
          <div className="rounded-[1.9rem] border border-white/8 bg-white/5 p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-100/60">Customer profile</p>
            <h1 className="mt-3 font-serif text-4xl text-white">{user?.name ?? "Guest user"}</h1>
            <p className="mt-3 text-sm leading-7 text-emerald-50/72">{user?.email ?? "Sign in to sync addresses, orders, and payment preferences."}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {user ? (
                <button
                  type="button"
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    signOut();
                    router.push("/auth/sign-in");
                    router.refresh();
                  }}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-4 text-sm font-semibold text-zinc-950"
                >
                  Sign out
                </button>
              ) : (
                <Link href="/auth/sign-in" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-4 text-sm font-semibold text-zinc-950">
                  Sign in
                </Link>
              )}
              <Link href="/auth/sign-up" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white">
                {user ? "Add another account" : "Create account"}
              </Link>
            </div>
          </div>

          <div className="rounded-[1.9rem] border border-white/8 bg-white/5 p-5">
            <SectionHeader eyebrow="Saved addresses" title="Delivery locations" />
            <div className="mt-4 space-y-3">
              {addresses.map((address) => (
                <article key={address.id} className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white">{address.label}</p>
                  <p className="mt-1 text-sm text-emerald-50/74">{address.title}</p>
                  <p className="text-xs text-emerald-100/55">{address.line1}, {address.line2}, {address.city}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[1.9rem] border border-white/8 bg-white/5 p-5">
          <SectionHeader eyebrow="Order history" title="Past and active orders" />
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{order.id}</p>
                    <p className="mt-1 text-sm text-emerald-50/74">{order.status} • {order.addressLabel}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full bg-white/8 px-3 py-2 text-xs text-emerald-50/80">{order.paymentMethod}</span>
                    <Link href={`/order/${order.id}/tracking`} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-4 text-sm font-semibold text-zinc-950">
                      Track order
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </ScreenContent>
    </AppShell>
  );
}
