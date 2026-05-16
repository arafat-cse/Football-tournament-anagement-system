import Link from "next/link";
import { BarChart3, CreditCard, FileDown, Gavel, LayoutDashboard, ShieldCheck, Trophy, Users } from "lucide-react";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7faf7] text-slate-950">
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="container flex min-h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-heading text-lg font-black">
            <Trophy className="size-5 text-emerald-600" />
            TournamentPro
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-600 md:flex">
            <Link href="/tournaments">Tournaments</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t bg-white">
        <div className="container flex flex-col gap-2 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <span className="font-medium">Football tournament operations platform.</span>
          <div className="flex items-center gap-1.5">
            <span className="opacity-75">Developed by</span>
            <Link 
              href="https://mandsitbd.com" 
              target="_blank" 
              className="font-bold tracking-tight text-emerald-600 transition-colors hover:text-emerald-700"
            >
              Mandsitbd.com
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/dashboard/registrations", label: "Registrations", icon: ShieldCheck },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/auction", label: "Auction", icon: Gavel },
  { href: "/dashboard/reports", label: "Reports", icon: FileDown },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-slate-950 text-white lg:block">
        <div className="flex h-16 items-center gap-2 px-5 font-heading text-lg font-black">
          <BarChart3 className="size-5 text-emerald-400" />
          Admin Console
        </div>
        <nav className="space-y-1 px-3">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white">
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b bg-white">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 md:px-8">
            <Link href="/" className="font-heading text-base font-black">TournamentPro</Link>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Users className="size-4" />
              Role-ready RBAC dashboard
            </div>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
