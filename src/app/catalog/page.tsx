import CatalogClient from "@/app/catalog/catalog-client";
import { getCategories, getProducts } from "@/lib/catalog-db";

export default async function CatalogPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return <CatalogClient categories={categories} products={products} />;
}
