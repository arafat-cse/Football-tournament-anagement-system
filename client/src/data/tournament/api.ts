import { getStrapiMedia, getStrapiURL, getResolvedStrapiURL } from "@/lib/utils";
import type { Auction, Player, Registration, Sponsor, Team, TeamPlayer, Tournament } from "./types";

const apiUrl = getResolvedStrapiURL();
const token = process.env.STRAPI_API_TOKEN;

async function fetchStrapi<T>(path: string): Promise<T | null> {
  try {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const response = await fetch(`${apiUrl}/api${cleanPath}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload.data as T;
  } catch {
    return null;
  }
}

// Strapi v4/v5 can return either nested attributes or flat fields.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const flatten = (item: any) => ({ id: item.id, documentId: item.documentId, ...(item.attributes ?? {}), ...item });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const relationId = (value: any) => {
  if (!value) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || undefined;
  return value.id ?? value.data?.id;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const flattenRelation = (value: any) => (value?.data ? flatten(value.data) : value);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mediaUrl = (value: any) => {
  const media = flattenRelation(value);
  const url = media?.formats?.thumbnail?.url ?? media?.url;
  return url ? getStrapiMedia(url) ?? undefined : undefined;
};

export async function getTournaments(): Promise<Tournament[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const remote = await fetchStrapi<any[]>("/public-tournaments?populate=*&sort=startDate:asc");
  if (!remote?.length) return [];
  return remote.map((item) => {
    const flat = flatten(item);
    const teams = flat.teams?.data ?? flat.teams ?? [];
    const players = flat.players?.data ?? flat.players ?? [];
    return {
      id: flat.id,
      documentId: flat.documentId,
      name: flat.name,
      slug: flat.slug,
      sportType: flat.sportType ?? "football",
      location: flat.location ?? "",
      startDate: flat.startDate ?? "",
      endDate: flat.endDate ?? "",
      registrationFee: Number(flat.registrationFee ?? 0),
      registrationInstruction: flat.registrationInstruction ?? "",
      bannerUrl: mediaUrl(flat.banner),
      requiresPayment: Boolean(flat.requiresPayment ?? true),
      auctionDate: flat.auctionDate ?? "",
      rules: flat.rules ?? "",
      status: flat.tournamentStatus ?? flat.status ?? "draft",
      teamCount: Number(flat.teamCount ?? teams.length ?? 0),
      playerCount: Number(flat.playerCount ?? players.length ?? 0),
    };
  });
}

export async function getTournamentBySlug(slug: string) {
  const all = await getTournaments();
  return all.find((tournament) => tournament.slug === slug) ?? null;
}

export async function getTeams(slug?: string) {
  const remote =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (await fetchStrapi<any[]>(`/public-teams${slug ? `?tournamentSlug=${encodeURIComponent(slug)}` : ""}`)) ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (await fetchStrapi<any[]>("/teams?populate=tournament&sort=name:asc&pagination[pageSize]=100"));
  if (remote?.length) {
    const all = remote.map((item): Team => {
      const flat = flatten(item);
      const tournament = flattenRelation(flat.tournament);
      return {
        id: flat.id,
        name: flat.name,
        logoUrl: mediaUrl(flat.logo),
        ownerName: flat.ownerName ?? "",
        ownerPhone: flat.ownerPhone ?? "",
        budget: Number(flat.budget ?? 0),
        spent: Number(flat.spent ?? 0),
        registrationStatus: flat.registrationStatus ?? "approved",
        jerseyColor: flat.jerseyColor ?? "#16a34a",
        tournamentSlug: tournament?.slug ?? "",
      };
    });
    return slug ? all.filter((team) => team.tournamentSlug === slug) : all;
  }
  return [];
}

export async function getTeam(teamId: string | number, slug?: string) {
  const all = await getTeams(slug);
  return all.find((team) => String(team.id) === String(teamId)) ?? null;
}

export async function getPlayers(slug?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const remote = await fetchStrapi<any[]>(
    `/public-players?sort=createdAt:desc&pagination[pageSize]=100${slug ? `&tournamentSlug=${encodeURIComponent(slug)}` : ""}`
  );
  if (remote?.length) {
    const all = remote.map((item): Player => {
      const flat = flatten(item);
      const tournament = flattenRelation(flat.tournament);
      const teamPlayer = Array.isArray(flat.teamPlayers?.data)
        ? flattenRelation(flat.teamPlayers.data[0])
        : Array.isArray(flat.teamPlayers)
          ? flat.teamPlayers[0]
          : undefined;
      const team = flattenRelation(teamPlayer?.team);

      return {
        id: flat.id,
        name: flat.name,
        phone: flat.phone ?? "",
        email: flat.email ?? "",
        age: Number(flat.age ?? 0),
        address: flat.address ?? "",
        role: flat.role ?? "",
        experience: flat.experience ?? "",
        photoUrl: mediaUrl(flat.photo),
        basePrice: Number(flat.basePrice ?? 0),
        finalPrice: flat.finalPrice == null ? undefined : Number(flat.finalPrice),
        teamId: relationId(team),
        registrationStatus: flat.registrationStatus ?? "pending",
        paymentStatus: flat.paymentStatus ?? "pending",
        auctionStatus: flat.auctionStatus ?? "pool",
        tournamentSlug: tournament?.slug ?? "",
      };
    });
    return slug ? all.filter((player) => player.tournamentSlug === slug) : all;
  }
  return [];
}

export async function getTeamPlayers(slug?: string, teamId?: string | number): Promise<TeamPlayer[]> {
  const remote =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (await fetchStrapi<any[]>(`/public-team-players${slug || teamId ? `?${new URLSearchParams({
      ...(slug ? { tournamentSlug: slug } : {}),
      ...(teamId ? { team: String(teamId) } : {}),
    }).toString()}` : ""}`)) ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (await fetchStrapi<any[]>("/team-players?populate=team,player,player.photo,tournament&sort=assignedAt:desc&pagination[pageSize]=1000"));
  if (remote?.length) {
    const all = remote.map((item): TeamPlayer => {
      const flat = flatten(item);
      const team = flattenRelation(flat.team);
      const tournament = flattenRelation(flat.tournament);
      const player = flattenRelation(flat.player);

      return {
        id: flat.id,
        teamId: relationId(team) ?? 0,
        tournamentSlug: tournament?.slug ?? "",
        player: {
          id: player?.id ?? 0,
          name: player?.name ?? "",
          phone: player?.phone ?? "",
          email: player?.email ?? "",
          age: Number(player?.age ?? 0),
          address: player?.address ?? "",
          role: player?.role ?? "",
          experience: player?.experience ?? "",
          photoUrl: mediaUrl(player?.photo),
          basePrice: Number(player?.basePrice ?? 0),
          finalPrice: Number(flat.price ?? player?.finalPrice ?? player?.basePrice ?? 0),
          teamId: relationId(team),
          registrationStatus: player?.registrationStatus ?? "approved",
          paymentStatus: player?.paymentStatus ?? "pending",
          auctionStatus: player?.auctionStatus ?? "sold",
          tournamentSlug: tournament?.slug ?? "",
        },
        price: Number(flat.price ?? 0),
        source: flat.source ?? "manual_override",
        assignedAt: flat.assignedAt ?? undefined,
      };
    });
    return all.filter((item) => (!slug || item.tournamentSlug === slug) && (!teamId || String(item.teamId) === String(teamId)));
  }

  const dynamicPlayers = await getPlayers(slug);
  return dynamicPlayers
    .filter((player) => !teamId || String(player.teamId) === String(teamId))
    .map((player) => ({
      id: player.id,
      teamId: player.teamId ?? 0,
      tournamentSlug: player.tournamentSlug,
      player,
      price: player.finalPrice ?? player.basePrice,
      source: "manual_override",
    }));
}

export async function getRegistrations(slug?: string) {
  let remote: any[] | null = null;
  const isClient = typeof window !== "undefined";

  if (isClient) {
    try {
      const response = await fetch(`/api/registrations${slug ? `?tournamentSlug=${encodeURIComponent(slug)}` : ""}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const payload = await response.json();
        remote = payload.data || [];
      }
    } catch (err) {
      console.warn("Client failed to fetch registrations from Next.js route, falling back to direct Strapi fetch:", err);
    }
  }

  if (remote == null) {
    remote =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (await fetchStrapi<any[]>(`/public-registrations${slug ? `?tournamentSlug=${encodeURIComponent(slug)}` : ""}`)) ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (await fetchStrapi<any[]>("/registrations?populate=tournament&sort=createdAt:desc&pagination[pageSize]=100"));
  }

  if (remote?.length) {
    const all = remote.map((item): Registration => {
      const flat = flatten(item);
      const tournament = flattenRelation(flat.tournament);
      const player = flattenRelation(flat.player);
      const teamPlayer = Array.isArray(player?.teamPlayers?.data)
        ? flattenRelation(player.teamPlayers.data[0])
        : Array.isArray(player?.teamPlayers)
          ? player.teamPlayers[0]
          : undefined;
      const team = flattenRelation(teamPlayer?.team);
      return {
        id: player?.id ?? flat.id,
        documentId: flat.documentId,
        name: player?.name ?? flat.name,
        phone: player?.phone ?? flat.phone,
        email: player?.email ?? flat.email ?? "",
        age: Number(player?.age ?? flat.age ?? 0),
        address: player?.address ?? flat.address ?? "",
        role: player?.role ?? flat.role ?? "",
        experience: player?.experience ?? flat.experience ?? "",
        photoUrl: mediaUrl(player?.photo ?? flat.photo),
        basePrice: Number(player?.basePrice ?? flat.basePrice ?? 0),
        finalPrice: teamPlayer?.price == null ? undefined : Number(teamPlayer.price),
        teamId: relationId(team),
        registrationStatus: flat.registrationStatus ?? "pending",
        paymentStatus: flat.paymentStatus ?? "pending",
        auctionStatus: player?.auctionStatus ?? "pool",
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
  return [];
}

export async function getTournamentRelationId(slug: string) {
  const tournament = await getTournamentBySlug(slug);
  return tournament ? relationId(tournament) ?? tournament.id : undefined;
}

export async function getAuctions(slug?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const remote = await fetchStrapi<any[]>("/public-auctions");
  if (!remote?.length) return [];

  const all = remote.map((item): Auction => {
    const flat = flatten(item);
    const tournament = flattenRelation(flat.tournament);
    const player = flattenRelation(flat.player);

    return {
      id: flat.id,
      tournamentSlug: tournament?.slug ?? "",
      displayStatus: flat.displayStatus ?? "live",
      player: player ? {
        id: player.id,
        name: player.name,
        phone: player.phone ?? "",
        email: player.email ?? "",
        age: Number(player.age ?? 0),
        address: player.address ?? "",
        photoUrl: mediaUrl(player.photo),
        basePrice: Number(player.basePrice ?? 0),
        role: player.role ?? "",
        experience: player.experience ?? "",
        registrationStatus: player.registrationStatus ?? "approved",
        paymentStatus: player.paymentStatus ?? "paid",
        auctionStatus: player.auctionStatus ?? "pool",
        tournamentSlug: tournament?.slug ?? "",
      } : undefined,
    };
  });

  return slug ? all.filter((auction) => auction.tournamentSlug === slug) : all;
}

export async function getDashboardStats() {
  const [tournaments, teams, registrations, players] = await Promise.all([
    getTournaments(),
    getTeams(),
    getRegistrations(),
    getPlayers(),
  ]);

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

export async function getSponsors(slug?: string): Promise<Sponsor[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const remote = await fetchStrapi<any[]>("/public-sponsors?sort=tier:asc");
  if (!remote?.length) return [];

  const all = remote.map((item): Sponsor => {
    const flat = flatten(item);
    const tournament = flattenRelation(flat.tournament);
    return {
      id: flat.id,
      name: flat.name,
      logoUrl: mediaUrl(flat.logo),
      website: flat.website ?? undefined,
      tier: flat.tier ?? "partner",
      tournamentSlug: tournament?.slug ?? undefined,
      isActive: Boolean(flat.is_active),
    };
  });

  return slug ? all.filter((s) => s.tournamentSlug === slug) : all;
}
