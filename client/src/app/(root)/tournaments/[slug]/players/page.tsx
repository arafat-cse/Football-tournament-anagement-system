import { connection } from "next/server";
import { FileSpreadsheet } from "lucide-react";
import { PlayerRow } from "@/components/sports/cards";
import { getRegistrations, getTeams } from "@/data/tournament/api";

export default async function PlayersPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const [registrations, teams] = await Promise.all([getRegistrations(slug), getTeams(slug)]);
  const approvedRegistrations = registrations.filter((registration) => registration.registrationStatus === "approved");
  const teamName = (id?: number) => teams.find((team) => team.id === id)?.name;
  return (
    <section className="container py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-black">Register Player List</h1>
          <p className="mt-2 text-sm text-slate-600">Only admin approved player registrations show here.</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <a className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white" href={`/api/exports/registrations?tournamentSlug=${slug}`}>
            <FileSpreadsheet className="size-4" /> Download Excel
          </a>
          <div className="rounded-md border bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm">
            Total registrations: <span className="text-lg font-black text-emerald-700">{registrations.length}</span>
          </div>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Base</th><th className="px-4 py-3">Registration</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Auction</th><th className="px-4 py-3">Team</th><th className="px-4 py-3">Action</th></tr>
          </thead>
          <tbody>
            {approvedRegistrations.map((registration) => (
              <PlayerRow
                key={registration.id}
                player={registration}
                teamName={teamName(registration.teamId)}
                detailsHref={`/tournaments/${slug}/players/${registration.id}`}
              />
            ))}
            {!approvedRegistrations.length ? (
              <tr className="border-b bg-white">
                <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>No approved registrations yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
