import Link from "next/link";
import { Trophy } from "lucide-react";
import { getUserMeLoader } from "@/data/services/user";
import { DashboardShellClient } from "./dashboard-shell-client";

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

export async function DashboardShell({ children }: { children: React.ReactNode }) {
  const userResponse = await getUserMeLoader();
  const user = userResponse.data;

  return <DashboardShellClient username={user?.username ?? "Guest User"}>{children}</DashboardShellClient>;
}
