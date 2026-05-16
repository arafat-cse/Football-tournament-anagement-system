import { getRegistrations } from "@/data/tournament/api";
import { PhotoCardDashboard } from "@/components/sports/admin/photo-card-dashboard";

export default async function PhotoCardPage() {
  const registrations = await getRegistrations();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-black">Photo Card Generator</h1>
        <p className="mt-1 text-slate-500">Search and generate professional player cards for social media sharing.</p>
      </div>

      <PhotoCardDashboard initialRegistrations={registrations} />
    </div>
  );
}
