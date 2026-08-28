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
