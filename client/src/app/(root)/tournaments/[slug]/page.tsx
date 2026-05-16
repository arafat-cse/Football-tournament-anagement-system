import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Gavel, MapPin, Users } from "lucide-react";
import { TeamCard } from "@/components/sports/cards";
import { StatusBadge } from "@/components/sports/status-badge";
import { getPlayers, getTeams, getTournamentBySlug } from "@/data/tournament/api";
import { formatDate } from "@/lib/utils";

export default async function TournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) notFound();
  const [teams, players] = await Promise.all([getTeams(slug), getPlayers(slug)]);
  const approvedPlayers = players.filter((player) => player.registrationStatus === "approved");
  const sold = approvedPlayers.filter((player) => player.auctionStatus === "sold").length;

  return (
    <div>
      <section className="bg-slate-950 text-white">
        <div className="container py-12">
          <StatusBadge value={tournament.status} />
          <h1 className="mt-4 font-heading text-5xl font-black">{tournament.name}</h1>
          <div className="mt-6 grid gap-3 text-sm text-slate-200 md:grid-cols-4">
            <span className="flex items-center gap-2"><MapPin className="size-4" /> {tournament.location}</span>
            <span className="flex items-center gap-2"><CalendarDays className="size-4" /> {formatDate(tournament.startDate)}</span>
            <span className="flex items-center gap-2"><Users className="size-4" /> {approvedPlayers.length} approved players</span>
            <span className="flex items-center gap-2"><Gavel className="size-4" /> {sold} sold players</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {tournament.status === "registration_open" ? (
              <Link className="rounded-md bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-600" href={`/tournaments/${slug}/register`}>
                Register player
              </Link>
            ) : (
              <div className="flex items-center gap-2 rounded-md bg-slate-800 px-5 py-3 text-sm font-bold text-slate-400 ring-1 ring-slate-700">
                <span className="size-2 animate-pulse rounded-full bg-red-500" />
                Registration closed
              </div>
            )}
            <Link className="rounded-md border border-white/30 px-5 py-3 text-sm font-bold transition hover:bg-white/10" href={`/tournaments/${slug}/players`}>Register Player List</Link>
            <Link className="rounded-md border border-white/30 px-5 py-3 text-sm font-bold transition hover:bg-white/10" href={`/tournaments/${slug}/teams`}>Teams</Link>
          </div>
        </div>
      </section>
      <section className="container grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="font-heading text-2xl font-black">Teams</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {teams.map((team) => <TeamCard key={team.id} team={team} slug={slug} />)}
          </div>
        </div>
        <aside className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="font-heading text-xl font-black">Rules</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{tournament.rules}</p>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between"><dt>Registration fee</dt><dd className="font-bold">৳{tournament.registrationFee}</dd></div>
            <div className="flex justify-between"><dt>Auction date</dt><dd className="font-bold">{formatDate(tournament.auctionDate)}</dd></div>
          </dl>
        </aside>
      </section>
    </div>
  );
}
