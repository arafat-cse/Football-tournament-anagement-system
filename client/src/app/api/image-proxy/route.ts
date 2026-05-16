import { NextResponse } from "next/server";
import { getStrapiURL } from "@/lib/utils";

function resolveImageUrl(rawUrl: string) {
  if (rawUrl.startsWith("/uploads/")) {
    const url = new URL(rawUrl, getStrapiURL());
    if (url.hostname === "localhost") url.hostname = "127.0.0.1";
    return url;
  }

  const url = new URL(rawUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Unsupported image URL");
  }
  if (url.hostname === "localhost") url.hostname = "127.0.0.1";

  return url;
}

export async function GET(request: Request) {
  const rawUrl = new URL(request.url).searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
  }

  let imageUrl: URL;
  try {
    imageUrl = resolveImageUrl(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ error: "Image not found" }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "URL is not an image" }, { status: 415 });
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not load image" }, { status: 502 });
  }
}
