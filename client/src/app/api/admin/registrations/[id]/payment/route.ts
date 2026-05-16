import { NextResponse } from "next/server";
import { getStrapiURL } from "@/lib/utils";
import { getStrapiAuthHeaders } from "@/data/services/strapi-auth-headers";

const strapiUrl = (process.env.STRAPI_BASE_URL || process.env.NEXT_PUBLIC_STRAPI_BASE_URL || getStrapiURL()).replace("localhost", "127.0.0.1");

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { paymentStatus = "paid" } = await request.json().catch(() => ({}));

  const response = await fetch(`${strapiUrl}/api/registrations/${id}/payment`, {
    method: "POST",
    headers: await getStrapiAuthHeaders(),
    body: JSON.stringify({ data: { paymentStatus } }),
  });

  const payload = await response.json().catch(() => null);
  return NextResponse.json(payload ?? {}, { status: response.status });
}
