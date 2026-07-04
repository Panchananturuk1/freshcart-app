import type { Metadata } from "next";
import { DM_Serif_Display, Manrope } from "next/font/google";
import { AuthHydrator } from "@/components/auth-hydrator";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const displayFont = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "FreshCart | Grocery Delivery Platform",
  description:
    "A Vercel-ready grocery delivery application with responsive shopping, checkout, order tracking, and admin operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthHydrator />
        {children}
      </body>
    </html>
  );
}
