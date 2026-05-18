import { NextResponse } from "next/server";
import { getStrapiAuthHeaders } from "@/data/services/strapi-auth-headers";
import { getStrapiURL, getResolvedStrapiURL } from "@/lib/utils";

const strapiUrl = getResolvedStrapiURL();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { paymentStatus = "paid" } = await request.json().catch(() => ({}));

  const response = await fetch(`${strapiUrl}/api/registrations/${id}`, {
    method: "PUT",
    headers: await getStrapiAuthHeaders(),
    body: JSON.stringify({ data: { paymentStatus } }),
  });

  const payload = await response.json().catch(() => null);
  return NextResponse.json(payload ?? {}, { status: response.status });
}
