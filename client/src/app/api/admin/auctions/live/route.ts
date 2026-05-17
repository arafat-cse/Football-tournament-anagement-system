import { NextResponse } from "next/server";
import { getAuthToken } from "@/data/services/get-auth-token";
import { getStrapiURL } from "@/lib/utils";

const strapiUrl = (process.env.STRAPI_BASE_URL || process.env.NEXT_PUBLIC_STRAPI_BASE_URL || getStrapiURL()).replace("localhost", "127.0.0.1");

export async function POST(request: Request) {
  const { tournamentId, playerId, title } = await request.json().catch(() => ({}));

  if (!tournamentId || !playerId) {
    return NextResponse.json({ error: "tournamentId and playerId are required" }, { status: 400 });
  }

  const jwt = await getAuthToken();
  const token = process.env.STRAPI_API_TOKEN ?? jwt;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const params = new URLSearchParams({
    "filters[tournament][id][$eq]": String(tournamentId),
    "filters[displayStatus][$eq]": "live",
    "pagination[pageSize]": "1",
  });

  const currentResponse = await fetch(`${strapiUrl}/api/auctions?${params.toString()}`, {
    headers,
    cache: "no-store",
  });
  const currentPayload = await currentResponse.json().catch(() => null);

  if (!currentResponse.ok) {
    return NextResponse.json(currentPayload ?? {}, { status: currentResponse.status });
  }

  const current = currentPayload?.data?.[0];
  const response = await fetch(`${strapiUrl}/api/auctions${current ? `/${current.documentId ?? current.id}` : ""}`, {
    method: current ? "PUT" : "POST",
    headers,
    body: JSON.stringify({
      data: {
        title: title || "Live Auction",
        displayStatus: "live",
        tournament: Number(tournamentId),
        player: Number(playerId),
      },
    }),
  });

  const payload = await response.json().catch(() => null);
  return NextResponse.json(payload ?? {}, { status: response.status });
}
