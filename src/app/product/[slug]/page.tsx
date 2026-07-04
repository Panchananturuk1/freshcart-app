import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock3, Leaf, ShieldCheck } from "lucide-react";

import { AppHeader } from "@/components/commerce-ui";
import { getProductImage } from "@/lib/mock-data";
import { getProductBySlugDb } from "@/lib/catalog-db";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlugDb(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/8 bg-[#f4f1e8] p-4 text-zinc-900">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
            <Image
              src={getProductImage(product, "landscape_4_3")}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              unoptimized
            />
          </div>
          <div className="grid gap-3 pt-4 sm:grid-cols-3">
            {[product, product, product].map((entry, index) => (
              <div key={`${entry.id}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image src={getProductImage(entry)} alt={`${entry.name} view ${index + 1}`} fill className="object-cover" sizes="200px" unoptimized />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/8 bg-white/5 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/60">{product.brand}</p>
          <h1 className="mt-3 font-serif text-4xl text-white">{product.name}</h1>
          <p className="mt-4 text-sm leading-7 text-emerald-50/74">{product.description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs text-emerald-100/55">Price</p>
              <p className="mt-2 text-xl font-semibold text-white">INR {product.price}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs text-emerald-100/55">Delivery ETA</p>
              <p className="mt-2 text-xl font-semibold text-white">{product.eta}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs text-emerald-100/55">Pack size</p>
              <p className="mt-2 text-xl font-semibold text-white">{product.unit}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-emerald-50/75">
              <Clock3 size={18} className="text-lime-300" />
              Delivery promise locked for your selected address.
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-emerald-50/75">
              <Leaf size={18} className="text-lime-300" />
              Freshness handling and storage guidance included.
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-emerald-50/75">
              <ShieldCheck size={18} className="text-lime-300" />
              Secure checkout supported with UPI, card, and wallet rails.
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/cart" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-semibold text-zinc-950">
              Go to cart
            </Link>
            <Link href="/catalog" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white">
              Continue shopping
            </Link>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-emerald-300/15 bg-emerald-300/8 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="mt-1 text-lime-300" />
              <div>
                <h2 className="text-sm font-semibold text-white">Why it converts well on mobile</h2>
                <p className="mt-2 text-sm leading-7 text-emerald-50/74">
                  Sticky CTAs, compact detail cards, and lightweight media help product pages remain fast and touch-friendly across low-bandwidth conditions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
