const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const categories = [
  { id: "veg", name: "Vegetables", emoji: "🥬", description: "Farm-picked greens and staples." },
  { id: "fruit", name: "Fruits", emoji: "🍊", description: "Vitamin-rich seasonal fruits." },
  { id: "dairy", name: "Dairy", emoji: "🥛", description: "Milk, paneer, yogurt, and butter." },
  { id: "snacks", name: "Snacks", emoji: "🥨", description: "Evening bites and pantry treats." },
  { id: "beverages", name: "Beverages", emoji: "🥤", description: "Cold, fresh, and energizing drinks." },
  { id: "essentials", name: "Essentials", emoji: "🧼", description: "Home-care and everyday basics." },
];

const products = [
  {
    id: "prod-avocado",
    slug: "hass-avocado-pack",
    name: "Hass Avocado Pack",
    brand: "GreenHarvest",
    categoryId: "fruit",
    price: 169,
    compareAtPrice: 199,
    rating: 4.8,
    stock: 42,
    eta: "10 mins",
    unit: "2 pcs",
    tags: ["Fresh", "Premium", "Breakfast"],
    description: "Buttery avocados sourced for toast, bowls, and smoothies.",
  },
  {
    id: "prod-spinach",
    slug: "baby-spinach-bag",
    name: "Baby Spinach Bag",
    brand: "Leaf District",
    categoryId: "veg",
    price: 79,
    compareAtPrice: 95,
    rating: 4.6,
    stock: 58,
    eta: "8 mins",
    unit: "250 g",
    tags: ["Leafy", "Salads", "Iron-rich"],
    description: "Tender spinach leaves washed and packed for quick meals.",
  },
  {
    id: "prod-milk",
    slug: "organic-toned-milk",
    name: "Organic Toned Milk",
    brand: "Morning Meadow",
    categoryId: "dairy",
    price: 62,
    rating: 4.7,
    stock: 100,
    eta: "9 mins",
    unit: "1 ltr",
    tags: ["Protein", "Daily", "Organic"],
    description: "Daily-use toned milk from certified farms with cold-chain handling.",
  },
  {
    id: "prod-paneer",
    slug: "fresh-malai-paneer",
    name: "Fresh Malai Paneer",
    brand: "Dairy Craft",
    categoryId: "dairy",
    price: 115,
    compareAtPrice: 129,
    rating: 4.9,
    stock: 36,
    eta: "12 mins",
    unit: "200 g",
    tags: ["High protein", "Fresh", "Dinner"],
    description: "Soft paneer cubes crafted for curries, wraps, and grilled meals.",
  },
  {
    id: "prod-granola",
    slug: "berry-almond-granola",
    name: "Berry Almond Granola",
    brand: "Mornings Co.",
    categoryId: "snacks",
    price: 289,
    rating: 4.5,
    stock: 26,
    eta: "14 mins",
    unit: "400 g",
    tags: ["Healthy", "Breakfast", "Crunchy"],
    description: "Small-batch granola loaded with dried berries and roasted almonds.",
  },
  {
    id: "prod-coldbrew",
    slug: "classic-cold-brew",
    name: "Classic Cold Brew",
    brand: "Roast Lane",
    categoryId: "beverages",
    price: 149,
    rating: 4.4,
    stock: 54,
    eta: "11 mins",
    unit: "300 ml",
    tags: ["Coffee", "Chilled", "Ready to drink"],
    description: "Slow-steeped cold brew with cocoa notes and a smooth finish.",
  },
  {
    id: "prod-oranges",
    slug: "nagpur-oranges-box",
    name: "Nagpur Oranges Box",
    brand: "Citrus Route",
    categoryId: "fruit",
    price: 199,
    compareAtPrice: 239,
    rating: 4.8,
    stock: 62,
    eta: "7 mins",
    unit: "1 kg",
    tags: ["Juicy", "Vitamin C", "Seasonal"],
    description: "Sweet, easy-peel oranges packed for family breakfasts and juicing.",
  },
  {
    id: "prod-detergent",
    slug: "plant-safe-detergent",
    name: "Plant Safe Detergent",
    brand: "HomeKind",
    categoryId: "essentials",
    price: 349,
    rating: 4.3,
    stock: 18,
    eta: "16 mins",
    unit: "2 ltr",
    tags: ["Home care", "Eco", "Refill"],
    description: "Low-residue liquid detergent with a soft botanical fragrance.",
  },
];

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
