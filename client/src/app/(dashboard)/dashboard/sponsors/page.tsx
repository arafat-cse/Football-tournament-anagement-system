import { getSponsors } from "@/data/tournament/api";
import { Award } from "lucide-react";
import { SponsorsDashboardClient } from "@/components/sports/admin/sponsors-dashboard-client";

export default async function SponsorsListPage() {
  const sponsors = await getSponsors();

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-black sm:text-4xl">Sponsors Management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage tournament partners, website links, tiers, and active status.</p>
        </div>
        <div className="inline-flex h-11 items-center rounded-md border bg-white px-4 text-sm font-bold text-slate-600 shadow-sm">
          Total Sponsors: <span className="ml-2 text-emerald-600 font-extrabold">{sponsors.length}</span>
        </div>
      </div>

      <SponsorsDashboardClient initialSponsors={sponsors} />
    </div>
  );
}
