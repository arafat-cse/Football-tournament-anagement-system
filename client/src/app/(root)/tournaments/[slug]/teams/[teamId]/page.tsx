import { notFound } from "next/navigation";
import { PlayerRow } from "@/components/sports/cards";
import { getPlayers, getTeam } from "@/data/tournament/api";

export default async function TeamDetailPage({ params }: { params: Promise<{ slug: string; teamId: string }> }) {
  const { slug, teamId } = await params;
  const [team, players] = await Promise.all([getTeam(teamId), getPlayers(slug)]);
  if (!team) notFound();
  const squad = players.filter((player) => player.teamId === team.id);
  return (
    <section className="container py-10">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <span className="mb-4 block size-12 rounded-md border" style={{ backgroundColor: team.jerseyColor }} />
        <h1 className="font-heading text-4xl font-black">{team.name}</h1>
        <p className="mt-2 text-slate-600">Owner: {team.ownerName} · {team.ownerPhone}</p>
        <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-md bg-slate-50 p-3">Budget <b className="block">৳{team.budget.toLocaleString()}</b></div>
          <div className="rounded-md bg-slate-50 p-3">Spent <b className="block">৳{team.spent.toLocaleString()}</b></div>
          <div className="rounded-md bg-emerald-50 p-3">Remaining <b className="block">৳{(team.budget - team.spent).toLocaleString()}</b></div>
        </div>
      </div>
      <h2 className="mt-8 font-heading text-2xl font-black">Squad</h2>
      <div className="mt-4 overflow-hidden rounded-lg border">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Base</th><th className="px-4 py-3">Registration</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Auction</th><th className="px-4 py-3">Team</th></tr>
          </thead>
          <tbody>{squad.map((player) => <PlayerRow key={player.id} player={player} teamName={team.name} />)}</tbody>
        </table>
      </div>
    </section>
  );
}
