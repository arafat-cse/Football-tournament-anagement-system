import Link from "next/link";
import { notFound } from "next/navigation";
import { FileDown } from "lucide-react";
import { getTeam, getTeamPlayers } from "@/data/tournament/api";
import { formatDate } from "@/lib/utils";

export default async function TeamDetailPage({ params }: { params: Promise<{ slug: string; teamId: string }> }) {
  const { slug, teamId } = await params;
  const [team, squad] = await Promise.all([getTeam(teamId, slug), getTeamPlayers(slug, teamId)]);
  if (!team) notFound();

  return (
    <section className="container py-10">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="mb-4 grid size-14 place-items-center overflow-hidden rounded-md border bg-slate-50" style={{ backgroundColor: team.logoUrl ? undefined : team.jerseyColor }}>
              {team.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={team.logoUrl} alt={`${team.name} logo`} className="h-full w-full object-cover" />
              ) : null}
            </span>
            <h1 className="font-heading text-4xl font-black">{team.name}</h1>
          </div>
          <a className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white" href={`/api/exports/team-squad?tournamentSlug=${slug}&team=${team.id}`}>
            <FileDown className="size-4" /> Download team PDF
          </a>
        </div>
        <p className="mt-2 text-slate-600">Owner: {team.ownerName} - {team.ownerPhone}</p>
        <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-md bg-slate-50 p-3">Budget <b className="block">BDT {team.budget.toLocaleString()}</b></div>
          <div className="rounded-md bg-slate-50 p-3">Spent <b className="block">BDT {team.spent.toLocaleString()}</b></div>
          <div className="rounded-md bg-emerald-50 p-3">Remaining <b className="block">BDT {(team.budget - team.spent).toLocaleString()}</b></div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-black">Assigned players</h2>
          <p className="mt-1 text-sm text-slate-600">{team.name} assigned player details list.</p>
        </div>
        <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">{squad.length} players</span>
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Photo</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Assigned by</th><th className="px-4 py-3">Assigned at</th></tr>
          </thead>
          <tbody>
            {squad.map((item) => (
              <tr key={item.id} className="border-b bg-white">
                <td className="px-4 py-3">
                  <span className="grid size-10 place-items-center overflow-hidden rounded-md border bg-slate-50 text-xs font-black text-slate-400">
                    {item.player.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.player.photoUrl} alt={`${item.player.name} photo`} className="h-full w-full object-cover" />
                    ) : (
                      item.player.name.slice(0, 1).toUpperCase()
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">{item.player.name}</td>
                <td className="px-4 py-3 text-slate-600">{item.player.role}</td>
                <td className="px-4 py-3 text-slate-600">{item.player.phone}</td>
                <td className="px-4 py-3 text-slate-600">BDT {item.price.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600">{item.source === "manual_override" ? "Admin" : "Auction"}</td>
                <td className="px-4 py-3 text-slate-600">{item.assignedAt ? formatDate(item.assignedAt) : "-"}</td>
              </tr>
            ))}
            {!squad.length ? (
              <tr className="border-b bg-white">
                <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>No players assigned to this team yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
