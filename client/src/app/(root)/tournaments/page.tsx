import { connection } from "next/server";
import { TournamentCard } from "@/components/sports/cards";
import { getTournaments } from "@/data/tournament/api";

export default async function TournamentsPage() {
  await connection();
  const tournaments = await getTournaments();
  return (
    <section className="container py-10">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-emerald-700">Tournament directory</p>
        <h1 className="font-heading text-4xl font-black">Tournaments</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {tournaments.map((tournament) => <TournamentCard key={tournament.id} tournament={tournament} />)}
      </div>
    </section>
  );
}
