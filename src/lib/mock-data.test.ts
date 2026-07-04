import { describe, expect, it } from "vitest";

import { getProductBySlug, getProductImage, products } from "@/lib/mock-data";

describe("mock-data helpers", () => {
  it("returns a product by slug", () => {
    expect(getProductBySlug("organic-toned-milk")?.id).toBe("prod-milk");
  });

  it("returns local product image paths", () => {
    const imageUrl = getProductImage(products[0]);

    expect(imageUrl).toBe(`/images/products/${products[0].slug}.jpg`);
  });
});
