"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Gavel, Loader2, UserPlus } from "lucide-react";

import { StatusBadge } from "@/components/sports/status-badge";
import type { Player, Team, Tournament } from "@/data/tournament/types";

const inputClass = "h-11 rounded-md border bg-white px-3 text-sm outline-none ring-emerald-600/20 focus:ring-4 disabled:bg-slate-100 disabled:text-slate-400";

export function AuctionControlPanel({
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
  const [auctionPlayerId, setAuctionPlayerId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [assignPlayerId, setAssignPlayerId] = useState("");
  const [price, setPrice] = useState("");
  const [pendingAction, setPendingAction] = useState<"auction" | "assign" | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [assignedPlayerIds, setAssignedPlayerIds] = useState<number[]>([]);

  const selectedTournament = tournaments.find((item) => String(item.id) === tournamentId);
  const selectedAuctionPlayer = players.find((item) => String(item.id) === auctionPlayerId);
  const selectedTeam = teams.find((item) => String(item.id) === teamId);
  const selectedAssignPlayer = players.find((item) => String(item.id) === assignPlayerId);

  const auctionPlayers = useMemo(
    () =>
      players.filter(
        (player) =>
          selectedTournament &&
          player.tournamentSlug === selectedTournament.slug &&
          player.registrationStatus === "approved" &&
          player.paymentStatus === "paid" &&
          player.auctionStatus !== "sold" &&
          !player.teamId &&
          !assignedPlayerIds.includes(player.id)
      ),
    [assignedPlayerIds, players, selectedTournament]
  );

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

  function resetFeedback() {
    setMessage("");
    setError("");
  }

  function updateTournament(value: string) {
    setTournamentId(value);
    setAuctionPlayerId("");
    setTeamId("");
    setAssignPlayerId("");
    setPrice("");
    resetFeedback();
  }

  function updateAssignPlayer(value: string) {
    setAssignPlayerId(value);
    const player = players.find((item) => String(item.id) === value);
    setPrice(player ? String(player.basePrice) : "");
    resetFeedback();
  }

  async function setLiveAuction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("auction");
    resetFeedback();

    const response = await fetch("/api/admin/auctions/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tournamentId: Number(tournamentId),
        playerId: Number(auctionPlayerId),
        title: selectedTournament ? `${selectedTournament.name} Live Auction` : "Live Auction",
      }),
    }).catch(() => null);

    setPendingAction("");

    if (!response) {
      setError("Could not connect to the auction API.");
      return;
    }

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error?.message ?? payload?.error ?? "Could not set player to auction.");
      return;
    }

    setMessage(`${selectedAuctionPlayer?.name ?? "Player"} is now live in the auction.`);
    router.refresh();
  }

  async function assignPlayer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("assign");
    resetFeedback();

    const response = await fetch("/api/admin/team-players/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tournamentId: selectedTournament?.documentId ?? tournamentId,
        teamId: selectedTeam?.documentId ?? teamId,
        playerId: selectedAssignPlayer?.documentId ?? assignPlayerId,
        price: Number(price || selectedAssignPlayer?.basePrice || 0),
      }),
    }).catch(() => null);

    setPendingAction("");

    if (!response) {
      setError("Could not connect to the assignment API.");
      return;
    }

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error?.message ?? payload?.error ?? "Could not assign player to team.");
      return;
    }

    setMessage(`${selectedAssignPlayer?.name ?? "Player"} assigned successfully.`);
    setAssignedPlayerIds((current) => [...current, Number(assignPlayerId)]);
    setTeamId("");
    setAssignPlayerId("");
    setPrice("");
    router.refresh();
  }

  return (
    <div className="mt-6 grid gap-5">
      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-heading text-xl font-black">Auction setup</h2>
            <p className="mt-1 text-sm text-slate-500">Select a tournament, then choose an approved paid player for the public live auction page.</p>
          </div>
          {selectedTournament ? (
            <Link
              href={`/tournaments/${selectedTournament.slug}/auction`}
              target="_blank"
              className="inline-flex h-10 w-fit items-center gap-2 rounded-md border px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <ExternalLink className="size-4" />
              View public auction
            </Link>
          ) : null}
        </div>

        <form className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_auto]" onSubmit={setLiveAuction}>
          <select className={inputClass} value={tournamentId} onChange={(event) => updateTournament(event.currentTarget.value)} required>
            <option value="" disabled>Select tournament</option>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>{tournament.name}</option>
            ))}
          </select>

          <select className={inputClass} value={auctionPlayerId} onChange={(event) => { setAuctionPlayerId(event.currentTarget.value); resetFeedback(); }} required disabled={!selectedTournament}>
            <option value="" disabled>{selectedTournament ? "Select registered player" : "Select tournament first"}</option>
            {auctionPlayers.map((player) => (
              <option key={player.id} value={player.id}>{player.name} - {player.role} - Tk {player.basePrice.toLocaleString()}</option>
            ))}
          </select>

          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-amber-500 px-5 text-sm font-black text-slate-950 disabled:opacity-60" disabled={pendingAction === "auction"}>
            {pendingAction === "auction" ? <Loader2 className="size-4 animate-spin" /> : <Gavel className="size-4" />}
            Set to auction
          </button>
        </form>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {auctionPlayers.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => setAuctionPlayerId(String(player.id))}
              className="rounded-md border bg-slate-50 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {player.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={player.photoUrl} alt={player.name} className="size-12 shrink-0 rounded-full object-cover ring-2 ring-amber-400/30" />
                  ) : (
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-xs font-black uppercase text-slate-500 ring-1 ring-slate-200">
                      {player.name.slice(0, 2)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-heading text-lg font-black">{player.name}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{player.role || "Player"} - Tk {player.basePrice.toLocaleString()}</p>
                  </div>
                </div>
                <StatusBadge value={player.auctionStatus} />
              </div>
            </button>
          ))}
          {selectedTournament && !auctionPlayers.length ? (
            <p className="rounded-md border border-dashed p-4 text-sm font-semibold text-slate-500 md:col-span-2 xl:col-span-3">No approved paid players available for this tournament.</p>
          ) : null}
        </div>
      </section>

      <form className="grid gap-4 rounded-lg border bg-white p-5 shadow-sm lg:grid-cols-4" onSubmit={assignPlayer}>
        <div className="lg:col-span-4">
          <h2 className="font-heading text-xl font-black">Assign auction player to team</h2>
          <p className="mt-1 text-sm text-slate-500">Keep the tournament selected, then choose team and player to finalize the assignment.</p>
        </div>

        <select className={inputClass} value={teamId} onChange={(event) => { setTeamId(event.currentTarget.value); resetFeedback(); }} required disabled={!selectedTournament}>
          <option value="" disabled>{selectedTournament ? "Select team" : "Select tournament first"}</option>
          {filteredTeams.map((team) => (
            <option key={team.id} value={team.id}>{team.name} - remaining Tk {(team.budget - team.spent).toLocaleString()}</option>
          ))}
        </select>

        <select className={inputClass} value={assignPlayerId} onChange={(event) => updateAssignPlayer(event.currentTarget.value)} required disabled={!selectedTournament}>
          <option value="" disabled>{selectedTournament ? "Select player" : "Select tournament first"}</option>
          {auctionPlayers.map((player) => (
            <option key={player.id} value={player.id}>{player.name} - {player.role}</option>
          ))}
        </select>

        <input className={inputClass} value={price} onChange={(event) => setPrice(event.currentTarget.value)} type="number" min="0" placeholder="Final price" />

        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 text-sm font-bold text-white disabled:opacity-60" disabled={pendingAction === "assign"}>
          {pendingAction === "assign" ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          Assign player
        </button>

        {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700 lg:col-span-4">{error}</p> : null}
        {message ? <p className="rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 lg:col-span-4">{message}</p> : null}
      </form>
    </div>
  );
}
