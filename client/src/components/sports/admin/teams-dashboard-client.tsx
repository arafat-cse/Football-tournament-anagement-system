"use client";

import React, { useState, useTransition } from "react";
import { Edit3, Eye, Loader2, Save, X, Phone, User, DollarSign, Palette, Shield } from "lucide-react";
import type { Team, Player } from "@/data/tournament/types";
import { useRouter } from "next/navigation";

export function TeamsDashboardClient({ initialTeams, players }: { initialTeams: Team[]; players: Player[] }) {
  const router = useRouter();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [viewTeam, setViewTeam] = useState<Team | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Form states for Edit mode
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [budget, setBudget] = useState(0);
  const [spent, setSpent] = useState(0);
  const [jerseyColor, setJerseyColor] = useState("#16a34a");

  const openEdit = (team: Team) => {
    setSelectedTeam(team);
    setName(team.name);
    setOwnerName(team.ownerName);
    setOwnerPhone(team.ownerPhone);
    setBudget(team.budget);
    setSpent(team.spent);
    setJerseyColor(team.jerseyColor);
    setError("");
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    setError("");
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/teams/${selectedTeam.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            ownerName,
            ownerPhone,
            budget,
            spent,
            jerseyColor
          })
        });

        if (!response.ok) {
          throw new Error("Failed to update team details.");
        }

        setSelectedTeam(null);
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      }
    });
  };

  // Find players in this team
  const getTeamRoster = (teamId: number) => {
    return players.filter(p => p.teamId === teamId);
  };

  return (
    <div className="space-y-6">
      {/* Grid view of Teams */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {initialTeams.map((team) => {
          const roster = getTeamRoster(team.id);
          const remainingBudget = team.budget - team.spent;

          return (
            <div key={team.id} className="relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all duration-200">
              {/* Colored top border based on jersey color */}
              <div className="h-2 w-full" style={{ backgroundColor: team.jerseyColor || "#10b981" }} />
              
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="grid size-12 place-items-center rounded-lg text-white"
                      style={{ backgroundColor: team.jerseyColor || "#10b981" }}
                    >
                      <Shield className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-black text-slate-900">{team.name}</h3>
                      <span className="text-xs font-semibold text-slate-500">Roster Size: {roster.length} Players</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-slate-400 shrink-0" />
                    <span>Owner: <b className="text-slate-900 font-semibold">{team.ownerName || "No Owner"}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-slate-400 shrink-0" />
                    <span>Phone: <span className="font-medium">{team.ownerPhone || "No Phone"}</span></span>
                  </div>
                  <div className="border-t pt-3 mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Budget</span>
                      <b className="text-slate-950 text-sm">৳{team.budget.toLocaleString()}</b>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Remaining</span>
                      <b className={`text-sm ${remainingBudget < 0 ? "text-red-600" : "text-emerald-600"}`}>
                        ৳{remainingBudget.toLocaleString()}
                      </b>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 border-t pt-4">
                  <button
                    onClick={() => setViewTeam(team)}
                    className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Eye className="size-3.5" /> View Roster
                  </button>
                  <button
                    onClick={() => openEdit(team)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                  >
                    <Edit3 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Roster View Modal */}
      {viewTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewTeam(null)} />
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="size-4 rounded-full" 
                  style={{ backgroundColor: viewTeam.jerseyColor }} 
                />
                <h2 className="font-heading text-2xl font-black">{viewTeam.name} Roster</h2>
              </div>
              <button 
                onClick={() => setViewTeam(null)} 
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-3 gap-4 rounded-xl bg-slate-50 p-4 text-center">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Total Budget</span>
                  <b className="text-lg text-slate-900">৳{viewTeam.budget.toLocaleString()}</b>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Spent</span>
                  <b className="text-lg text-amber-600">৳{viewTeam.spent.toLocaleString()}</b>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Roster Size</span>
                  <b className="text-lg text-emerald-600">{getTeamRoster(viewTeam.id).length} Players</b>
                </div>
              </div>

              <div>
                <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Roster Players</h4>
                <div className="divide-y rounded-xl border overflow-hidden">
                  {getTeamRoster(viewTeam.id).length > 0 ? (
                    getTeamRoster(viewTeam.id).map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-white hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          {player.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={player.photoUrl} alt={player.name} className="size-8 rounded-full object-cover" />
                          ) : (
                            <div className="grid size-8 place-items-center rounded-full bg-slate-100 text-[10px] font-bold uppercase text-slate-500">
                              {player.name.slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{player.name}</span>
                            <span className="text-xs text-emerald-600 font-semibold">{player.role}</span>
                          </div>
                        </div>
                        <span className="text-sm font-black text-slate-900">
                          ৳{(player.finalPrice || player.basePrice).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-sm text-slate-400 bg-white">
                      No players assigned to this team yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedTeam(null)} />
          <form 
            onSubmit={handleUpdate}
            className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="font-heading text-xl font-black">Edit Team Details</h2>
              <button 
                type="button"
                onClick={() => setSelectedTeam(null)} 
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Team Name</label>
                <input
                  type="text"
                  required
                  className="mt-1.5 h-11 w-full rounded-lg border bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/20"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Owner Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1.5 h-11 w-full rounded-lg border bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/20"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Owner Phone</label>
                  <input
                    type="text"
                    required
                    className="mt-1.5 h-11 w-full rounded-lg border bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/20"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Budget (৳)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="mt-1.5 h-11 w-full rounded-lg border bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/20"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Spent (৳)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="mt-1.5 h-11 w-full rounded-lg border bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/20"
                    value={spent}
                    onChange={(e) => setSpent(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                  <Palette className="size-4 text-slate-400" /> Jersey Color (Hex)
                </label>
                <div className="flex gap-3 mt-1.5 items-center">
                  <input
                    type="color"
                    className="size-11 border rounded-lg overflow-hidden shrink-0 cursor-pointer"
                    value={jerseyColor}
                    onChange={(e) => setJerseyColor(e.target.value)}
                  />
                  <input
                    type="text"
                    required
                    className="h-11 flex-1 rounded-lg border bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/20"
                    value={jerseyColor}
                    onChange={(e) => setJerseyColor(e.target.value)}
                  />
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
                onClick={() => setSelectedTeam(null)}
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
