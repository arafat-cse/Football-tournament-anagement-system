import { PlayerRow } from "@/components/sports/cards";
import { getPlayers, getTeams } from "@/data/tournament/api";

export default async function PlayersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [players, teams] = await Promise.all([getPlayers(slug), getTeams(slug)]);
  const teamName = (id?: number) => teams.find((team) => team.id === id)?.name;
  return (
    <section className="container py-10">
      <h1 className="font-heading text-4xl font-black">Players</h1>
      <div className="mt-6 overflow-hidden rounded-lg border">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Base</th><th className="px-4 py-3">Registration</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Auction</th><th className="px-4 py-3">Team</th></tr>
          </thead>
          <tbody>{players.map((player) => <PlayerRow key={player.id} player={player} teamName={teamName(player.teamId)} />)}</tbody>
        </table>
      </div>
    </section>
  );
}
