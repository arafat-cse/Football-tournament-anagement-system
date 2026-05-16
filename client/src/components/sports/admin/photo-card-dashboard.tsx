"use client";

import React, { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { PlayerCardPreview, type CardData } from "../player-card";
import type { Registration } from "@/data/tournament/types";

export function PhotoCardDashboard({ initialRegistrations }: { initialRegistrations: Registration[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Registration | null>(null);

  const filtered = initialRegistrations.filter(
    (r) => 
      r.name.toLowerCase().includes(search.toLowerCase()) || 
      r.phone.includes(search)
  ).slice(0, 5);

  const card: CardData | null = selected ? {
    name: selected.name,
    role: selected.role,
    age: String(selected.age),
    tournamentName: selected.tournamentSlug === "tournament" ? "Official Tournament" : selected.tournamentSlug.replace(/-/g, " ").toUpperCase(),
    photoUrl: selected.photoUrl || "",
  } : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
      <div className="flex flex-col gap-6">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Search Player</label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Name or phone number..."
              className="h-11 w-full rounded-md border bg-slate-50 pl-10 pr-4 text-sm outline-none ring-emerald-600/20 focus:ring-4"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Search Results</p>
            {search.length > 0 ? (
              filtered.length > 0 ? (
                filtered.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={`flex w-full items-center gap-3 rounded-md border p-3 text-left transition-all ${
                      selected?.id === r.id ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600" : "bg-white hover:border-emerald-200"
                    }`}
                  >
                    <div className="grid size-10 place-items-center rounded-full bg-slate-100 text-xs font-bold uppercase text-slate-500">
                      {r.name.slice(0, 2)}
                    </div>
                    <div>
                      <b className="block text-sm text-slate-900">{r.name}</b>
                      <span className="text-xs text-slate-500">{r.phone}</span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="py-4 text-center text-xs text-slate-400">No players found</p>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                <UserPlus className="mb-2 size-6 opacity-20" />
                <p className="text-xs">Type to search for a registered player</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-amber-100 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-bold">Instructions</p>
          <ul className="mt-2 list-inside list-disc space-y-1 opacity-80">
            <li>Search by full name or phone number</li>
            <li>Select the player to view their card</li>
            <li>Download or share directly for social media</li>
          </ul>
        </div>
      </div>

      <div className="min-h-[500px]">
        {card ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PlayerCardPreview 
              card={card} 
              title="Player Card Generated" 
              subtitle="This card was generated from the official registration records." 
            />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50 text-slate-400">
            <p className="font-medium">No player selected</p>
            <p className="text-xs">Search and select a player from the left panel</p>
          </div>
        )}
      </div>
    </div>
  );
}
