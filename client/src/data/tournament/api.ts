import { getStrapiURL } from "@/lib/utils";
import { auctions, players, registrations, teams, tournaments } from "./mock";
import type { Registration } from "./types";

const apiUrl = (process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.STRAPI_BASE_URL || getStrapiURL()).replace("localhost", "127.0.0.1");
const token = process.env.STRAPI_API_TOKEN;

async function fetchStrapi<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${apiUrl}/api${path}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 30 },
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload.data as T;
  } catch {
    return null;
  }
}

const flatten = (item: any) => ({ id: item.id, documentId: item.documentId, ...(item.attributes ?? {}), ...item });

const relationId = (value: any) => {
  if (!value) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || undefined;
  return value.id ?? value.data?.id;
};

export async function getTournaments() {
  const remote = await fetchStrapi<any[]>("/tournaments?populate=*&sort=startDate:asc");
  if (!remote?.length) return tournaments;
  return remote.map((item) => ({ id: item.id, ...item.attributes, ...item }));
}

export async function getTournamentBySlug(slug: string) {
  const all = await getTournaments();
  return all.find((tournament) => tournament.slug === slug) ?? null;
}

export async function getTeams(slug?: string) {
  return slug ? teams.filter((team) => team.tournamentSlug === slug) : teams;
}

export async function getTeam(teamId: string | number) {
  return teams.find((team) => String(team.id) === String(teamId)) ?? null;
}

export async function getPlayers(slug?: string) {
  return slug ? players.filter((player) => player.tournamentSlug === slug) : players;
}

export async function getRegistrations(slug?: string) {
  const remote = await fetchStrapi<any[]>("/registrations?populate=tournament&sort=createdAt:desc&pagination[pageSize]=100");
  if (remote?.length) {
    const all = remote.map((item): Registration => {
      const flat = flatten(item);
      const tournament = flat.tournament?.data ? flatten(flat.tournament.data) : flat.tournament;
      return {
        id: flat.id,
        documentId: flat.documentId,
        name: flat.name,
        phone: flat.phone,
        email: flat.email ?? "",
        age: Number(flat.age ?? 0),
        address: flat.address ?? "",
        role: flat.role ?? "",
        experience: flat.experience ?? "",
        basePrice: Number(flat.basePrice ?? 0),
        registrationStatus: flat.registrationStatus ?? "pending",
        paymentStatus: flat.paymentStatus ?? "pending",
        auctionStatus: "pool",
        tournamentSlug: tournament?.slug ?? "",
        paymentMethod: flat.paymentMethod ?? "bkash",
        transactionId: flat.transactionId ?? "",
        amount: Number(flat.amount ?? 0),
        rejectionReason: flat.rejectionReason ?? undefined,
        createdAt: flat.createdAt ?? "",
      };
    });
    return slug ? all.filter((registration) => registration.tournamentSlug === slug) : all;
  }
  return slug ? registrations.filter((registration) => registration.tournamentSlug === slug) : registrations;
}

export async function getTournamentRelationId(slug: string) {
  const tournament = await getTournamentBySlug(slug);
  return tournament ? relationId(tournament) ?? tournament.id : undefined;
}

export async function getAuctions(slug?: string) {
  return slug ? auctions.filter((auction) => auction.tournamentSlug === slug) : auctions;
}

export async function getDashboardStats() {
  return {
    tournaments: tournaments.length,
    teams: teams.length,
    registrations: registrations.length,
    pendingRegistrations: registrations.filter((item) => item.registrationStatus === "pending").length,
    paidRegistrations: registrations.filter((item) => item.paymentStatus === "paid").length,
    soldPlayers: players.filter((item) => item.auctionStatus === "sold").length,
    revenue: registrations.filter((item) => item.paymentStatus === "paid").reduce((sum, item) => sum + item.amount, 0),
  };
}
