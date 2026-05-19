import { NextResponse } from "next/server";
import { getStrapiAuthHeaders } from "@/data/services/strapi-auth-headers";
import { getResolvedStrapiURL } from "@/lib/utils";

const strapiUrl = getResolvedStrapiURL();

type EntityRecord = Record<string, unknown> & {
  id?: string | number;
  documentId?: string;
  attributes?: Record<string, unknown>;
};

function asRecord(value: unknown): EntityRecord | undefined {
  return value && typeof value === "object" ? (value as EntityRecord) : undefined;
}

function entity(payload: unknown) {
  const payloadRecord = asRecord(payload);
  const data = asRecord(payloadRecord?.data) ?? payloadRecord;
  if (!data) return undefined;
  if (!data.attributes) return data;
  return { id: data.id, documentId: data.documentId, ...data.attributes };
}

function firstEntity(payload: unknown) {
  const payloadRecord = asRecord(payload);
  const data = Array.isArray(payloadRecord?.data) ? payloadRecord.data[0] : undefined;
  return entity(data);
}

function relationId(value: unknown) {
  if (!value) return undefined;
  if (typeof value === "string" || typeof value === "number") return value;
  const record = asRecord(value);
  return record?.documentId ?? record?.id;
}

async function strapiJson(path: string, init: RequestInit = {}) {
  const response = await fetch(`${strapiUrl}${path}`, {
    ...init,
    headers: {
      ...(await getStrapiAuthHeaders()),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  return { response, payload };
}

async function updateRegistration(id: string, data: Record<string, unknown>) {
  let result = await strapiJson(`/api/registrations/${id}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });

  const message = String(asRecord(asRecord(result.payload)?.error)?.message ?? "");
  if (!result.response.ok && message.includes("plugin::upload.file")) {
    result = await strapiJson(`/api/registrations/${id}`, {
      method: "PUT",
      body: JSON.stringify({ data: { ...data, photo: null, paymentScreenshot: null } }),
    });
  }

  return result;
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const registrationResult = await strapiJson(`/api/registrations/${id}?populate[0]=tournament&populate[1]=player`);
  if (!registrationResult.response.ok) {
    return NextResponse.json(registrationResult.payload ?? {}, { status: registrationResult.response.status });
  }

  const registration = entity(registrationResult.payload);
  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  const updatedApproval = await updateRegistration(id, {
    registrationStatus: "approved",
    rejectionReason: null,
  });

  if (!updatedApproval.response.ok || registration.paymentStatus !== "paid") {
    return NextResponse.json(updatedApproval.payload ?? {}, { status: updatedApproval.response.status });
  }

  const tournament = asRecord(registration.tournament);
  let player = asRecord(registration.player);
  if (!player) {
    const existingPlayerResult = await strapiJson(
      `/api/players?filters[registration][documentId][$eq]=${encodeURIComponent(registration.documentId ?? id)}&pagination[pageSize]=1`
    );
    if (existingPlayerResult.response.ok) {
      player = firstEntity(existingPlayerResult.payload);
    }
  }

  const playerData = {
    name: registration.name,
    phone: registration.phone,
    email: registration.email,
    age: registration.age,
    address: registration.address,
    role: registration.role,
    experience: registration.experience,
    basePrice: registration.basePrice,
    registrationStatus: "approved",
    paymentStatus: registration.paymentStatus,
    auctionStatus: "pool",
    tournament: relationId(tournament),
    registration: registration.documentId ?? id,
  };

  const playerId = relationId(player);
  const playerResult = playerId
    ? await strapiJson(`/api/players/${playerId}`, {
        method: "PUT",
        body: JSON.stringify({
          data: {
            registrationStatus: "approved",
            paymentStatus: registration.paymentStatus,
            auctionStatus: "pool",
          },
        }),
      })
    : await strapiJson("/api/players", {
        method: "POST",
        body: JSON.stringify({ data: playerData }),
      });

  if (!playerResult.response.ok) {
    return NextResponse.json(playerResult.payload ?? {}, { status: playerResult.response.status });
  }

  const savedPlayer = entity(playerResult.payload);
  const updated = await updateRegistration(id, {
    registrationStatus: "approved",
    rejectionReason: null,
    player: relationId(savedPlayer),
  });

  return NextResponse.json(updated.payload ?? {}, { status: updated.response.status });
}
