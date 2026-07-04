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
  { id: "lux", name: "Luxury", emoji: "🏨", description: "Premium city stays and skyline views." },
  { id: "boutique", name: "Boutique", emoji: "🛎️", description: "Design-forward stays with character." },
  { id: "business", name: "Business", emoji: "💼", description: "Work-ready hotels near key districts." },
  { id: "resort", name: "Resorts", emoji: "🏝️", description: "Pools, spa days, and scenic escapes." },
  { id: "villa", name: "Villas", emoji: "🏡", description: "Private stays with extra space." },
  { id: "budget", name: "Budget", emoji: "🧳", description: "Clean, comfortable, great value." },
];

export const products: Product[] = [
  {
    id: "stay-aurum-skyline",
    slug: "aurum-skyline-hotel",
    name: "Aurum Skyline Hotel",
    brand: "Aurum Hotels",
    categoryId: "lux",
    price: 8999,
    compareAtPrice: 10999,
    rating: 4.8,
    stock: 12,
    eta: "Instant confirmation",
    unit: "₹/night",
    tags: ["Breakfast included", "Skyline view", "King bed"],
    description: "Luxury king room with floor-to-ceiling skyline views, premium linens, and a quiet, modern workspace.",
    prompt:
      "ultra realistic luxury hotel room photograph, modern king bed with crisp white linens and warm ambient lighting, floor-to-ceiling window with city skyline at dusk, premium minimal decor, clean composition, high-end hospitality photography, no people, no text, no watermark",
  },
  {
    id: "stay-marble-atrium",
    slug: "marble-atrium-suites",
    name: "Marble Atrium Suites",
    brand: "Atrium Collection",
    categoryId: "boutique",
    price: 7499,
    compareAtPrice: 8999,
    rating: 4.7,
    stock: 8,
    eta: "Free cancellation",
    unit: "₹/night",
    tags: ["Boutique design", "Atrium lobby", "Near metro"],
    description: "Boutique suites centered around a bright marble atrium, with curated interiors and a calm, premium feel.",
    prompt:
      "ultra realistic luxury hotel lobby photograph, grand marble atrium with indoor greenery, modern chandeliers, warm lighting, premium seating area, high-end boutique hotel aesthetic, clean composition, no people, no text, no watermark",
  },
  {
    id: "stay-axis-business",
    slug: "axis-business-hotel",
    name: "Axis Business Hotel",
    brand: "Axis Stays",
    categoryId: "business",
    price: 6299,
    compareAtPrice: 7499,
    rating: 4.5,
    stock: 20,
    eta: "Work-friendly",
    unit: "₹/night",
    tags: ["Fast Wi‑Fi", "Breakfast", "Work desk"],
    description: "Efficient business rooms with fast Wi‑Fi, a dedicated desk, and quick access to the business district.",
    prompt:
      "ultra realistic modern business hotel room photograph, clean king bed, ergonomic desk setup, laptop-ready workspace, warm neutral palette, soft lighting, minimal decor, premium hospitality photography, no people, no text, no watermark",
  },
  {
    id: "stay-lagoon-resort",
    slug: "lagoon-bay-resort",
    name: "Lagoon Bay Resort",
    brand: "Lagoon Resorts",
    categoryId: "resort",
    price: 11999,
    compareAtPrice: 14999,
    rating: 4.9,
    stock: 6,
    eta: "Pool & spa",
    unit: "₹/night",
    tags: ["Ocean view", "Infinity pool", "Spa"],
    description: "Beachside resort with an infinity pool, spa access, and airy suites designed for slow, scenic stays.",
    prompt:
      "ultra realistic luxury resort photograph, infinity pool overlooking the ocean, modern sun loungers, palm trees, golden hour lighting, premium resort architecture, high-end travel photography, no people, no text, no watermark",
  },
  {
    id: "stay-cedar-villa",
    slug: "cedar-private-villa",
    name: "Cedar Private Villa",
    brand: "Cedar Retreats",
    categoryId: "villa",
    price: 15999,
    compareAtPrice: 18999,
    rating: 4.8,
    stock: 4,
    eta: "Private stay",
    unit: "₹/night",
    tags: ["Entire villa", "Kitchenette", "Mountain view"],
    description: "Private villa with a cozy lounge, kitchenette, and scenic views—ideal for small families and weekend getaways.",
    prompt:
      "ultra realistic modern private villa photograph, cozy living room with large windows, warm wood textures, designer sofa, ambient lighting, mountain view outside, premium lifestyle photography, no people, no text, no watermark",
  },
  {
    id: "stay-urban-lite",
    slug: "urban-lite-hotel",
    name: "Urban Lite Hotel",
    brand: "Urban Lite",
    categoryId: "budget",
    price: 3499,
    compareAtPrice: 4299,
    rating: 4.3,
    stock: 28,
    eta: "Great value",
    unit: "₹/night",
    tags: ["Clean rooms", "Near transit", "24/7 check-in"],
    description: "Modern budget hotel with spotless rooms, 24/7 check-in, and easy connectivity for quick city trips.",
    prompt:
      "ultra realistic modern budget hotel room photograph, clean double bed, bright natural light, minimal decor, compact but premium feel, tidy bathroom glimpse, professional hospitality photography, no people, no text, no watermark",
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
      { productId: "stay-aurum-skyline", quantity: 1 },
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
  loyaltyTier: "Aurum Club",
  nextDelivery: "This weekend",
  savings: 1840,
};

export const getProductBySlug = (slug: string) => products.find((product) => product.slug === slug);

export const getProductImage = (product: Product, size?: string) => buildImage(product.prompt, size);
