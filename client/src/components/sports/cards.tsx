import Link from "next/link";
import { CalendarDays, Eye, MapPin, Trophy, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Player, Team, Tournament } from "@/data/tournament/types";
import { StatusBadge } from "./status-badge";

export function TournamentCard({ tournament, href }: { tournament: Tournament; href?: string }) {
  return (
    <Link href={href ?? `/tournaments/${tournament.slug}`} className="group block rounded-lg border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{tournament.sportType}</p>
          <h3 className="mt-2 font-heading text-xl font-black text-slate-950">{tournament.name}</h3>
        </div>
        <StatusBadge value={tournament.status} />
      </div>
      <div className="mt-5 grid gap-3 text-sm text-slate-600">
        <span className="flex items-center gap-2"><MapPin className="size-4" /> {tournament.location}</span>
        <span className="flex items-center gap-2"><CalendarDays className="size-4" /> {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
        <span className="flex items-center gap-2"><Users className="size-4" /> {tournament.teamCount} teams, {tournament.playerCount} players</span>
      </div>
    </Link>
  );
}

export function TeamCard({ team, slug }: { team: Team; slug: string }) {
  const remaining = team.budget - team.spent;
  return (
    <Link href={`/tournaments/${slug}/teams/${team.id}`} className="block rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="size-10 rounded-md border" style={{ backgroundColor: team.jerseyColor }} />
        <div>
          <h3 className="font-heading text-lg font-black">{team.name}</h3>
          <p className="text-sm text-slate-500">{team.ownerName}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md bg-slate-50 p-3"><span className="block text-slate-500">Budget</span><b>৳{team.budget.toLocaleString()}</b></div>
        <div className="rounded-md bg-emerald-50 p-3"><span className="block text-slate-500">Remaining</span><b>৳{remaining.toLocaleString()}</b></div>
      </div>
    </Link>
  );
}

export function PlayerRow({ player, teamName, detailsHref }: { player: Player; teamName?: string; detailsHref?: string }) {
  return (
    <tr className="border-b bg-white">
      <td className="px-4 py-3 font-semibold">
        <div className="flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-md bg-emerald-50 text-sm font-black text-emerald-700 ring-1 ring-emerald-100">
            {player.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.photoUrl} alt={player.name} className="h-full w-full object-cover" />
            ) : (
              player.name.slice(0, 1).toUpperCase()
            )}
          </div>
          <span>{player.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-600">{player.role}</td>
      <td className="px-4 py-3 text-slate-600">৳{player.basePrice.toLocaleString()}</td>
      <td className="px-4 py-3"><StatusBadge value={player.registrationStatus} /></td>
      <td className="px-4 py-3"><StatusBadge value={player.paymentStatus} /></td>
      <td className="px-4 py-3"><StatusBadge value={player.auctionStatus} /></td>
      <td className="px-4 py-3 text-slate-600">{teamName ?? "Auction pool"}</td>
      {detailsHref ? (
        <td className="px-4 py-3">
          <Link
            href={detailsHref}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Eye className="size-4" /> View
          </Link>
        </td>
      ) : null}
    </tr>
  );
}

export function StatCard({ label, value, icon: Icon, href }: { label: string; value: string | number; icon: typeof Trophy; href?: string }) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500">{label}</span>
        <Icon className="size-5 text-emerald-600" />
      </div>
      <div className="mt-3 font-heading text-3xl font-black">{value}</div>
    </>
  );

  const className = "rounded-lg border bg-white p-5 shadow-sm block transition hover:-translate-y-0.5 hover:shadow-md";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
