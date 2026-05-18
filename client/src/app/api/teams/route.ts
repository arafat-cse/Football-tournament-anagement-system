import { NextResponse } from "next/server";
import { getResolvedStrapiURL } from "@/lib/utils";

const strapiUrl = getResolvedStrapiURL();
const token = process.env.STRAPI_API_TOKEN;

async function uploadFile(file: File | null) {
  if (!token) return undefined;
  if (!file || file.size === 0) return undefined;

  const body = new FormData();
  body.append("files", file);

  const response = await fetch(`${strapiUrl}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  if (!response.ok) throw new Error("Team logo upload failed");
  const uploaded = await response.json();
  return uploaded?.[0]?.id;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const logo = formData.get("logo") as File | null;
    const logoId = await uploadFile(logo);
    const data: Record<string, unknown> = {
      name: formData.get("name"),
      ownerName: formData.get("ownerName") || undefined,
      ownerPhone: formData.get("ownerPhone") || undefined,
      budget: Number(formData.get("budget") || 0),
      jerseyColor: formData.get("jerseyColor") || "#16a34a",
      tournament: Number(formData.get("tournament")),
      ...(logoId ? { logo: logoId } : {}),
    };

    const publicBody = new FormData();
    publicBody.append("data", JSON.stringify(data));
    if (logo instanceof File && logo.size > 0) publicBody.append("logo", logo, logo.name);

    const response = await fetch(token ? `${strapiUrl}/api/teams` : `${strapiUrl}/api/public-teams`, {
      method: "POST",
      headers: token
        ? {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        : undefined,
      body: token ? JSON.stringify({ data }) : publicBody,
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ error: payload?.error?.message ?? "Could not save team" }, { status: response.status });
    }

    return NextResponse.json({ data: payload?.data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Team registration failed" }, { status: 500 });
  }
}
