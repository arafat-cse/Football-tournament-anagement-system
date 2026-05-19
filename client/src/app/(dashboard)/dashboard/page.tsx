import { CreditCard, Gavel, ShieldCheck, Trophy, Users } from "lucide-react";
import { StatCard } from "@/components/sports/cards";
import { StatusBadge } from "@/components/sports/status-badge";
import { getDashboardStats, getRegistrations } from "@/data/tournament/api";

export default async function DashboardRoute() {
  const [stats, registrations] = await Promise.all([getDashboardStats(), getRegistrations()]);
  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase text-emerald-700">Operations overview</p>
        <h1 className="font-heading text-3xl font-black">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tournaments" value={stats.tournaments} icon={Trophy} />
        <StatCard label="Registrations" value={stats.registrations} icon={Users} />
        <StatCard label="Pending approval" value={stats.pendingRegistrations} icon={ShieldCheck} />
        <StatCard label="Revenue" value={`৳${stats.revenue.toLocaleString()}`} icon={CreditCard} />
      </div>
      <div className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-black">Pending registrations</h2>
          <Gavel className="size-5 text-emerald-600" />
        </div>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Player</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead>
            <tbody>
              {registrations.filter((item) => item.registrationStatus === "pending").map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-semibold">{item.name}</td>
                  <td className="px-4 py-3">{item.role}</td>
                  <td className="px-4 py-3"><StatusBadge value={item.paymentStatus} /></td>
                  <td className="px-4 py-3"><StatusBadge value={item.registrationStatus} /></td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-500">Approve after payment</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
