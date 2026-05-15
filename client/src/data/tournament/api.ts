import { getStrapiURL } from "@/lib/utils";
import { auctions, players, registrations, teams, tournaments } from "./mock";

const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || getStrapiURL();

async function fetchStrapi<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${apiUrl}/api${path}`, { next: { revalidate: 30 } });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload.data as T;
  } catch {
    return null;
  }
}

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
  return slug ? registrations.filter((registration) => registration.tournamentSlug === slug) : registrations;
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
