"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { AppShell, AppTopBar, ScreenContent, SectionHeader } from "@/components/app-shell";
import { products } from "@/lib/mock-data";
import { useAppStore } from "@/store/use-app-store";

export default function CartPage() {
  const cart = useAppStore((state) => state.cart);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const setQuantity = useAppStore((state) => state.setQuantity);

  const lineItems = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return product ? { ...product, quantity: item.quantity, lineTotal: product.price * item.quantity } : null;
  }).filter(Boolean);

  const subtotal = lineItems.reduce((sum, item) => sum + (item?.lineTotal ?? 0), 0);
  const deliveryFee = subtotal > 499 ? 0 : 49;
  const total = subtotal + deliveryFee;

  return (
    <AppShell>
      <AppTopBar title="Your cart" subtitle={`${lineItems.length} items packed for checkout`} showSearchShortcut={false} />
      <ScreenContent>
        <section className="space-y-4">
          <SectionHeader eyebrow="Shopping cart" title="Review your basket" />
          <div className="space-y-3">
            {lineItems.length ? (
              lineItems.map((item) => (
                <article key={item!.id} className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{item!.name}</p>
                      <p className="mt-1 text-sm text-emerald-50/70">{item!.unit}</p>
                      <p className="mt-2 text-sm font-medium text-lime-200">INR {item!.lineTotal}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex min-h-12 items-center rounded-2xl border border-white/8 bg-black/20">
                        <button type="button" onClick={() => setQuantity(item!.id, item!.quantity - 1)} className="grid min-h-12 min-w-12 place-items-center text-white">
                          <Minus size={16} />
                        </button>
                        <span className="min-w-10 text-center text-sm font-semibold text-white">{item!.quantity}</span>
                        <button type="button" onClick={() => setQuantity(item!.id, item!.quantity + 1)} className="grid min-h-12 min-w-12 place-items-center text-white">
                          <Plus size={16} />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item!.id)} className="grid min-h-12 min-w-12 place-items-center rounded-2xl border border-white/8 bg-black/20 text-white">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-black/20 p-6 text-sm text-emerald-50/70">
                Your cart is empty. Add a few essentials from the catalog to continue.
              </div>
            )}
          </div>
        </section>

        <aside className="sticky bottom-20 rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,_rgba(163,230,53,0.08),_rgba(255,255,255,0.05))] p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-100/60">Checkout summary</p>
          <div className="mt-4 space-y-4 rounded-[1.5rem] border border-white/8 bg-black/20 p-5 text-sm">
            <div className="flex justify-between text-emerald-50/75">
              <span>Subtotal</span>
              <span>INR {subtotal}</span>
            </div>
            <div className="flex justify-between text-emerald-50/75">
              <span>Delivery fee</span>
              <span>{deliveryFee === 0 ? "Free" : `INR ${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between border-t border-white/8 pt-4 text-base font-semibold text-white">
              <span>Total</span>
              <span>INR {total}</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <Link href="/checkout" className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-lime-300 px-4 text-sm font-semibold text-zinc-950">
              Proceed to checkout
            </Link>
            <Link href="/catalog" className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white">
              Add more items
            </Link>
          </div>
        </aside>
      </ScreenContent>
    </AppShell>
  );
}
