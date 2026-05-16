import Link from "next/link";
import { FileSpreadsheet } from "lucide-react";
import { PlayerRow } from "@/components/sports/cards";
import { getRegistrations, getTeams } from "@/data/tournament/api";

export default async function PlayersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [registrations, teams] = await Promise.all([getRegistrations(slug), getTeams(slug)]);
  const teamName = (id?: number) => teams.find((team) => team.id === id)?.name;
  return (
    <section className="container py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-black">Register Player List</h1>
          <p className="mt-2 text-sm text-slate-600">Submitted registrations show here immediately. Admin approval updates the status.</p>
        </div>
        <Link className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white" href={`/api/exports/registrations?tournamentSlug=${slug}`}>
          <FileSpreadsheet className="size-4" /> Download Excel
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Base</th><th className="px-4 py-3">Registration</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Auction</th><th className="px-4 py-3">Team</th></tr>
          </thead>
          <tbody>
            {registrations.map((registration) => <PlayerRow key={registration.id} player={registration} teamName={teamName(registration.teamId)} />)}
            {!registrations.length ? (
              <tr className="border-b bg-white">
                <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>No registrations yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
