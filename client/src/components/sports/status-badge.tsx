import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  sold: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  live: "bg-rose-50 text-rose-700 ring-rose-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  pool: "bg-sky-50 text-sky-700 ring-sky-200",
  auction: "bg-sky-50 text-sky-700 ring-sky-200",
  registration_open: "bg-lime-50 text-lime-700 ring-lime-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  refunded: "bg-zinc-50 text-zinc-700 ring-zinc-200",
  unsold: "bg-zinc-50 text-zinc-700 ring-zinc-200",
  completed: "bg-zinc-50 text-zinc-700 ring-zinc-200",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold capitalize ring-1", styles[value] ?? "bg-slate-50 text-slate-700 ring-slate-200", className)}>
      {value.replaceAll("_", " ")}
    </span>
  );
}
