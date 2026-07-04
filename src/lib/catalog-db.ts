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

export const getCategories = async (): Promise<CategoryDTO[]> => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return categories.map(toCategoryDTO);
};

export const getProducts = async (): Promise<ProductDTO[]> => {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return products.map(toProductDTO);
};

export const getProductBySlugDb = async (slug: string): Promise<ProductDTO | null> => {
  const product = await prisma.product.findUnique({ where: { slug } });
  return product ? toProductDTO(product) : null;
};
