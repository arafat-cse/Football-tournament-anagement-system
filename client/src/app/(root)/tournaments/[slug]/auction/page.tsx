import { getAuctions, getPlayers, getTeams } from "@/data/tournament/api";
import { StatusBadge } from "@/components/sports/status-badge";

export default async function AuctionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [auctions, players, teams] = await Promise.all([getAuctions(slug), getPlayers(slug), getTeams(slug)]);
  const auction = auctions[0];
  const teamName = (id?: number) => teams.find((team) => team.id === id)?.name ?? "Auction pool";
  return (
    <section className="container py-10">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-emerald-700">Auction room</p>
          <h1 className="font-heading text-4xl font-black">{auction?.title ?? "Auction results"}</h1>
        </div>
        {auction ? <StatusBadge value={auction.status} /> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {players.filter((player) => player.registrationStatus === "approved").map((player) => (
          <div key={player.id} className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-lg font-black">{player.name}</h3>
                <p className="text-sm text-slate-500">{player.role}</p>
              </div>
              <StatusBadge value={player.auctionStatus} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-slate-50 p-3">Base <b className="block">৳{player.basePrice.toLocaleString()}</b></div>
              <div className="rounded-md bg-emerald-50 p-3">Final <b className="block">৳{(player.finalPrice ?? 0).toLocaleString()}</b></div>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-600">Team: {teamName(player.teamId)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
