"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AppUser } from "@/lib/auth-types";
import { demoOrders, products, savedAddresses, type Address, type DemoOrder } from "@/lib/mock-data";

type CartItem = {
  productId: string;
  quantity: number;
};

type CheckoutPayload = {
  addressId: string;
  paymentMethod: "UPI" | "Card" | "Wallet";
};

type AppState = {
  user: AppUser | null;
  cart: CartItem[];
  addresses: Address[];
  orders: DemoOrder[];
  activeAddressId: string;
  signIn: (user: AppUser) => void;
  signOut: () => void;
  hydrateUser: (user: AppUser | null) => void;
  addToCart: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  selectAddress: (addressId: string) => void;
  addAddress: (address: Address) => void;
  placeOrder: (payload: CheckoutPayload) => string;
  advanceOrder: (orderId: string) => void;
};

const nextStatuses = ["Placed", "Confirmed", "Picking", "Packed", "Out for delivery", "Delivered"] as const;

const makeTimelineNote = (status: (typeof nextStatuses)[number]) => {
  const notes: Record<(typeof nextStatuses)[number], string> = {
    Placed: "Order created and payment authorization completed.",
    Confirmed: "The fulfillment center accepted your basket.",
    Picking: "A store associate is collecting your products.",
    Packed: "Items were quality checked and sealed.",
    "Out for delivery": "Your rider is on the route with live ETA updates.",
    Delivered: "Order handed over successfully.",
  };

  return notes[status];
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      cart: [
        { productId: "prod-avocado", quantity: 1 },
        { productId: "prod-milk", quantity: 2 },
      ],
      addresses: savedAddresses,
      orders: demoOrders,
      activeAddressId: "addr-home",
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
      hydrateUser: (user) => set({ user }),
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
      addAddress: (address) =>
        set((state) => ({
          addresses: [...state.addresses, address],
        })),
      placeOrder: ({ addressId, paymentMethod }) => {
        const state = get();
        const orderId = `FC-${Math.floor(100000 + Math.random() * 900000)}`;
        const total = state.cart.reduce((sum, item) => {
          const product = products.find((entry) => entry.id === item.productId);
          return sum + (product?.price ?? 0) * item.quantity;
        }, 49);

        const newOrder: DemoOrder = {
          id: orderId,
          customer: state.user?.name ?? "Guest Customer",
          total,
          paymentMethod,
          status: "Placed",
          etaMinutes: 16,
          addressLabel:
            state.addresses.find((address) => address.id === addressId)?.title ?? "Saved Address",
          rider: {
            name: "Assigned after packing",
            phoneMasked: "Pending",
            vehicle: "Dispatch in progress",
          },
          items: state.cart,
          timeline: [
            {
              status: "Placed",
              time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
              note: makeTimelineNote("Placed"),
            },
          ],
        };

        set({
          orders: [newOrder, ...state.orders],
          cart: [],
          activeAddressId: addressId,
        });

        return orderId;
      },
      advanceOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) {
              return order;
            }

            const currentIndex = nextStatuses.indexOf(order.status);
            const nextStatus = nextStatuses[Math.min(currentIndex + 1, nextStatuses.length - 1)];

            if (nextStatus === order.status) {
              return order;
            }

            return {
              ...order,
              status: nextStatus,
              etaMinutes: Math.max(order.etaMinutes - 3, 0),
              rider:
                nextStatus === "Out for delivery" || nextStatus === "Delivered"
                  ? {
                      name: "Rahul",
                      phoneMasked: "+91 98XXXX221",
                      vehicle: "Blue scooter • DL 8S AH 1417",
                    }
                  : order.rider,
              timeline: [
                ...order.timeline,
                {
                  status: nextStatus,
                  time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
                  note: makeTimelineNote(nextStatus),
                },
              ],
            };
          }),
        })),
    }),
    {
      name: "freshcart-store",
      partialize: (state) => ({
        user: state.user,
        cart: state.cart,
        addresses: state.addresses,
        orders: state.orders,
        activeAddressId: state.activeAddressId,
      }),
    },
  ),
);
