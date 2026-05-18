import { NextResponse } from "next/server";
import { getStrapiAuthHeaders } from "@/data/services/strapi-auth-headers";
import { getStrapiURL, getResolvedStrapiURL } from "@/lib/utils";

const strapiUrl = getResolvedStrapiURL();

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await fetch(`${strapiUrl}/api/registrations/${id}/approve`, {
    method: "POST",
    headers: await getStrapiAuthHeaders(),
  });

  const payload = await response.json().catch(() => null);
  return NextResponse.json(payload ?? {}, { status: response.status });
}
