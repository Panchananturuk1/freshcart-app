"use client";

import Image from "next/image";
import { useState } from "react";

import { getProductImage } from "@/lib/mock-data";

type ProductPhotoProps = {
  product: { slug: string; name: string; imagePath?: string };
  sizes: string;
  className?: string;
  priority?: boolean;
};

export function ProductPhoto({ product, sizes, className = "object-cover", priority = false }: ProductPhotoProps) {
  const [src, setSrc] = useState(getProductImage(product));

  return (
    <Image
      src={src}
      alt={product.name}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={() => {
        if (src !== "/images/products/placeholder.jpg") {
          setSrc("/images/products/placeholder.jpg");
        }
      }}
    />
  );
}
