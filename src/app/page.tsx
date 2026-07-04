import Link from "next/link";
import { ArrowRight, Clock3, Wallet } from "lucide-react";

import { AppShell, AppTopBar, ScreenContent, SectionHeader } from "@/components/app-shell";
import { CategoryRail, HomePromoCard, OrderTimeline, ProductCard, QuickActions, ReorderCard } from "@/components/commerce-ui";
import type { OrderTimelineDTO } from "@/lib/catalog-types";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCategories, getProducts } from "@/lib/catalog-db";
import { customerSpotlight } from "@/lib/mock-data";

const statusLabel = (status: string) => {
  switch (status) {
    case "PLACED":
      return "Placed";
    case "CONFIRMED":
      return "Confirmed";
    case "PICKING":
      return "Picking";
    case "PACKED":
      return "Packed";
    case "OUT_FOR_DELIVERY":
      return "Out for delivery";
    case "DELIVERED":
      return "Delivered";
    default:
      return status;
  }
};

export default async function HomePage() {
  const [categories, products, user] = await Promise.all([getCategories(), getProducts(), getSessionUser()]);
  const featuredProducts = products.slice(0, 6);

  const [addresses, latestOrder] = await Promise.all([
    user
      ? prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] })
      : Promise.resolve([]),
    user
      ? prisma.order.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          include: { events: { orderBy: { createdAt: "asc" } } },
        })
      : Promise.resolve(null),
  ]);

  const liveOrder: OrderTimelineDTO | null = latestOrder
    ? {
        id: latestOrder.displayId,
        status: statusLabel(latestOrder.status),
        etaMinutes: latestOrder.etaMinutes,
        rider: {
          name: latestOrder.riderName,
          phoneMasked: latestOrder.riderPhoneMasked,
          vehicle: latestOrder.riderVehicle,
        },
        timeline: latestOrder.events.map((event) => ({
          status: statusLabel(event.status),
          time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(event.createdAt),
          note: event.note,
        })),
      }
    : null;

  return (
    <AppShell>
      <AppTopBar title="FreshCart" subtitle="Home delivery in 10-15 mins • Sector 42, Gurugram" />
      <ScreenContent>
        <HomePromoCard products={products} />
        <QuickActions />
        <CategoryRail categories={categories} />

        <section className="grid gap-3 md:grid-cols-3">
          <article className="rounded-[1.6rem] border border-white/8 bg-white/5 p-4">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-lime-300/12">
              <Clock3 className="text-lime-300" size={18} />
            </div>
            <p className="mt-4 text-sm font-semibold text-white">Delivery now</p>
            <p className="mt-1 text-xs leading-5 text-emerald-50/68">Morning milk, snacks, and vegetables available instantly.</p>
          </article>
          <article className="rounded-[1.6rem] border border-white/8 bg-white/5 p-4">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-lime-300/12">
              <Wallet className="text-lime-300" size={18} />
            </div>
            <p className="mt-4 text-sm font-semibold text-white">Pay your way</p>
            <p className="mt-1 text-xs leading-5 text-emerald-50/68">UPI, card, and wallet-first payment flow for mobile checkout.</p>
          </article>
          <article className="rounded-[1.6rem] border border-white/8 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/56">Fresh Plus</p>
            <p className="mt-3 font-serif text-3xl text-white">INR {customerSpotlight.savings}</p>
            <p className="mt-1 text-xs leading-5 text-emerald-50/68">Saved this month with your {customerSpotlight.loyaltyTier} membership.</p>
          </article>
        </section>

        <section className="space-y-4">
          <SectionHeader
            eyebrow="Trending now"
            title="Tonight's fast-moving items"
            action={
              <Link href="/catalog" className="inline-flex items-center gap-1 text-sm font-semibold text-lime-300">
                See all
                <ArrowRight size={16} />
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            {liveOrder ? <OrderTimeline order={liveOrder} /> : null}
          </div>
          <div className="space-y-4">
            <ReorderCard products={products} />
            <section className="rounded-[1.75rem] border border-white/8 bg-white/5 p-5">
              <SectionHeader eyebrow="Addresses" title="Saved delivery spots" />
              <div className="mt-4 space-y-3">
                {addresses.length ? (
                  addresses.map((address) => (
                    <div key={address.id} className="rounded-[1.35rem] border border-white/8 bg-black/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{address.label}</p>
                          <p className="mt-1 text-sm text-emerald-50/72">{address.title}</p>
                          <p className="mt-1 text-xs text-emerald-100/55">
                            {address.line1}, {address.line2}
                          </p>
                        </div>
                        {address.isDefault ? (
                          <span className="rounded-full bg-lime-300 px-3 py-1 text-[11px] font-semibold text-zinc-950">Default</span>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.35rem] border border-white/8 bg-black/20 p-4">
                    <p className="text-sm font-semibold text-white">{user ? "No addresses saved yet" : "Sign in to save addresses"}</p>
                    <p className="mt-1 text-sm text-emerald-50/72">
                      {user ? "Add a delivery address from your account." : "Create an account to store delivery details and order history."}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link href="/account" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white">
                  My account
                </Link>
                {liveOrder ? (
                  <Link href={`/order/${liveOrder.id}/tracking`} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-4 text-sm font-semibold text-zinc-950">
                    Track now
                  </Link>
                ) : (
                  <Link href="/catalog" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-4 text-sm font-semibold text-zinc-950">
                    Shop now
                  </Link>
                )}
              </div>
            </section>
          </div>
        </section>
      </ScreenContent>
    </AppShell>
  );
}
