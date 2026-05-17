import { NextResponse } from "next/server";
import { getStrapiAuthHeaders } from "@/data/services/strapi-auth-headers";
import { getStrapiURL } from "@/lib/utils";

const strapiUrl = (process.env.STRAPI_BASE_URL || process.env.NEXT_PUBLIC_STRAPI_BASE_URL || getStrapiURL()).replace("localhost", "127.0.0.1");

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await request.json().catch(() => ({}));

  try {
    const response = await fetch(`${strapiUrl}/api/sponsors/${id}`, {
      method: "PUT",
      headers: await getStrapiAuthHeaders(),
      body: JSON.stringify({ data }),
    });

    const payload = await response.json().catch(() => null);
    return NextResponse.json(payload ?? {}, { status: response.status });
  } catch (err) {
    console.error("Failed to update sponsor:", err);
    return NextResponse.json({ error: "Failed to update sponsor" }, { status: 500 });
  }
}
