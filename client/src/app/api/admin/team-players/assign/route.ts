import { NextResponse } from "next/server";
import { getStrapiAuthHeaders } from "@/data/services/strapi-auth-headers";
import { getStrapiURL, getResolvedStrapiURL } from "@/lib/utils";

const strapiUrl = getResolvedStrapiURL();

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const response = await fetch(`${strapiUrl}/api/team-players/assign`, {
    method: "POST",
    headers: await getStrapiAuthHeaders(),
    body: JSON.stringify({ data: body }),
  });

  const payload = await response.json().catch(() => null);
  return NextResponse.json(payload ?? {}, { status: response.status });
}
