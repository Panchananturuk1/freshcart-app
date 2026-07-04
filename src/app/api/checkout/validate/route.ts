import { NextResponse } from "next/server";

import { savedAddresses } from "@/lib/mock-data";

type ValidatePayload = {
  addressId?: string;
  paymentMethod?: "UPI" | "Card" | "Wallet";
};

export async function POST(request: Request) {
  const body = (await request.json()) as ValidatePayload;
  const address = savedAddresses.find((entry) => entry.id === body.addressId);

  const issues = [];

  if (!address) {
    issues.push({ code: "UNSERVICEABLE_ADDRESS", message: "Select a valid saved delivery address." });
  }

  if (!body.paymentMethod) {
    issues.push({ code: "PAYMENT_UNAVAILABLE", message: "Choose a supported payment method." });
  }

  return NextResponse.json({
    valid: issues.length === 0,
    issues,
    pricing: {
      subtotal: 539,
      discountTotal: 40,
      deliveryFee: 0,
      taxTotal: 0,
      grandTotal: 499,
    },
  });
}
