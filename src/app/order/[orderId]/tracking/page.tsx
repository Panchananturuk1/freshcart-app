"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { MapPin, PhoneCall, Route } from "lucide-react";

import { AppShell, AppTopBar, ScreenContent, SectionHeader } from "@/components/app-shell";
import { OrderTimeline } from "@/components/commerce-ui";
import { useAppStore } from "@/store/use-app-store";

export default function TrackingPage() {
  const params = useParams<{ orderId: string }>();
  const orders = useAppStore((state) => state.orders);
  const advanceOrder = useAppStore((state) => state.advanceOrder);

  const order = useMemo(() => orders.find((entry) => entry.id === params.orderId), [orders, params.orderId]);

  useEffect(() => {
    if (!order || order.status === "Delivered") {
      return;
    }

    const timer = window.setInterval(() => {
      advanceOrder(order.id);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [advanceOrder, order]);

  if (!order) {
    return (
      <AppShell>
        <AppTopBar title="Track order" showSearchShortcut={false} />
        <ScreenContent>
          <main className="py-10 text-center text-emerald-50/70">Order not found.</main>
        </ScreenContent>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <AppTopBar title="Track order" subtitle={`${order.id} • ${order.status}`} showSearchShortcut={false} />
      <ScreenContent>
        <OrderTimeline order={order} />

        <section className="space-y-4">
          <div className="rounded-[1.9rem] border border-white/8 bg-white/5 p-5">
            <SectionHeader eyebrow="Delivery map" title="Track in real time" />
            <div className="mt-4 rounded-[1.75rem] border border-white/8 bg-[radial-gradient(circle_at_top,_rgba(163,230,53,0.12),_transparent_35%),linear-gradient(180deg,_#0d1d12,_#08110b)] p-5">
              <div className="grid min-h-60 place-items-center rounded-[1.5rem] border border-dashed border-lime-300/30 bg-black/20 text-center text-sm leading-7 text-emerald-50/70">
                <div>
                  <Route className="mx-auto text-lime-300" size={28} />
                  <p className="mt-4">Map integration zone for Google Maps or Mapbox.</p>
                  <p>Current ETA: {order.etaMinutes} mins</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.9rem] border border-white/8 bg-white/5 p-5">
            <SectionHeader eyebrow="Rider and support" title="Contact and address" />
            <div className="mt-4 space-y-4">
              <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{order.rider.name}</p>
                <p className="mt-1 text-sm text-emerald-50/70">{order.rider.vehicle}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white">
                  <PhoneCall size={18} />
                  {order.rider.phoneMasked}
                </button>
                <button type="button" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-lime-300 px-4 text-sm font-semibold text-zinc-950">
                  <MapPin size={18} />
                  {order.addressLabel}
                </button>
              </div>
            </div>
          </div>
        </section>
      </ScreenContent>
    </AppShell>
  );
}
