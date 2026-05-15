import Link from "next/link";
import { ArrowRight, Gavel, ShieldCheck, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TournamentCard } from "@/components/sports/cards";
import { getTournaments } from "@/data/tournament/api";

const features: { title: string; body: string; icon: LucideIcon }[] = [
  { title: "Registration approval", body: "Paid players move into auction pool", icon: ShieldCheck },
  { title: "Live auction", body: "Budget guard prevents overspending", icon: Gavel },
  { title: "Reports", body: "PDF squads and Excel payment exports", icon: Trophy },
];

export default async function Home() {
  const tournaments = await getTournaments();
  return (
    <div>
      <section className="bg-[linear-gradient(135deg,#052e2b,#166534_52%,#f8fafc_52%)]">
        <div className="container grid min-h-[560px] items-center gap-8 py-12 lg:grid-cols-[1.05fr_.95fr]">
          <div className="max-w-2xl text-white">
            <p className="text-sm font-black uppercase tracking-wide text-lime-200">Football and cricket operations</p>
            <h1 className="mt-4 font-heading text-5xl font-black leading-tight md:text-7xl">TournamentPro</h1>
            <p className="mt-5 max-w-xl text-lg text-emerald-50">
              Manage registrations, manual payments, approvals, team budgets, auctions, squads and exportable reports from one clean workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tournaments" className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-bold text-emerald-900">
                Browse tournaments <ArrowRight className="size-4" />
              </Link>
              <Link href="/dashboard" className="inline-flex h-11 items-center rounded-md border border-white/30 px-5 text-sm font-bold text-white">
                Admin dashboard
              </Link>
            </div>
          </div>
          <div className="grid gap-3 rounded-lg bg-white/95 p-4 shadow-xl">
            {features.map(({ title, body, icon: Icon }) => (
              <div key={title} className="flex items-center gap-4 rounded-md border bg-slate-50 p-4">
                <Icon className="size-7 text-emerald-600" />
                <div>
                  <h3 className="font-heading font-black">{title}</h3>
                  <p className="text-sm text-slate-600">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-emerald-700">Active tournaments</p>
            <h2 className="font-heading text-3xl font-black">Open competitions</h2>
          </div>
          <Link href="/tournaments" className="text-sm font-bold text-emerald-700">View all</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {tournaments.map((tournament) => <TournamentCard key={tournament.id} tournament={tournament} />)}
        </div>
      </section>
    </div>
  );
}
