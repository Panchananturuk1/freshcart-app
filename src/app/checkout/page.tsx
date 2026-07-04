"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Smartphone, Wallet } from "lucide-react";

import { AppShell, AppTopBar, ScreenContent, SectionHeader } from "@/components/app-shell";
import type { ProductDTO } from "@/lib/catalog-types";
import { useAppStore } from "@/store/use-app-store";

const paymentOptions = [
  { label: "UPI", value: "UPI", helper: "Fastest completion on mobile", icon: Smartphone },
  { label: "Card", value: "CARD", helper: "Credit and debit cards", icon: ShieldCheck },
  { label: "Wallet", value: "WALLET", helper: "Use prepaid wallet balance", icon: Wallet },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useAppStore((state) => state.cart);
  const addresses = useAppStore((state) => state.addresses);
  const activeAddressId = useAppStore((state) => state.activeAddressId);
  const selectAddress = useAppStore((state) => state.selectAddress);
  const placeOrder = useAppStore((state) => state.placeOrder);
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentOptions)[number]["value"]>("UPI");
  const [productsById, setProductsById] = useState<Record<string, ProductDTO>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const ids = cart.map((entry) => entry.productId);
      if (ids.length === 0) {
        setProductsById({});
        return;
      }

      const response = await fetch("/api/products/by-ids", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { items: ProductDTO[] };
      if (!cancelled) {
        setProductsById(Object.fromEntries(payload.items.map((product) => [product.id, product])));
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [cart]);

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const product = productsById[item.productId];
        return sum + (product?.price ?? 0) * item.quantity;
      }, 0),
    [cart, productsById],
  );

  const deliveryFee = subtotal > 499 ? 0 : 49;
  const total = subtotal + deliveryFee;

  return (
    <AppShell>
      <AppTopBar title="Checkout" subtitle="Address, payment, and quick confirmation" showSearchShortcut={false} />
      <ScreenContent>
        <section className="space-y-5">
          <div className="rounded-[1.9rem] border border-white/8 bg-white/5 p-5">
            <SectionHeader eyebrow="Saved addresses" title="Choose delivery address" />
            <div className="mt-4 grid gap-3">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => selectAddress(address.id)}
                  className={`rounded-[1.5rem] border p-4 text-left ${activeAddressId === address.id ? "border-lime-300 bg-lime-300/10" : "border-white/8 bg-black/20"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{address.label}</p>
                      <p className="mt-1 text-sm text-emerald-50/74">{address.title}</p>
                      <p className="text-xs text-emerald-100/55">{address.line1}, {address.line2}, {address.city}</p>
                    </div>
                    <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-emerald-50/80">{address.eta}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.9rem] border border-white/8 bg-white/5 p-5">
            <SectionHeader eyebrow="Secure payment" title="Select payment method" />
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {paymentOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setPaymentMethod(option.value)}
                  className={`rounded-[1.5rem] border p-4 text-left ${paymentMethod === option.value ? "border-lime-300 bg-lime-300/10" : "border-white/8 bg-black/20"}`}
                >
                  <option.icon className="text-lime-300" />
                  <p className="mt-4 text-sm font-semibold text-white">{option.label}</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-50/70">{option.helper}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="sticky bottom-20 rounded-[1.9rem] border border-white/8 bg-[linear-gradient(180deg,_rgba(163,230,53,0.08),_rgba(255,255,255,0.05))] p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-100/60">Order preview</p>
          <div className="mt-4 space-y-3 rounded-[1.5rem] border border-white/8 bg-black/20 p-5 text-sm text-emerald-50/74">
            <div className="flex justify-between">
              <span>Items total</span>
              <span>INR {subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? "Free" : `INR ${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between border-t border-white/8 pt-4 text-base font-semibold text-white">
              <span>To pay</span>
              <span>INR {total}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={!cart.length}
            onClick={() => {
              setError(null);
              void (async () => {
                try {
                  const orderId = await placeOrder({ addressId: activeAddressId ?? null, paymentMethod });
                  router.push(`/order/${orderId}/tracking`);
                  router.refresh();
                } catch (err) {
                  const message = err instanceof Error ? err.message : "Failed to place order";
                  setError(message);
                  if (message.toLowerCase().includes("sign in")) {
                    router.push("/auth/sign-in");
                  }
                }
              })();
            }}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-lime-300 px-4 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Place order
          </button>
          {error ? <p className="mt-3 text-xs leading-6 text-rose-200">{error}</p> : null}
          <p className="mt-4 text-xs leading-6 text-emerald-100/55">
            Payment integrations are structured for UPI, card, and wallet gateways, with webhook validation planned for production secrets in Vercel environment variables.
          </p>
        </aside>
      </ScreenContent>
    </AppShell>
  );
}
