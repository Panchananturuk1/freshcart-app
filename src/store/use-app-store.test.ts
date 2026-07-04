import { beforeEach, describe, expect, it } from "vitest";

import { useAppStore } from "@/store/use-app-store";

describe("useAppStore", () => {
  beforeEach(() => {
    useAppStore.persist.clearStorage();
    useAppStore.setState({
      user: {
        id: "user-1",
        name: "Aarav Singh",
        email: "aarav@freshcart.dev",
        role: "customer",
      },
      cart: [
        { productId: "stay-aurum-skyline", quantity: 1 },
        { productId: "stay-axis-business", quantity: 2 },
      ],
      addresses: useAppStore.getState().addresses,
      orders: useAppStore.getState().orders,
      activeAddressId: "addr-home",
    });
  });

  it("adds products to cart by incrementing existing quantities", () => {
    useAppStore.getState().addToCart("stay-aurum-skyline");

    expect(useAppStore.getState().cart.find((item) => item.productId === "stay-aurum-skyline")?.quantity).toBe(2);
  });

  it("places an order and clears the cart", () => {
    const orderId = useAppStore.getState().placeOrder({
      addressId: "addr-home",
      paymentMethod: "UPI",
    });

    expect(orderId.startsWith("FC-")).toBe(true);
    expect(useAppStore.getState().cart).toHaveLength(0);
    expect(useAppStore.getState().orders[0]?.id).toBe(orderId);
  });
});
