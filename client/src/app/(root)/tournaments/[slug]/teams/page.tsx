import Link from "next/link";
import { connection } from "next/server";
import { FileDown } from "lucide-react";
import { TeamCard } from "@/components/sports/cards";
import { TeamRegistrationForm } from "@/components/sports/team-registration-form";
import { getTeams, getTournamentBySlug } from "@/data/tournament/api";
import { notFound } from "next/navigation";

export default async function TeamsPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const [tournament, teams] = await Promise.all([getTournamentBySlug(slug), getTeams(slug)]);
  if (!tournament) notFound();
  return (
    <section className="container py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-4xl font-black">Teams</h1>
        <a className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white" href={`/api/exports/team-squad?tournamentSlug=${slug}`}>
          <FileDown className="size-4" /> Download team list PDF
        </a>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => <TeamCard key={team.id} team={team} slug={slug} />)}
      </div>
      {tournament.status === "registration_open" ? (
        <TeamRegistrationForm tournamentId={tournament.id} />
      ) : (
        <div className="mt-10 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
          <p className="font-heading text-lg font-bold text-slate-500">Team registration is currently closed for this tournament.</p>
        </div>
      )}
    </section>
  );
}
