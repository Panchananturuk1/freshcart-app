"use client";

import Image from "next/image";
import { useState } from "react";

import { getProductImage } from "@/lib/mock-data";

type ProductImageProps = {
  product: { slug: string; name: string; imagePath?: string };
  alt?: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export function ProductImage({ product, alt, sizes, className = "object-cover", priority }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const src = getProductImage(product);

  if (failed) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-[#efe8d8] text-4xl" aria-hidden>
        🛒
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt ?? product.name}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}
