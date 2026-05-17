"use client";

import React, { useState } from "react";
import { Search, UserCheck, ShieldAlert, Award, FileSpreadsheet, Eye } from "lucide-react";
import type { Player } from "@/data/tournament/types";
import { StatusBadge } from "@/components/sports/status-badge";
import Link from "next/link";

export function PlayersDashboardClient({ initialPlayers }: { initialPlayers: Player[] }) {
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");

  const roles = ["All", "Forward", "Midfielder", "Defender", "Goalkeeper"];

  const filteredPlayers = initialPlayers.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(search.toLowerCase()) ||
      player.phone.includes(search) ||
      (player.email && player.email.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = selectedRole === "All" || player.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            className="h-11 w-full rounded-lg border bg-slate-50 pl-10 pr-4 text-sm outline-none ring-emerald-600/20 transition focus:border-emerald-600 focus:bg-white focus:ring-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="h-11 rounded-lg border bg-white px-3 text-sm outline-none ring-emerald-600/20 focus:border-emerald-600 focus:ring-4"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r === "All" ? "All Positions" : r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Layout for Mobile and Table for Desktop */}
      <div className="grid gap-4 md:hidden">
        {filteredPlayers.map((player) => (
          <div key={player.id} className="rounded-xl border bg-white p-4 shadow-sm hover:border-emerald-100 transition-all">
            <div className="flex items-center gap-3">
              {player.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={player.photoUrl} alt={player.name} className="size-12 rounded-full object-cover ring-2 ring-emerald-500/20" />
              ) : (
                <div className="grid size-12 place-items-center rounded-full bg-slate-100 text-sm font-bold uppercase text-slate-500">
                  {player.name.slice(0, 2)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-heading text-base font-black">{player.name}</h3>
                <p className="text-xs font-semibold text-emerald-600">{player.role}</p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-3 text-xs text-slate-600">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Phone</span>
                <span className="font-bold text-slate-800">{player.phone}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Base Price</span>
                <span className="font-bold text-slate-800">৳{player.basePrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <StatusBadge value={player.registrationStatus} />
              <Link 
                href="/dashboard/photo-card"
                className="inline-flex h-8 items-center gap-1 rounded-md bg-emerald-50 px-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
              >
                <Award className="size-3.5" /> Card
              </Link>
            </div>
          </div>
        ))}
        {filteredPlayers.length === 0 && (
          <div className="rounded-xl border border-dashed bg-white py-12 text-center text-slate-400">
            No players match the search criteria.
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-xl border bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Role/Position</th>
                <th className="px-6 py-4">Base Price</th>
                <th className="px-6 py-4">Auction Status</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPlayers.map((player) => (
                <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {player.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={player.photoUrl} alt={player.name} className="size-10 rounded-full object-cover ring-2 ring-emerald-500/20" />
                      ) : (
                        <div className="grid size-10 place-items-center rounded-full bg-slate-100 text-xs font-bold uppercase text-slate-500">
                          {player.name.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <b className="font-heading text-sm font-black text-slate-900">{player.name}</b>
                        <span className="block text-xs text-slate-400">{player.email || "No Email"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{player.phone}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      {player.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">৳{player.basePrice.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      player.auctionStatus === "sold" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-700"
                    }`}>
                      {player.auctionStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge value={player.registrationStatus} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href="/dashboard/photo-card"
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Generate Player Card"
                      >
                        <Award className="size-3.5" /> Card
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPlayers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No players found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
