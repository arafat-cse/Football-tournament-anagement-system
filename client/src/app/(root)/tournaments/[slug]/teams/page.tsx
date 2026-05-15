import { TeamCard } from "@/components/sports/cards";
import { getTeams } from "@/data/tournament/api";

export default async function TeamsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const teams = await getTeams(slug);
  return (
    <section className="container py-10">
      <h1 className="font-heading text-4xl font-black">Teams</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => <TeamCard key={team.id} team={team} slug={slug} />)}
      </div>
    </section>
  );
}
