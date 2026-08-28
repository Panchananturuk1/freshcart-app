const { PrismaClient } = require("@prisma/client");

const { categories, products } = require("./catalog-data.js");

const prisma = new PrismaClient();

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        emoji: category.emoji,
        description: category.description,
      },
      create: category,
    });
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        categoryId: product.categoryId,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? null,
        rating: product.rating,
        stock: product.stock,
        eta: product.eta,
        unit: product.unit,
        tags: product.tags,
        description: product.description,
        imagePath: `/images/products/${product.slug}.jpg`,
      },
      create: {
        ...product,
        compareAtPrice: product.compareAtPrice ?? null,
        tags: product.tags,
        imagePath: `/images/products/${product.slug}.jpg`,
      },
    });
  }

  const keepProductIds = products.map((product) => product.id);
  const keepCategoryIds = categories.map((category) => category.id);

  await prisma.orderItem.deleteMany({
    where: { productId: { notIn: keepProductIds } },
  });
  await prisma.product.deleteMany({
    where: { id: { notIn: keepProductIds } },
  });
  await prisma.category.deleteMany({
    where: { id: { notIn: keepCategoryIds } },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
