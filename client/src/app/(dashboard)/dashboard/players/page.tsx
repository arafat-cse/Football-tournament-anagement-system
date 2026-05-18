import { getPlayers, getTournaments } from "@/data/tournament/api";
import { PlayersDashboardClient } from "@/components/sports/admin/players-dashboard-client";

export default async function PlayersListPage() {
  const [players, tournaments] = await Promise.all([getPlayers(), getTournaments()]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-black sm:text-4xl">Player List</h1>
          <p className="mt-1 text-sm text-slate-500">Manage all registered and approved tournament players.</p>
        </div>
        <div className="inline-flex h-11 items-center rounded-md border bg-white px-4 text-sm font-bold text-slate-600 shadow-sm">
          Total Players: <span className="ml-2 text-emerald-600 font-extrabold">{players.length}</span>
        </div>
      </div>

      <PlayersDashboardClient initialPlayers={players} tournaments={tournaments} />
    </div>
  );
}
