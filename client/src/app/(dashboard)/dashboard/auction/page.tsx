import { AuctionControlPanel } from "@/components/sports/admin/auction-control-panel";
import { StatusBadge } from "@/components/sports/status-badge";
import { getPlayers, getTeams, getTournaments } from "@/data/tournament/api";

export default async function DashboardAuctionPage() {
  const [players, teams, tournaments] = await Promise.all([getPlayers(), getTeams(), getTournaments()]);
  const teamName = (id?: number) => teams.find((team) => team.id === id)?.name ?? "Open";
  const auctionPlayers = players.filter((item) => item.registrationStatus === "approved" && item.paymentStatus === "paid");

  return (
    <div>
      <h1 className="font-heading text-3xl font-black">Auction control</h1>
      <AuctionControlPanel tournaments={tournaments} teams={teams} players={players} />

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {auctionPlayers.map((player) => (
          <div key={player.id} className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl font-black">{player.name}</h2>
                <p className="text-sm text-slate-500">{player.role} - Base Tk {player.basePrice.toLocaleString()}</p>
              </div>
              <StatusBadge value={player.auctionStatus} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="rounded-md bg-slate-50 px-3 py-2">Current team: <b>{teamName(player.teamId)}</b></span>
              <span className="rounded-md bg-emerald-50 px-3 py-2">Final: <b>Tk {(player.finalPrice ?? 0).toLocaleString()}</b></span>
              <span className="rounded-md bg-amber-50 px-3 py-2">Tournament: <b>{player.tournamentSlug || "-"}</b></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
