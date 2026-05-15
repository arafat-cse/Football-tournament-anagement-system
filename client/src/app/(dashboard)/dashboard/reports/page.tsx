import { FileSpreadsheet, FileText } from "lucide-react";

const reports = [
  { href: "/api/exports/players", label: "Tournament player list PDF", icon: FileText },
  { href: "/api/exports/registrations", label: "All registrations Excel", icon: FileSpreadsheet },
  { href: "/api/exports/team-squad", label: "Team-wise squad PDF", icon: FileText },
  { href: "/api/exports/payments", label: "Payment report Excel", icon: FileSpreadsheet },
];

export default function ReportsPage() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-black">Reports</h1>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {reports.map((report) => (
          <a key={report.href} href={report.href} className="flex items-center gap-4 rounded-lg border bg-white p-5 shadow-sm">
            <report.icon className="size-6 text-emerald-600" />
            <div>
              <h2 className="font-heading font-black">{report.label}</h2>
              <p className="text-sm text-slate-500">Use query filters: tournament, status, team, paymentStatus.</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
