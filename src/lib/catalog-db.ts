import fs from "node:fs";
import path from "node:path";
import "server-only";

import type { CategoryDTO, ProductDTO } from "@/lib/catalog-types";
import { prisma } from "@/lib/db";

const toCategoryDTO = (category: { id: string; name: string; emoji: string; description: string }): CategoryDTO => ({
  id: category.id,
  name: category.name,
  emoji: category.emoji,
  description: category.description,
});

const toProductDTO = (product: {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  price: number;
  compareAtPrice: number | null;
  rating: number;
  stock: number;
  eta: string;
  unit: string;
  tags: unknown;
  description: string;
  imagePath: string;
}): ProductDTO => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  brand: product.brand,
  categoryId: product.categoryId,
  price: product.price,
  compareAtPrice: product.compareAtPrice,
  rating: product.rating,
  stock: product.stock,
  eta: product.eta,
  unit: product.unit,
  tags: Array.isArray(product.tags) ? product.tags.map(String) : [],
  description: product.description,
  imagePath: product.imagePath,
});

const productHasImage = (product: { slug: string; imagePath: string }) => {
  const relativePath = product.imagePath.startsWith("/") ? product.imagePath.slice(1) : `images/products/${product.slug}.jpg`;
  return fs.existsSync(path.join(process.cwd(), "public", relativePath));
};

export const getCategories = async (): Promise<CategoryDTO[]> => {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getProducts(),
  ]);
  const usedCategoryIds = new Set(products.map((product) => product.categoryId));
  return categories.map(toCategoryDTO).filter((category) => usedCategoryIds.has(category.id));
};

export const getProducts = async (): Promise<ProductDTO[]> => {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return products.map(toProductDTO).filter(productHasImage);
};

const HOME_FEATURED_SLUGS = [
  "hass-avocado-pack",
  "baby-spinach-bag",
  "organic-toned-milk",
  "fresh-malai-paneer",
  "berry-almond-granola",
  "classic-cold-brew",
] as const;

export const getFeaturedProducts = async (): Promise<ProductDTO[]> => {
  const products = await prisma.product.findMany({
    where: { slug: { in: [...HOME_FEATURED_SLUGS] } },
  });
  const bySlug = new Map(products.map((product) => [product.slug, toProductDTO(product)]));

  return HOME_FEATURED_SLUGS.map((slug) => bySlug.get(slug)).filter((product): product is ProductDTO => {
    if (!product) {
      return false;
    }

    return productHasImage(product);
  });
};

export const getProductBySlugDb = async (slug: string): Promise<ProductDTO | null> => {
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) {
    return null;
  }

  const dto = toProductDTO(product);
  return productHasImage(dto) ? dto : null;
};
