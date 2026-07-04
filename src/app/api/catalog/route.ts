import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() ?? "";
  const category = searchParams.get("category");

  const dbItems = await prisma.product.findMany({
    where: {
      ...(category && category !== "all" ? { categoryId: category } : {}),
    },
    orderBy: { name: "asc" },
  });

  const filtered = query.length
    ? dbItems.filter((product) => {
        const matchesText =
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query);

        const tags = Array.isArray(product.tags) ? (product.tags as unknown[]).map(String) : [];
        const matchesTags = tags.some((tag) => tag.toLowerCase().includes(query));

        return matchesText || matchesTags;
      })
    : dbItems;

  return NextResponse.json({
    count: filtered.length,
    items: filtered,
  });
}
