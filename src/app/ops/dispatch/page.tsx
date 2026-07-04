import { AppHeader } from "@/components/commerce-ui";
import { prisma } from "@/lib/db";

const statusLabel = (status: string) => {
  switch (status) {
    case "PLACED":
      return "Placed";
    case "CONFIRMED":
      return "Confirmed";
    case "PICKING":
      return "Picking";
    case "PACKED":
      return "Packed";
    case "OUT_FOR_DELIVERY":
      return "Out for delivery";
    case "DELIVERED":
      return "Delivered";
    default:
      return status;
  }
};

export default async function DispatchPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 18,
    include: { user: true, address: true },
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-white/8 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/60">Operations console</p>
          <h1 className="mt-3 font-serif text-4xl text-white">Dispatch board</h1>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {orders.length ? (
              orders.map((order) => (
                <article key={order.id} className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5">
                  <p className="text-sm font-semibold text-white">{order.displayId}</p>
                  <p className="mt-2 text-sm text-emerald-50/72">{order.user.fullName}</p>
                  <p className="mt-1 text-sm text-emerald-100/55">{order.address?.title ?? "No address"}</p>
                  <div className="mt-4 space-y-2 text-xs text-emerald-50/72">
                    <p>Status: {statusLabel(order.status)}</p>
                    <p>Rider: {order.riderName ?? "Unassigned"}</p>
                    <p>Vehicle: {order.riderVehicle ?? "Pending"}</p>
                  </div>
                  <button
                    type="button"
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-lime-300 px-4 text-sm font-semibold text-zinc-950"
                  >
                    Mark proof of delivery
                  </button>
                </article>
              ))
            ) : (
              <article className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5">
                <p className="text-sm text-emerald-50/72">No orders in queue.</p>
              </article>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
