"use client";

import React, { useState, useTransition } from "react";
import { Edit3, Loader2, Save, X, Globe, ToggleLeft, ToggleRight, Megaphone, Link } from "lucide-react";
import type { Sponsor } from "@/data/tournament/types";
import { useRouter } from "next/navigation";

export function SponsorsDashboardClient({ initialSponsors }: { initialSponsors: Sponsor[] }) {
  const router = useRouter();
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [isPending, startTransition] = useTransition();
  const [togglePendingId, setTogglePendingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Edit form states
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [tier, setTier] = useState<"title" | "gold" | "silver" | "partner">("partner");
  const [isActive, setIsActive] = useState(true);

  const openEdit = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setName(sponsor.name);
    setWebsite(sponsor.website || "");
    setTier(sponsor.tier);
    setIsActive(sponsor.isActive ?? true);
    setError("");
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSponsor) return;

    setError("");
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/sponsors/${selectedSponsor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            website,
            tier,
            is_active: isActive // Strapi expects is_active
          })
        });

        if (!response.ok) {
          throw new Error("Failed to update sponsor details.");
        }

        setSelectedSponsor(null);
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      }
    });
  };

  const toggleStatus = (sponsor: Sponsor) => {
    setTogglePendingId(sponsor.id);
    const targetStatus = !(sponsor.isActive ?? true);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/sponsors/${sponsor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            is_active: targetStatus
          })
        });

        if (!response.ok) {
          throw new Error("Failed to toggle sponsor status.");
        }

        router.refresh();
      } catch (err) {
        console.error(err);
      } finally {
        setTogglePendingId(null);
      }
    });
  };

  const getTierColor = (t: string) => {
    switch (t) {
      case "title": return "bg-purple-100 text-purple-800 border-purple-200";
      case "gold": return "bg-amber-100 text-amber-800 border-amber-200";
      case "silver": return "bg-slate-100 text-slate-800 border-slate-200";
      default: return "bg-emerald-50 text-emerald-800 border-emerald-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {initialSponsors.map((sponsor) => (
          <div key={sponsor.id} className="relative rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {sponsor.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sponsor.logoUrl} alt={sponsor.name} className="size-12 rounded-lg object-contain border p-1 bg-slate-50" />
                ) : (
                  <div className="grid size-12 place-items-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Megaphone className="size-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-heading text-base font-black text-slate-900 truncate max-w-44">{sponsor.name}</h3>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide mt-1 ${getTierColor(sponsor.tier)}`}>
                    {sponsor.tier}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => openEdit(sponsor)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-slate-500 hover:bg-slate-50 transition cursor-pointer"
              >
                <Edit3 className="size-3.5" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Globe className="size-3.5" />
                {sponsor.website ? (
                  <a href={sponsor.website} target="_blank" className="font-semibold text-emerald-600 hover:underline truncate max-w-40">
                    Visit Website
                  </a>
                ) : (
                  <span>No Website</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">
                  {sponsor.isActive ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => toggleStatus(sponsor)}
                  disabled={togglePendingId === sponsor.id}
                  className="focus:outline-none transition active:scale-95 cursor-pointer"
                >
                  {togglePendingId === sponsor.id ? (
                    <Loader2 className="size-6 animate-spin text-emerald-600" />
                  ) : sponsor.isActive ? (
                    <ToggleRight className="size-6 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="size-6 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
        {initialSponsors.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed bg-white py-12 text-center text-slate-400">
            No sponsors registered yet.
          </div>
        )}
      </div>

      {/* Edit Form Modal */}
      {selectedSponsor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedSponsor(null)} />
          <form 
            onSubmit={handleUpdate}
            className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="font-heading text-xl font-black">Edit Sponsor</h2>
              <button 
                type="button"
                onClick={() => setSelectedSponsor(null)} 
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Sponsor Name</label>
                <input
                  type="text"
                  required
                  className="mt-1.5 h-11 w-full rounded-lg border bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/20"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Website URL</label>
                <input
                  type="url"
                  className="mt-1.5 h-11 w-full rounded-lg border bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/20"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Sponsor Tier</label>
                  <select
                    className="mt-1.5 h-11 w-full rounded-lg border bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/20"
                    value={tier}
                    onChange={(e: any) => setTier(e.target.value)}
                  >
                    <option value="title">Title Partner</option>
                    <option value="gold">Gold Sponsor</option>
                    <option value="silver">Silver Sponsor</option>
                    <option value="partner">General Partner</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500 block">Sponsor Status</label>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className="mt-1.5 h-11 w-full rounded-lg border flex items-center justify-between px-4 bg-slate-50 text-sm font-semibold hover:bg-slate-100 transition cursor-pointer"
                  >
                    <span>{isActive ? "Active" : "Inactive"}</span>
                    {isActive ? <ToggleRight className="size-6 text-emerald-600" /> : <ToggleLeft className="size-6 text-slate-400" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-semibold">
                  {error}
                </p>
              )}
            </div>

            <div className="p-6 border-t flex items-center justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setSelectedSponsor(null)}
                className="h-11 px-5 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="h-11 px-5 rounded-lg bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
