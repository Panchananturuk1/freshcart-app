import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET() {
  const items = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ items });
}
