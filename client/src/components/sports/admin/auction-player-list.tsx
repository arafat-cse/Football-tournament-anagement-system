"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { StatusBadge } from "@/components/sports/status-badge";
import type { Player, Team } from "@/data/tournament/types";

const inputClass = "h-11 rounded-md border bg-white px-3 text-sm outline-none ring-emerald-600/20 focus:ring-4";

export function AuctionPlayerList({ players, teams }: { players: Player[]; teams: Team[] }) {
  const [query, setQuery] = useState("");

  const teamName = (id?: number) => teams.find((team) => team.id === id)?.name ?? "Open";
  const auctionPlayers = players.filter((item) => item.registrationStatus === "approved" && item.paymentStatus === "paid");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredPlayers = normalizedQuery
    ? auctionPlayers.filter((player) =>
        [player.name, player.role, player.phone, player.email, player.auctionStatus, player.tournamentSlug, teamName(player.teamId)]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery))
      )
    : auctionPlayers;

  return (
    <section className="mt-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="font-heading text-xl font-black">Auction player list</h2>
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            className={`${inputClass} w-full pl-9`}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search player, team, status"
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredPlayers.map((player) => (
          <div key={player.id} className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-heading text-xl font-black">{player.name}</h3>
                <p className="text-sm text-slate-500">{player.role} - Base Tk {player.basePrice.toLocaleString()}</p>
              </div>
              <StatusBadge value={player.auctionStatus} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="rounded-md bg-slate-50 px-3 py-2">Current team: <b>{teamName(player.teamId)}</b></span>
              <span className="rounded-md bg-emerald-50 px-3 py-2">Final: <b>Tk {(player.finalPrice ?? 0).toLocaleString()}</b></span>
              <span className="rounded-md bg-amber-50 px-3 py-2">Tournament: <b>{player.tournamentSlug || "-"}</b></span>
            </div>
          </div>
        ))}

        {!filteredPlayers.length ? (
          <p className="rounded-md border border-dashed p-4 text-sm font-semibold text-slate-500 xl:col-span-2">No players found.</p>
        ) : null}
      </div>
    </section>
  );
}
