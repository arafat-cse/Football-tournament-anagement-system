import { AuctionControlPanel } from "@/components/sports/admin/auction-control-panel";
import { AuctionPlayerList } from "@/components/sports/admin/auction-player-list";
import { getAuctions, getPlayers, getTeams, getTournaments } from "@/data/tournament/api";

export default async function DashboardAuctionPage() {
  const [players, teams, tournaments, auctions] = await Promise.all([getPlayers(), getTeams(), getTournaments(), getAuctions()]);

  return (
    <div>
      <h1 className="font-heading text-3xl font-black">Auction control</h1>
      <AuctionControlPanel tournaments={tournaments} teams={teams} players={players} auctions={auctions} />
      <AuctionPlayerList players={players} teams={teams} />
    </div>
  );
}
