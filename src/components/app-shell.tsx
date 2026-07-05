"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock3, Grid2x2, House, MapPin, Search, ShoppingBasket, UserRound } from "lucide-react";

import { useAppStore } from "@/store/use-app-store";

type AppShellProps = {
  children: ReactNode;
};

type AppTopBarProps = {
  title: string;
  subtitle?: string;
  showSearchShortcut?: boolean;
};

const navItems = [
  { href: "/", label: "Home", icon: House },
  { href: "/catalog", label: "Browse", icon: Grid2x2 },
  { href: "/cart", label: "Cart", icon: ShoppingBasket },
  { href: "/account", label: "Account", icon: UserRound },
];

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(163,230,53,0.14),_transparent_26%),linear-gradient(180deg,_#08110a,_#050a06)]">
      <div className="mx-auto flex min-h-screen max-w-[560px] flex-col border-x border-white/6 bg-[rgba(8,17,10,0.88)] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_120px_-48px_rgba(0,0,0,0.95)] md:max-w-[760px] xl:max-w-[1180px]">
        {children}
      </div>
    </div>
  );
}

export function AppTopBar({ title, subtitle, showSearchShortcut = true }: AppTopBarProps) {
  const pathname = usePathname();
  const activeAddressId = useAppStore((state) => state.activeAddressId);
  const addresses = useAppStore((state) => state.addresses);
  const cartCount = useAppStore((state) => state.cart.reduce((sum, item) => sum + item.quantity, 0));
  const user = useAppStore((state) => state.user);
  const activeAddress = addresses.find((address) => address.id === activeAddressId) ?? addresses[0];
  const avatarInitials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part.trim())
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "";
  const accountHref = user ? "/account" : `/auth/sign-in?redirectTo=${encodeURIComponent(pathname)}`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(8,17,10,0.9)] backdrop-blur-xl">
      <div className="px-4 pb-4 pt-3 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="text-[11px] font-semibold uppercase tracking-[0.24em] text-lime-200/80">
                FreshCart
              </Link>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-lime-200/80">
                <MapPin size={14} />
                Deliver to
              </p>
            </div>
            <h1 className="mt-2 truncate font-serif text-[1.75rem] leading-none text-white">{title}</h1>
            <p className="mt-2 truncate text-sm text-emerald-50/68">
              {subtitle ?? `${activeAddress?.title ?? "Select address"} • ${activeAddress?.eta ?? "Fast delivery"}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              aria-label="Cart"
              className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/5 px-3 text-white"
            >
              <div className="relative">
                <ShoppingBasket size={20} />
                {cartCount ? (
                  <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-lime-300 px-1 text-[10px] font-bold text-zinc-950">
                    {cartCount}
                  </span>
                ) : null}
              </div>
            </Link>

            <Link href={accountHref} aria-label={user ? "Account" : "Sign in"} className="inline-flex min-h-12 min-w-12 items-center justify-center">
              {user ? (
                <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-lime-300 text-sm font-semibold text-zinc-950">
                  {avatarInitials || <UserRound size={18} />}
                </span>
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-white">
                  <UserRound size={18} />
                </span>
              )}
            </Link>
          </div>
        </div>

        {showSearchShortcut ? (
          <Link
            href="/catalog"
            className="mt-4 flex min-h-12 items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 text-sm text-emerald-50/60"
          >
            <Search size={18} />
            Search vegetables, atta, milk, snacks...
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export function ScreenContent({ children }: AppShellProps) {
  return <main className="flex-1 space-y-5 px-4 py-4 pb-28 sm:px-5">{children}</main>;
}

export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/56">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-2xl leading-tight text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-40 border-t border-white/8 bg-[rgba(8,17,10,0.94)] px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-2 rounded-[1.75rem] border border-white/8 bg-white/5 p-2">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center rounded-2xl text-[11px] font-medium ${
                active ? "bg-lime-300 text-zinc-950" : "text-emerald-50/72"
              }`}
            >
              <item.icon size={18} />
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function InlineMeta({
  eta,
  badge,
}: {
  eta: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-emerald-50/60">
      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1.5">
        <Clock3 size={12} />
        {eta}
      </span>
      {badge ? <span className="rounded-full bg-lime-300/12 px-2.5 py-1.5 text-lime-200">{badge}</span> : null}
    </div>
  );
}
