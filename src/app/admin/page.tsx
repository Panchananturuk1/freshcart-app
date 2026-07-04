import { AppHeader, AdminOverview } from "@/components/commerce-ui";
import { demoOrders, products } from "@/lib/mock-data";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-white/8 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/60">Admin dashboard</p>
          <h1 className="mt-3 font-serif text-4xl text-white">Inventory, orders, and users</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-50/72">
            The dashboard centralizes inventory controls, order queue management, customer monitoring, and merchandising decisions in a layout tuned for both desktop review and tablet operations.
          </p>
        </section>

        <AdminOverview />

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/8 bg-white/5 p-6">
            <h2 className="font-serif text-3xl text-white">Inventory management</h2>
            <div className="mt-5 space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex flex-col gap-3 rounded-[1.5rem] border border-white/8 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{product.name}</p>
                    <p className="mt-1 text-sm text-emerald-50/70">{product.brand} • {product.unit}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-white/8 px-3 py-2 text-emerald-50/80">Stock {product.stock}</span>
                    <span className="rounded-full bg-lime-300 px-3 py-2 font-semibold text-zinc-950">INR {product.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/8 bg-white/5 p-6">
            <h2 className="font-serif text-3xl text-white">Order processing queue</h2>
            <div className="mt-5 space-y-3">
              {demoOrders.map((order) => (
                <article key={order.id} className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white">{order.id}</p>
                  <p className="mt-1 text-sm text-emerald-50/70">{order.customer} • {order.addressLabel}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs">
                    <span className="rounded-full bg-white/8 px-3 py-2 text-emerald-50/80">{order.status}</span>
                    <span className="rounded-full bg-lime-300 px-3 py-2 font-semibold text-zinc-950">ETA {order.etaMinutes} mins</span>
                    <span className="rounded-full bg-white/8 px-3 py-2 text-emerald-50/80">{order.paymentMethod}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
