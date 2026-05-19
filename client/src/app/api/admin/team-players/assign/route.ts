import { NextResponse } from "next/server";
import { getStrapiAuthHeaders } from "@/data/services/strapi-auth-headers";
import { getResolvedStrapiURL } from "@/lib/utils";

const strapiUrl = getResolvedStrapiURL();

async function resolveDocumentId(collection: string, value: unknown) {
  if (!value) return value;
  const stringValue = String(value);
  if (!/^\d+$/.test(stringValue)) return value;

  const response = await fetch(`${strapiUrl}/api/${collection}?filters[id][$eq]=${encodeURIComponent(stringValue)}&pagination[pageSize]=1`, {
    headers: await getStrapiAuthHeaders(),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  return payload?.data?.[0]?.documentId ?? value;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const data = {
    ...body,
    tournamentId: await resolveDocumentId("tournaments", body.tournamentId),
    teamId: await resolveDocumentId("teams", body.teamId),
    playerId: await resolveDocumentId("players", body.playerId),
  };

  const response = await fetch(`${strapiUrl}/api/team-players/assign`, {
    method: "POST",
    headers: await getStrapiAuthHeaders(),
    body: JSON.stringify({ data }),
  });

  const payload = await response.json().catch(() => null);
  return NextResponse.json(payload ?? {}, { status: response.status });
}
