import { TournamentCard } from "@/components/sports/cards";
import { getTournaments } from "@/data/tournament/api";

export default async function DashboardTournamentsPage() {
  const tournaments = await getTournaments();
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-emerald-700">Admin</p>
          <h1 className="font-heading text-3xl font-black">Tournaments</h1>
        </div>
        <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Create tournament</button>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {tournaments.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} href={`/dashboard/tournaments/${tournament.id}`} />
        ))}
      </div>
    </div>
  );
}
