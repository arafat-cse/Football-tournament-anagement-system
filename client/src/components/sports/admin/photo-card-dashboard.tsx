"use client";

import React, { useState } from "react";
import { Search, Award, ShieldAlert, Sparkles } from "lucide-react";
import { PlayerCardPreview, type CardData } from "@/components/sports/player-card";
import type { Player, Tournament } from "@/data/tournament/types";

export function PhotoCardDashboard({ initialPlayers, tournaments }: { initialPlayers: Player[]; tournaments: Tournament[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Player | null>(null);

  const filtered = initialPlayers.filter(
    (p) => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.phone.includes(search)
  ).slice(0, 5);

  const tournament = tournaments.find((t) => t.slug === selected?.tournamentSlug);

  const card: CardData | null = selected ? {
    name: selected.name,
    role: selected.role,
    age: String(selected.age),
    tournamentName: tournament ? tournament.name : (selected.tournamentSlug === "tournament" ? "Official Tournament" : selected.tournamentSlug.replace(/-/g, " ").toUpperCase()),
    photoUrl: selected.photoUrl || "",
  } : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      {/* Left Search Column */}
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Search Player</label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Enter name or phone number..."
              className="h-11 w-full rounded-lg border bg-slate-50 pl-10 pr-4 text-sm outline-none ring-emerald-600/20 transition focus:border-emerald-600 focus:bg-white focus:ring-4"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Results</p>
            {search.length > 0 ? (
              filtered.length > 0 ? (
                filtered.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all cursor-pointer ${
                      selected?.id === p.id 
                        ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600" 
                        : "bg-white hover:border-emerald-200"
                    }`}
                  >
                    {p.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.photoUrl} alt={p.name} className="size-10 rounded-full object-cover border" />
                    ) : (
                      <div className="grid size-10 place-items-center rounded-full bg-slate-100 text-xs font-bold uppercase text-slate-500">
                        {p.name.slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <b className="block truncate text-sm text-slate-900">{p.name}</b>
                      <span className="block text-xs text-slate-500">{p.phone}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
                  <ShieldAlert className="mb-2 size-5 opacity-40" />
                  <p className="text-xs">No registered player found</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                <Sparkles className="mb-2 size-6 text-slate-300 animate-pulse" />
                <p className="text-xs">Type player name or phone to get started</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 text-sm text-emerald-950">
          <p className="font-bold flex items-center gap-1.5"><Award className="size-4 text-emerald-600" /> Admin Instructions</p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-xs text-emerald-900/80">
            <li>Search player and select them.</li>
            <li>Verify details on the generated preview card.</li>
            <li>Click <b>Download Card</b> to save the high-res social media card.</li>
          </ul>
        </div>
      </div>

      {/* Right Preview Column */}
      <div className="min-h-[500px]">
        {card ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <PlayerCardPreview 
              card={card} 
              title="Player Card Generated" 
              subtitle="This official card was generated using registered player records." 
            />
          </div>
        ) : (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-slate-50 text-slate-400">
            <Award className="mb-2 size-8 opacity-20" />
            <p className="font-medium text-sm">No player selected</p>
            <p className="text-xs">Search and select a player from the left panel to preview card</p>
          </div>
        )}
      </div>
    </div>
  );
}
