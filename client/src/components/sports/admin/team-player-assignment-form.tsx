"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import type { Player, Team, Tournament } from "@/data/tournament/types";

const inputClass = "h-11 rounded-md border bg-white px-3 text-sm outline-none ring-emerald-600/20 focus:ring-4";

export function TeamPlayerAssignmentForm({
  tournaments,
  teams,
  players,
}: {
  tournaments: Tournament[];
  teams: Team[];
  players: Player[];
}) {
  const router = useRouter();
  const [tournamentId, setTournamentId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [price, setPrice] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedTournament = tournaments.find((item) => String(item.id) === tournamentId);
  const selectedPlayer = players.find((item) => String(item.id) === playerId);

  const filteredTeams = useMemo(
    () =>
      teams.filter(
        (team) =>
          selectedTournament &&
          team.tournamentSlug === selectedTournament.slug &&
          (!team.registrationStatus || team.registrationStatus === "approved")
      ),
    [selectedTournament, teams]
  );

  const filteredPlayers = useMemo(
    () =>
      players.filter(
        (player) =>
          selectedTournament &&
          player.tournamentSlug === selectedTournament.slug &&
          player.registrationStatus === "approved" &&
          player.auctionStatus !== "sold"
      ),
    [selectedTournament, players]
  );

  function updateTournament(value: string) {
    setTournamentId(value);
    setTeamId("");
    setPlayerId("");
    setPrice("");
    setMessage("");
    setError("");
  }

  function updatePlayer(value: string) {
    setPlayerId(value);
    const player = players.find((item) => String(item.id) === value);
    setPrice(player ? String(player.basePrice) : "");
    setMessage("");
    setError("");
  }

  async function submitAssignment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/admin/team-players/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tournamentId: Number(tournamentId),
        teamId: Number(teamId),
        playerId: Number(playerId),
        price: Number(price || selectedPlayer?.basePrice || 0),
      }),
    }).catch(() => null);

    setPending(false);

    if (!response) {
      setError("Assignment failed. Please make sure Next.js is running.");
      return;
    }

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error?.message ?? payload?.error ?? "Could not assign player to team.");
      return;
    }

    setMessage("Player assigned to team successfully.");
    setTeamId("");
    setPlayerId("");
    setPrice("");
    router.refresh();
  }

  return (
    <form className="mt-6 grid gap-4 rounded-lg border bg-white p-5 shadow-sm lg:grid-cols-4" onSubmit={submitAssignment}>
      <div className="lg:col-span-4">
        <h2 className="font-heading text-xl font-black">Assign player to team</h2>
        <p className="mt-1 text-sm text-slate-500">Select tournament first. Team and player lists will show only matching records.</p>
      </div>

      <select className={inputClass} value={tournamentId} onChange={(event) => updateTournament(event.currentTarget.value)} required>
        <option value="" disabled>Select tournament</option>
        {tournaments.map((tournament) => (
          <option key={tournament.id} value={tournament.id}>{tournament.name}</option>
        ))}
      </select>

      <select className={inputClass} value={teamId} onChange={(event) => setTeamId(event.currentTarget.value)} required disabled={!selectedTournament}>
        <option value="" disabled>{selectedTournament ? "Select team" : "Select tournament first"}</option>
        {filteredTeams.map((team) => (
          <option key={team.id} value={team.id}>{team.name}</option>
        ))}
      </select>

      <select className={inputClass} value={playerId} onChange={(event) => updatePlayer(event.currentTarget.value)} required disabled={!selectedTournament}>
        <option value="" disabled>{selectedTournament ? "Select player" : "Select tournament first"}</option>
        {filteredPlayers.map((player) => (
          <option key={player.id} value={player.id}>{player.name} - {player.role}</option>
        ))}
      </select>

      <input className={inputClass} value={price} onChange={(event) => setPrice(event.currentTarget.value)} type="number" min="0" placeholder="Final price" />

      {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700 lg:col-span-4">{error}</p> : null}
      {message ? <p className="rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 lg:col-span-4">{message}</p> : null}

      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 text-sm font-bold text-white disabled:opacity-60 lg:col-span-4" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        Assign player
      </button>
    </form>
  );
}
