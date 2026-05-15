import { StatusBadge } from "@/components/sports/status-badge";
import { getPlayers, getTeams } from "@/data/tournament/api";

export default async function DashboardAuctionPage() {
  const [players, teams] = await Promise.all([getPlayers(), getTeams()]);
  const teamName = (id?: number) => teams.find((team) => team.id === id)?.name ?? "Open";
  return (
    <div>
      <h1 className="font-heading text-3xl font-black">Auction control</h1>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {players.filter((item) => item.registrationStatus === "approved").map((player) => (
          <div key={player.id} className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="font-heading text-xl font-black">{player.name}</h2><p className="text-sm text-slate-500">{player.role} · Base ৳{player.basePrice.toLocaleString()}</p></div>
              <StatusBadge value={player.auctionStatus} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="rounded-md bg-slate-50 px-3 py-2">Current team: <b>{teamName(player.teamId)}</b></span>
              <span className="rounded-md bg-emerald-50 px-3 py-2">Final: <b>৳{(player.finalPrice ?? 0).toLocaleString()}</b></span>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Finalize sale</button>
              <button className="rounded-md border px-4 py-2 text-sm font-bold">Mark unsold</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
