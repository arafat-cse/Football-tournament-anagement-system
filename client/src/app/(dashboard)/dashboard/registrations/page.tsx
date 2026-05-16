import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RegistrationStatusControls } from "@/components/sports/admin/registration-controls";
import { getRegistrations } from "@/data/tournament/api";

export default async function RegistrationsPage() {
  const registrations = await getRegistrations();
  return (
    <div>
      <div className="flex items-center gap-4 mb-2">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center justify-center rounded-md border bg-white text-slate-700 transition hover:bg-slate-50 h-10 w-10 shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
        <h1 className="font-heading text-3xl font-black">Player registrations</h1>
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Transaction</th><th className="px-4 py-3">Payment & approval</th></tr></thead>
          <tbody>
            {registrations.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3 font-semibold">{item.name}</td>
                <td className="px-4 py-3">{item.phone}</td>
                <td className="px-4 py-3">{item.role}</td>
                <td className="px-4 py-3">{item.transactionId}</td>
                <td className="px-4 py-3">
                  <RegistrationStatusControls
                    approveId={item.id}
                    paymentId={item.documentId ?? item.id}
                    paymentStatus={item.paymentStatus}
                    registrationStatus={item.registrationStatus}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
