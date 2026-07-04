import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAppStore } from "@/store/use-app-store";

describe("useAppStore", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url === "/api/orders" && method === "POST") {
        return {
          ok: true,
          json: async () => ({ orderId: "FC-123456" }),
        } as Response;
      }

      if (url === "/api/orders" && method === "GET") {
        return {
          ok: true,
          json: async () => ({
            items: [
              {
                displayId: "FC-123456",
                status: "PLACED",
                etaMinutes: 18,
                total: 499,
                paymentMethod: "UPI",
                address: { title: "Home" },
              },
            ],
          }),
        } as Response;
      }

      return { ok: false, json: async () => ({ message: "Not found" }) } as Response;
    }));

    useAppStore.persist.clearStorage();
    useAppStore.setState({
      user: {
        id: "user-1",
        name: "Aarav Singh",
        email: "aarav@freshcart.dev",
        role: "customer",
      },
      cart: [
        { productId: "prod-avocado", quantity: 1 },
        { productId: "prod-milk", quantity: 2 },
      ],
      addresses: useAppStore.getState().addresses,
      orders: useAppStore.getState().orders,
      activeAddressId: "addr-home",
    });
  });

  it("adds products to cart by incrementing existing quantities", () => {
    useAppStore.getState().addToCart("prod-avocado");

    expect(useAppStore.getState().cart.find((item) => item.productId === "prod-avocado")?.quantity).toBe(2);
  });

  it("places an order and clears the cart", async () => {
    const orderId = await useAppStore.getState().placeOrder({
      addressId: "addr-home",
      paymentMethod: "UPI",
    });

    expect(orderId.startsWith("FC-")).toBe(true);
    expect(useAppStore.getState().cart).toHaveLength(0);
    expect(useAppStore.getState().orders[0]?.id).toBe(orderId);
  });
});
