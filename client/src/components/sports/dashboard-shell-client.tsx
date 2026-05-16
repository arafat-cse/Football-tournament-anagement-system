"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Users, X } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/data/actions/auth";
import { cn } from "@/lib/utils";
import { dashboardNavItems } from "./dashboard-nav";

export function DashboardShellClient({
  children,
  username,
}: {
  children: ReactNode;
  username: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  const navLinks = (onNavigate?: () => void) => (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {dashboardNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white",
            isActive(item.href) && "bg-white/10 text-white"
          )}
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const logoutButton = (
    <form action={logoutAction} className="border-t border-white/10 p-3">
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOut className="size-4" />
        Logout
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-slate-950 text-white transition-transform duration-200 lg:flex",
          desktopOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 px-5">
          <div className="flex items-center gap-2 font-heading text-lg font-black">
            <BarChart3 className="size-5 text-emerald-400" />
            Admin Console
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white"
            aria-label="Hide sidebar"
            onClick={() => setDesktopOpen(false)}
          >
            <PanelLeftClose className="size-5" />
          </Button>
        </div>
        {navLinks()}
        {logoutButton}
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/50 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(82vw,20rem)] flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-white/10 px-4">
          <div className="flex items-center gap-2 font-heading text-lg font-black">
            <BarChart3 className="size-5 text-emerald-400" />
            Admin Console
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white"
            aria-label="Close dashboard menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="size-5" />
          </Button>
        </div>
        {navLinks(() => setMobileOpen(false))}
        {logoutButton}
      </aside>

      <div className={cn("transition-[padding] duration-200", desktopOpen ? "lg:pl-64" : "lg:pl-0")}>
        <header className="sticky top-0 z-20 border-b bg-white">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 md:px-8">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open dashboard menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hidden lg:inline-flex"
                aria-label={desktopOpen ? "Hide sidebar" : "Show sidebar"}
                aria-expanded={desktopOpen}
                onClick={() => setDesktopOpen((open) => !open)}
              >
                {desktopOpen ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
              </Button>
              <Link href="/" className="font-heading text-base font-black">TournamentPro</Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Users className="size-4" />
                <span className="max-w-28 truncate sm:max-w-none">{username}</span>
              </div>
              <form action={logoutAction} className="hidden sm:block">
                <button type="submit" className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <LogOut className="size-4" />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
