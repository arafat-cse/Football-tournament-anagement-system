import { NextResponse } from "next/server";
import { getStrapiAuthHeaders } from "@/data/services/strapi-auth-headers";
import { getStrapiURL } from "@/lib/utils";

const strapiUrl = (process.env.STRAPI_BASE_URL || process.env.NEXT_PUBLIC_STRAPI_BASE_URL || getStrapiURL()).replace("localhost", "127.0.0.1");

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await fetch(`${strapiUrl}/api/registrations/${id}/approve`, {
    method: "POST",
    headers: await getStrapiAuthHeaders(),
  });

  const payload = await response.json().catch(() => null);
  return NextResponse.json(payload ?? {}, { status: response.status });
}
