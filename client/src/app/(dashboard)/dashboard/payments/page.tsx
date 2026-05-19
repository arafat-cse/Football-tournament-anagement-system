import { StatusBadge } from "@/components/sports/status-badge";
import { getRegistrations } from "@/data/tournament/api";

export default async function PaymentsPage() {
  const payments = await getRegistrations();
  return (
    <div>
      <h1 className="font-heading text-3xl font-black">Payments</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <a className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white" href="/api/exports/payments">Download Excel</a>
      </div>
      <div className="mt-6 overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Player</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Transaction</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Admin note</th></tr></thead>
          <tbody>{payments.map((item) => <tr key={item.id} className="border-t"><td className="px-4 py-3 font-semibold">{item.name}</td><td className="px-4 py-3">{item.paymentMethod}</td><td className="px-4 py-3">{item.transactionId}</td><td className="px-4 py-3">৳{item.amount}</td><td className="px-4 py-3"><StatusBadge value={item.paymentStatus} /></td><td className="px-4 py-3 text-xs font-bold text-slate-500">Manual verification</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
