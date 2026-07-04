import { NextResponse } from "next/server";

import { products } from "@/lib/mock-data";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() ?? "";
  const category = searchParams.get("category");

  const filtered = products.filter((product) => {
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.tags.some((tag) => tag.toLowerCase().includes(query));
    const matchesCategory = !category || category === "all" || product.categoryId === category;

    return matchesQuery && matchesCategory;
  });

  return NextResponse.json({
    count: filtered.length,
    items: filtered,
  });
}
