import { describe, expect, it } from "vitest";

import { getProductBySlug, getProductImage, products } from "@/lib/mock-data";

describe("mock-data helpers", () => {
  it("returns a product by slug", () => {
    expect(getProductBySlug("organic-toned-milk")?.id).toBe("prod-milk");
  });

  it("builds generated image urls for the configured endpoint", () => {
    const imageUrl = getProductImage(products[0]);

    expect(imageUrl).toContain("https://coresg-normal.trae.ai/api/ide/v1/text_to_image");
    expect(imageUrl).toContain("image_size=square_hd");
  });
});
