import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/sports/status-badge";
import { getPlayers, getTeams, getTournaments } from "@/data/tournament/api";

export default async function DashboardTournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournaments = await getTournaments();
  const tournament = tournaments.find((item) => String(item.id) === id);
  if (!tournament) notFound();
  const [teams, players] = await Promise.all([getTeams(tournament.slug), getPlayers(tournament.slug)]);
  return (
    <div>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <StatusBadge value={tournament.status} />
        <h1 className="mt-3 font-heading text-3xl font-black">{tournament.name}</h1>
        <p className="mt-2 text-slate-600">{tournament.location} · {tournament.sportType}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-md bg-slate-50 p-3 text-sm">Teams <b className="block text-xl">{teams.length}</b></div>
          <div className="rounded-md bg-slate-50 p-3 text-sm">Players <b className="block text-xl">{players.length}</b></div>
          <div className="rounded-md bg-slate-50 p-3 text-sm">Fee <b className="block text-xl">৳{tournament.registrationFee}</b></div>
          <div className="rounded-md bg-slate-50 p-3 text-sm">Sold <b className="block text-xl">{players.filter((item) => item.auctionStatus === "sold").length}</b></div>
        </div>
      </div>
    </div>
  );
}
