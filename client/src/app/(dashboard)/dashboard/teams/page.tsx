import { getTeams, getPlayers } from "@/data/tournament/api";
import { Shield } from "lucide-react";
import { TeamsDashboardClient } from "@/components/sports/admin/teams-dashboard-client";

export default async function TeamsListPage() {
  const [teams, players] = await Promise.all([
    getTeams(),
    getPlayers()
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-black sm:text-4xl">Team List</h1>
          <p className="mt-1 text-sm text-slate-500">Manage tournament teams, rosters, budgets, and ownership.</p>
        </div>
        <div className="inline-flex h-11 items-center rounded-md border bg-white px-4 text-sm font-bold text-slate-600 shadow-sm">
          Total Teams: <span className="ml-2 text-emerald-600 font-extrabold">{teams.length}</span>
        </div>
      </div>

      <TeamsDashboardClient initialTeams={teams} players={players} />
    </div>
  );
}
