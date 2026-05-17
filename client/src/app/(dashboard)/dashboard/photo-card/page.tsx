import { getPlayers, getTournaments } from "@/data/tournament/api";
import { PhotoCardDashboard } from "@/components/sports/admin/photo-card-dashboard";

export default async function PhotoCardPage() {
  const [players, tournaments] = await Promise.all([
    getPlayers(),
    getTournaments()
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-black sm:text-4xl">Photo Card Generator</h1>
        <p className="mt-1 text-slate-500">Search and generate professional player cards for social media sharing.</p>
      </div>

      <PhotoCardDashboard initialPlayers={players} tournaments={tournaments} />
    </div>
  );
}
