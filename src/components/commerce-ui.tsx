"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CreditCard, Heart, ReceiptText, Sparkles, Star, Truck } from "lucide-react";

import type { CategoryDTO, OrderTimelineDTO, ProductDTO } from "@/lib/catalog-types";
import { getProductImage } from "@/lib/mock-data";
import { useAppStore } from "@/store/use-app-store";
import { AppTopBar, InlineMeta } from "@/components/app-shell";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function AppHeader() {
  return <AppTopBar title="FreshCart" subtitle="10-minute grocery delivery" />;
}

export function HomePromoCard({ products }: { products: ProductDTO[] }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-lime-300/14 bg-[radial-gradient(circle_at_top_left,_rgba(163,230,53,0.22),_transparent_34%),linear-gradient(135deg,_#17351d,_#0b150d)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-lime-300/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-lime-100">
          <Sparkles size={13} />
          Super Saver
        </div>
        <span className="rounded-full bg-white/8 px-3 py-1.5 text-[11px] text-lime-100">Free delivery above INR 499</span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div>
          <h2 className="font-serif text-[2rem] leading-tight text-white">Everyday groceries in 10 minutes, designed like a real mobile shopping app.</h2>
          <p className="mt-3 text-sm leading-6 text-emerald-50/74">
            Fast category jumps, dense product cards, quick add buttons, and sticky actions inspired by top grocery delivery mobile flows.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/8 px-3 py-2 text-xs text-emerald-50/78">App-like bottom nav</span>
            <span className="rounded-full bg-white/8 px-3 py-2 text-xs text-emerald-50/78">Touch-first product cards</span>
            <span className="rounded-full bg-white/8 px-3 py-2 text-xs text-emerald-50/78">Sticky checkout flow</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {products.slice(0, 4).map((product) => (
            <div key={product.id} className="rounded-[1.5rem] bg-[#f4f1e8] p-2.5 text-zinc-900">
              <div className="relative aspect-square overflow-hidden rounded-[1.25rem]">
                <Image src={getProductImage(product)} alt={product.name} fill className="object-cover" sizes="180px" unoptimized />
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">{product.eta}</p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold">{product.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoryRail({ categories }: { categories: CategoryDTO[] }) {
  return (
    <section className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {categories.map((category) => (
        <article key={category.id} className="rounded-[1.5rem] border border-white/8 bg-white/5 p-3 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-lime-300/12 text-2xl">{category.emoji}</div>
          <h2 className="mt-3 text-sm font-semibold text-white">{category.name}</h2>
        </article>
      ))}
    </section>
  );
}

export function ProductCard({ product }: { product: ProductDTO }) {
  const addToCart = useAppStore((state) => state.addToCart);

  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-white/8 bg-[#f4f1e8] text-zinc-900 shadow-[0_18px_90px_-44px_rgba(0,0,0,0.85)]">
      <div className="relative aspect-square">
        <Image src={getProductImage(product)} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 240px" unoptimized />
        <div className="absolute left-3 top-3 rounded-full bg-white/88 px-2 py-1 text-[11px] font-semibold text-zinc-700">{product.unit}</div>
      </div>
      <div className="space-y-3 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 min-h-10 text-sm font-semibold leading-5">{product.name}</p>
          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-900">
            <Star size={12} className="fill-current" />
            {product.rating}
          </div>
        </div>
        <InlineMeta eta={product.eta} badge={product.tags[0]} />
        <div className="flex items-end justify-between gap-2 pt-1">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold">{currency.format(product.price)}</p>
              {product.compareAtPrice ? <p className="text-xs text-zinc-400 line-through">{currency.format(product.compareAtPrice)}</p> : null}
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">{product.brand}</p>
          </div>
          <button
            type="button"
            onClick={() => addToCart(product.id)}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-950 px-4 text-sm font-semibold text-white transition hover:bg-black"
          >
            Add
          </button>
        </div>
        <Link href={`/product/${product.slug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-950">
          View details
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

export function QuickActions() {
  const items = [
    { icon: Truck, label: "Track order", helper: "Live rider ETA" },
    { icon: ReceiptText, label: "Past orders", helper: "Reorder in one tap" },
    { icon: CreditCard, label: "Payments", helper: "UPI, cards, wallet" },
    { icon: Heart, label: "Saved list", helper: "Favorites and repeats" },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <article key={item.label} className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-lime-300/12">
            <item.icon className="text-lime-300" size={18} />
          </div>
          <h2 className="mt-3 text-sm font-semibold text-white">{item.label}</h2>
          <p className="mt-1 text-xs leading-5 text-emerald-50/68">{item.helper}</p>
        </article>
      ))}
    </section>
  );
}

export function ReorderCard({ products }: { products: ProductDTO[] }) {
  return (
    <section className="rounded-[1.8rem] border border-white/8 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/56">Reorder faster</p>
          <h2 className="mt-2 font-serif text-2xl text-white">Weekly staples in one tap</h2>
        </div>
        <div className="rounded-2xl bg-lime-300 px-3 py-2 text-xs font-semibold text-zinc-950">2 mins</div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {products.slice(0, 3).map((product) => (
          <div key={product.id} className="rounded-[1.35rem] bg-black/20 p-2.5">
            <div className="relative aspect-square overflow-hidden rounded-[1.1rem]">
              <Image src={getProductImage(product)} alt={product.name} fill className="object-cover" sizes="120px" unoptimized />
            </div>
            <p className="mt-2 line-clamp-2 text-xs font-medium text-white">{product.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function OrderTimeline({ order }: { order: OrderTimelineDTO }) {
  return (
    <div className="rounded-[1.75rem] border border-white/8 bg-white/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-100/60">Live order</p>
          <h3 className="mt-2 font-serif text-2xl text-white">{order.id}</h3>
          <p className="mt-2 text-sm text-emerald-50/70">{order.rider.name} • {order.etaMinutes} mins away</p>
        </div>
        <div className="rounded-full bg-lime-300 px-4 py-2 text-sm font-semibold text-zinc-950">{order.status}</div>
      </div>
      <div className="mt-6 space-y-4">
        {order.timeline.map((step, index) => (
          <div key={`${step.status}-${step.time}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-lime-300" />
              {index < order.timeline.length - 1 ? <div className="mt-2 h-full w-px bg-white/15" /> : null}
            </div>
            <div className="pb-4">
              <p className="text-sm font-semibold text-white">{step.status}</p>
              <p className="text-xs text-emerald-100/60">{step.time}</p>
              <p className="mt-1 text-sm text-emerald-50/72">{step.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminOverview() {
  const stats = [
    { label: "Live orders", value: "124", helper: "+18 vs last hour" },
    { label: "Pending stock alerts", value: "09", helper: "3 critical SKUs" },
    { label: "New users today", value: "412", helper: "62% from mobile web" },
    { label: "Fulfillment SLA", value: "96.4%", helper: "Avg handoff in 11 mins" },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <article key={stat.label} className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
          <p className="text-sm text-emerald-50/65">{stat.label}</p>
          <p className="mt-3 font-serif text-4xl text-white">{stat.value}</p>
          <p className="mt-2 text-sm text-lime-200/80">{stat.helper}</p>
        </article>
      ))}
    </section>
  );
}
