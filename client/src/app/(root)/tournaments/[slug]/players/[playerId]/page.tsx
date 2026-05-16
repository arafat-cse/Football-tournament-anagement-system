import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Banknote, CalendarDays, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import { StatusBadge } from "@/components/sports/status-badge";
import { getRegistrations, getTeams } from "@/data/tournament/api";
import { formatDate } from "@/lib/utils";

export default async function PlayerDetailsPage({ params }: { params: Promise<{ slug: string; playerId: string }> }) {
  const { slug, playerId } = await params;
  const [registrations, teams] = await Promise.all([getRegistrations(slug), getTeams(slug)]);
  const player = registrations.find((registration) => String(registration.id) === String(playerId));

  if (!player) notFound();

  const teamName = teams.find((team) => team.id === player.teamId)?.name ?? "Auction pool";
  const submittedAt = player.createdAt ? formatDate(player.createdAt) : "Not available";

  return (
    <section className="container py-10">
      <Link href={`/tournaments/${slug}/players`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-700">
        <ArrowLeft className="size-4" /> Back to registrations
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mx-auto grid size-36 place-items-center overflow-hidden rounded-lg bg-emerald-50 text-5xl font-black text-emerald-700 ring-1 ring-emerald-100">
            {player.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.photoUrl} alt={player.name} className="h-full w-full object-cover" />
            ) : (
              player.name.slice(0, 1).toUpperCase()
            )}
          </div>
          <h1 className="mt-5 text-center font-heading text-3xl font-black text-slate-950">{player.name}</h1>
          <p className="mt-1 text-center text-sm font-semibold text-slate-500">{player.role || "Player"}</p>

          <div className="mt-5 grid gap-2">
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="text-sm text-slate-500">Registration</span>
              <StatusBadge value={player.registrationStatus} />
            </div>
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="text-sm text-slate-500">Payment</span>
              <StatusBadge value={player.paymentStatus} />
            </div>
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="text-sm text-slate-500">Auction</span>
              <StatusBadge value={player.auctionStatus} />
            </div>
          </div>
        </aside>

        <div className="grid gap-6">
          <section className="rounded-lg border bg-white p-5 shadow-sm">
            <h2 className="font-heading text-xl font-black">Player details</h2>
            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              <Detail icon={Phone} label="Phone" value={player.phone || "Not provided"} />
              <Detail icon={Mail} label="Email" value={player.email || "Not provided"} />
              <Detail icon={UserRound} label="Age" value={player.age ? String(player.age) : "Not provided"} />
              <Detail icon={MapPin} label="Address" value={player.address || "Not provided"} />
              <Detail icon={ShieldCheck} label="Team" value={teamName} />
              <Detail icon={CalendarDays} label="Submitted" value={submittedAt} />
            </dl>
          </section>

          <section className="rounded-lg border bg-white p-5 shadow-sm">
            <h2 className="font-heading text-xl font-black">Registration info</h2>
            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              <Detail icon={Banknote} label="Base price" value={`Tk ${player.basePrice.toLocaleString()}`} />
              <Detail icon={Banknote} label="Amount" value={`Tk ${player.amount.toLocaleString()}`} />
              <Detail icon={ShieldCheck} label="Payment method" value={player.paymentMethod} />
              <Detail icon={ShieldCheck} label="Transaction ID" value={player.transactionId || "Not provided"} />
            </dl>
            {player.experience ? (
              <div className="mt-5 rounded-md bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Experience</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{player.experience}</p>
              </div>
            ) : null}
            {player.rejectionReason ? (
              <div className="mt-5 rounded-md bg-red-50 p-4 text-sm text-red-700">
                <p className="font-bold">Rejection reason</p>
                <p className="mt-1">{player.rejectionReason}</p>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </section>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md bg-slate-50 p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
      <div>
        <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
        <dd className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</dd>
      </div>
    </div>
  );
}
