"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { CategoryDTO, ProductDTO } from "@/lib/catalog-types";
import { AppShell, AppTopBar, ScreenContent, SectionHeader } from "@/components/app-shell";
import { ProductCard } from "@/components/commerce-ui";

export default function CatalogClient({ categories, products }: { categories: CategoryDTO[]; products: ProductDTO[] }) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.brand.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery) ||
        product.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
      const matchesCategory = categoryId === "all" || product.categoryId === categoryId;

      return matchesQuery && matchesCategory;
    });
  }, [categoryId, query, products]);

  return (
    <AppShell>
      <AppTopBar title="Browse groceries" subtitle="Fast filters, quick add, mobile-first catalog" showSearchShortcut={false} />
      <ScreenContent>
        <section className="space-y-4 rounded-[1.9rem] border border-white/8 bg-white/5 p-4">
          <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4">
            <Search size={18} className="text-emerald-100/60" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by product, brand, or need"
              className="w-full bg-transparent text-sm text-white placeholder:text-emerald-100/45 focus:outline-none"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setCategoryId("all")}
              className={`min-h-11 rounded-2xl px-4 text-sm font-semibold whitespace-nowrap ${
                categoryId === "all" ? "bg-lime-300 text-zinc-950" : "border border-white/8 bg-white/5 text-emerald-50/74"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryId(category.id)}
                className={`min-h-11 rounded-2xl px-4 text-sm font-semibold whitespace-nowrap ${
                  categoryId === category.id ? "bg-lime-300 text-zinc-950" : "border border-white/8 bg-white/5 text-emerald-50/74"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        <SectionHeader eyebrow="Catalog" title={`${filteredProducts.length} items ready to add`} />
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      </ScreenContent>
    </AppShell>
  );
}

