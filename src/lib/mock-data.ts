export type Category = {
  id: string;
  name: string;
  emoji: string;
  description: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  stock: number;
  eta: string;
  unit: string;
  tags: string[];
  description: string;
  prompt: string;
};

export type Address = {
  id: string;
  label: "Home" | "Work" | "Other";
  title: string;
  line1: string;
  line2: string;
  city: string;
  eta: string;
  isDefault?: boolean;
};

export type OrderEvent = {
  status:
    | "Placed"
    | "Confirmed"
    | "Picking"
    | "Packed"
    | "Out for delivery"
    | "Delivered";
  time: string;
  note: string;
};

export type DemoOrder = {
  id: string;
  customer: string;
  total: number;
  paymentMethod: "UPI" | "Card" | "Wallet";
  status: "Placed" | "Confirmed" | "Picking" | "Packed" | "Out for delivery" | "Delivered";
  etaMinutes: number;
  addressLabel: string;
  rider: {
    name: string;
    phoneMasked: string;
    vehicle: string;
  };
  items: Array<{ productId: string; quantity: number }>;
  timeline: OrderEvent[];
};

const buildImage = (prompt: string, imageSize = "square_hd") =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${imageSize}`;

export const categories: Category[] = [
  { id: "veg", name: "Vegetables", emoji: "🥬", description: "Farm-picked greens and staples." },
  { id: "fruit", name: "Fruits", emoji: "🍊", description: "Vitamin-rich seasonal fruits." },
  { id: "dairy", name: "Dairy", emoji: "🥛", description: "Milk, paneer, yogurt, and butter." },
  { id: "snacks", name: "Snacks", emoji: "🥨", description: "Evening bites and pantry treats." },
  { id: "beverages", name: "Beverages", emoji: "🥤", description: "Cold, fresh, and energizing drinks." },
  { id: "essentials", name: "Essentials", emoji: "🧼", description: "Home-care and everyday basics." },
];

export const products: Product[] = [
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
    prompt:
      "premium mobile grocery app product photo, two ripe hass avocados in a neat kraft tray with small produce sticker, isolated on soft warm cream background, bright natural studio lighting, crisp e-commerce packshot, realistic texture, no text overlay",
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
    prompt:
      "premium mobile grocery app product photo, fresh baby spinach leaves in a transparent retail pouch with subtle green label, isolated on pale mint background, bright clean studio lighting, sharp e-commerce packshot, realistic food texture, no text overlay",
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
    prompt:
      "premium mobile grocery app product photo, 1 liter organic toned milk bottle with modern dairy label and light condensation, isolated on soft sky blue background, bright studio lighting, realistic e-commerce packaging shot, no text overlay",
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
    prompt:
      "premium mobile grocery app product photo, fresh malai paneer cubes in sealed transparent food tray with premium label, isolated on soft ivory background, bright clean studio lighting, realistic dairy texture, e-commerce packshot, no text overlay",
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
    prompt:
      "premium mobile grocery app product photo, berry almond granola stand-up pouch with visible oats berries and almonds, isolated on blush beige background, bright studio lighting, clean e-commerce packshot, realistic packaging, no text overlay",
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
    prompt:
      "premium mobile grocery app product photo, classic cold brew coffee bottle with sleek dark label and realistic condensation, isolated on warm mocha background, bright controlled studio lighting, crisp beverage packshot, no text overlay",
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
    prompt:
      "premium mobile grocery app product photo, bright nagpur oranges arranged in a neat produce box with fresh leaves, isolated on vibrant citrus orange background, clean studio lighting, realistic fruit texture, crisp e-commerce packshot, no text overlay",
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
    prompt:
      "premium mobile grocery app product photo, eco-friendly liquid detergent bottle with refill-style modern label, isolated on pale sage background, bright clean studio lighting, realistic household packaging shot, crisp e-commerce packshot, no text overlay",
  },
];

export const savedAddresses: Address[] = [
  {
    id: "addr-home",
    label: "Home",
    title: "Lakeview Residency",
    line1: "Tower B, 9th Floor",
    line2: "Sector 42, Near Metro Gate 2",
    city: "Gurugram 122002",
    eta: "Deliver in 12 mins",
    isDefault: true,
  },
  {
    id: "addr-work",
    label: "Work",
    title: "North Axis Office",
    line1: "4th Floor, Sunrise Plaza",
    line2: "Golf Course Road",
    city: "Gurugram 122018",
    eta: "Deliver in 18 mins",
  },
];

export const demoOrders: DemoOrder[] = [
  {
    id: "FC-284019",
    customer: "Aarav Singh",
    total: 688,
    paymentMethod: "UPI",
    status: "Out for delivery",
    etaMinutes: 11,
    addressLabel: "Lakeview Residency",
    rider: { name: "Rahul", phoneMasked: "+91 98XXXX221", vehicle: "Blue scooter • DL 8S AH 1417" },
    items: [
      { productId: "prod-avocado", quantity: 1 },
      { productId: "prod-paneer", quantity: 2 },
      { productId: "prod-oranges", quantity: 1 },
    ],
    timeline: [
      { status: "Placed", time: "6:01 PM", note: "Payment captured through UPI." },
      { status: "Confirmed", time: "6:03 PM", note: "Store accepted the order." },
      { status: "Picking", time: "6:05 PM", note: "A picker started collecting your basket." },
      { status: "Packed", time: "6:11 PM", note: "Quality checked and sealed." },
      { status: "Out for delivery", time: "6:13 PM", note: "Rider left the store and is on the route." },
    ],
  },
];

export const adminStats = [
  { label: "Live orders", value: "124", helper: "+18 vs last hour" },
  { label: "Pending stock alerts", value: "09", helper: "3 critical SKUs" },
  { label: "New users today", value: "412", helper: "62% from mobile web" },
  { label: "Fulfillment SLA", value: "96.4%", helper: "Avg handoff in 11 mins" },
];

export const customerSpotlight = {
  name: "Aarav",
  loyaltyTier: "Fresh Plus",
  nextDelivery: "Tonight, 7:00 PM",
  savings: 384,
};

export const getProductBySlug = (slug: string) => products.find((product) => product.slug === slug);

export const getProductImage = (product: Product, size?: string) => buildImage(product.prompt, size);
