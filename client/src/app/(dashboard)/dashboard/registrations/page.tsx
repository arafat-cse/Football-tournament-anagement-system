import { RegistrationStatusControls } from "@/components/sports/admin/registration-controls";
import { getRegistrations } from "@/data/tournament/api";
import { DownloadRegistrationsButton } from "@/components/sports/admin/download-registrations-button";

export default async function RegistrationsPage() {
  const registrations = await getRegistrations();
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-black sm:text-4xl">Player registrations</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex h-11 items-center rounded-md border bg-white px-4 text-sm font-bold text-slate-600 shadow-sm">
            Total registrations: <span className="ml-2 text-slate-950">{registrations.length}</span>
          </div>
          <DownloadRegistrationsButton registrations={registrations} />
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:hidden">
        {registrations.map((item, index) => (
          <article key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-start min-[420px]:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-black text-slate-600">
                    {index + 1}
                  </span>
                  <h2 className="truncate text-base font-black">{item.name}</h2>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-500">{item.role || "No role"}</p>
              </div>
              <RegistrationStatusControls
                approveId={item.id}
                paymentId={item.documentId ?? item.id}
                paymentStatus={item.paymentStatus}
                registrationStatus={item.registrationStatus}
                editHref={`/dashboard/registrations/${item.documentId ?? item.id}/edit`}
                viewHref={item.tournamentSlug ? `/tournaments/${item.tournamentSlug}/players/${item.id}` : undefined}
              />
            </div>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="font-semibold text-slate-500">Phone</dt>
                <dd className="text-right font-bold">{item.phone || "-"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="font-semibold text-slate-500">Transaction</dt>
                <dd className="max-w-40 truncate text-right font-bold">{item.transactionId || "-"}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="mt-6 hidden overflow-x-auto rounded-lg border bg-white shadow-sm md:block">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">SL</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Transaction</th><th className="px-4 py-3">Payment & approval</th></tr></thead>
          <tbody>
            {registrations.map((item, index) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3 text-xs font-black text-slate-500">{index + 1}</td>
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
                    editHref={`/dashboard/registrations/${item.documentId ?? item.id}/edit`}
                    viewHref={item.tournamentSlug ? `/tournaments/${item.tournamentSlug}/players/${item.id}` : undefined}
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
