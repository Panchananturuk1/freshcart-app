export type CategoryDTO = {
  id: string;
  name: string;
  emoji: string;
  description: string;
};

export type ProductDTO = {
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
  tags: string[];
  description: string;
  imagePath: string;
};

export type OrderTimelineStepDTO = {
  status: string;
  time: string;
  note: string;
};

export type OrderTimelineDTO = {
  id: string;
  status: string;
  etaMinutes: number;
  rider: { name?: string | null; phoneMasked?: string | null; vehicle?: string | null };
  timeline: OrderTimelineStepDTO[];
};

