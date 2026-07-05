"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AppUser } from "@/lib/auth-types";

type CartItem = {
  productId: string;
  quantity: number;
};

type CheckoutPayload = {
  addressId: string | null;
  paymentMethod: "UPI" | "CARD" | "WALLET";
};

export type Address = {
  id: string;
  label: string;
  title: string;
  line1: string;
  line2: string;
  city: string;
  eta: string;
  isDefault: boolean;
};

export type OrderSummary = {
  id: string;
  total: number;
  paymentMethod: string;
  status: string;
  etaMinutes: number;
  addressLabel: string;
};

type AppState = {
  user: AppUser | null;
  cart: CartItem[];
  addresses: Address[];
  orders: OrderSummary[];
  activeAddressId: string | null;
  signIn: (user: AppUser) => void;
  signOut: () => void;
  hydrateUser: (user: AppUser | null) => void;
  refreshAddresses: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  addToCart: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  selectAddress: (addressId: string | null) => void;
  createAddress: (payload: Omit<Address, "id">) => Promise<string | null>;
  placeOrder: (payload: CheckoutPayload) => Promise<string>;
};

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

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      cart: [],
      addresses: [],
      orders: [],
      activeAddressId: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null, addresses: [], orders: [], activeAddressId: null, cart: [] }),
      hydrateUser: (user) => set({ user }),
      refreshAddresses: async () => {
        const { user, activeAddressId } = get();
        if (!user) {
          set({ addresses: [], activeAddressId: null });
          return;
        }

        const response = await fetch("/api/addresses", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { items: Address[] };
        const nextActive =
          (activeAddressId && payload.items.some((entry) => entry.id === activeAddressId) ? activeAddressId : null) ??
          payload.items.find((entry) => entry.isDefault)?.id ??
          payload.items[0]?.id ??
          null;

        set({ addresses: payload.items, activeAddressId: nextActive });
      },
      refreshOrders: async () => {
        const { user } = get();
        if (!user) {
          set({ orders: [] });
          return;
        }

        const response = await fetch("/api/orders", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          items: Array<{
            displayId: string;
            status: string;
            etaMinutes: number;
            total: number;
            paymentMethod: string;
            address?: { title: string } | null;
          }>;
        };

        set({
          orders: payload.items.map((order) => ({
            id: order.displayId,
            total: order.total,
            paymentMethod: order.paymentMethod,
            status: statusLabel(order.status),
            etaMinutes: order.etaMinutes,
            addressLabel: order.address?.title ?? "Saved Address",
          })),
        });
      },
      addToCart: (productId) =>
        set((state) => {
          const existing = state.cart.find((item) => item.productId === productId);

          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            };
          }

          return { cart: [...state.cart, { productId, quantity: 1 }] };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((item) => item.productId !== productId)
              : state.cart.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
        })),
      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.productId !== productId),
        })),
      selectAddress: (addressId) => set({ activeAddressId: addressId }),
      createAddress: async (payload) => {
        const { user } = get();
        if (!user) {
          return null;
        }

        const response = await fetch("/api/addresses", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          return null;
        }

        const created = (await response.json()) as Address;
        set({ activeAddressId: created.id });
        await get().refreshAddresses();
        return created.id;
      },
      placeOrder: async ({ addressId, paymentMethod }) => {
        const state = get();
        if (!state.user) {
          throw new Error("Sign in required");
        }

        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ addressId, paymentMethod, items: state.cart }),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { message?: string } | null;
          throw new Error(body?.message ?? "Failed to place order");
        }

        const data = (await response.json()) as { orderId: string };
        set({ cart: [] });
        await Promise.all([get().refreshOrders()]);
        return data.orderId;
      },
    }),
    {
      name: "freshcart-store",
      partialize: (state) => ({
        user: state.user,
        cart: state.cart,
        activeAddressId: state.activeAddressId,
      }),
    },
  ),
);
