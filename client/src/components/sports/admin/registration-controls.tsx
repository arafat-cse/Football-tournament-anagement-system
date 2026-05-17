"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, CircleDollarSign, Edit3, Eye, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/sports/status-badge";
import type { PaymentStatus, RegistrationStatus } from "@/data/tournament/types";

export function RegistrationStatusControls({
  approveId,
  paymentId,
  paymentStatus,
  registrationStatus,
  editHref,
  viewHref,
}: {
  approveId: string | number;
  paymentId: string | number;
  paymentStatus: PaymentStatus;
  registrationStatus: RegistrationStatus;
  editHref?: string;
  viewHref?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const isPaid = paymentStatus === "paid";
  const isApproved = registrationStatus === "approved";

  function run(action: () => Promise<Response>) {
    setMessage("");
    startTransition(async () => {
      const response = await action();
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setMessage(payload?.error?.message ?? payload?.error ?? "Action failed");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 min-[420px]:w-auto min-[420px]:min-w-52">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge value={paymentStatus} />
        <button
          className="inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-bold hover:bg-slate-50 disabled:opacity-60"
          disabled={isPending}
          title="Toggle payment paid/pending"
          onClick={() => run(() => fetch(`/api/admin/registrations/${paymentId}/payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentStatus: isPaid ? "pending" : "paid" }),
          }))}
        >
          <CircleDollarSign className="size-4 text-emerald-600" />
          {isPaid ? <ToggleRight className="size-4 text-emerald-600" /> : <ToggleLeft className="size-4 text-slate-500" />}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge value={registrationStatus} />
        <button
          className="inline-flex size-8 items-center justify-center rounded-md border text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
          disabled={isPending || isApproved || !isPaid}
          title={isPaid ? "Approve registration" : "Mark payment paid before approval"}
          aria-label="Approve registration"
          onClick={() => run(() => fetch(`/api/admin/registrations/${approveId}/approve`, { method: "POST" }))}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4 text-emerald-600" />}
        </button>
        {editHref ? (
          <Link
            href={editHref}
            className="inline-flex size-8 items-center justify-center rounded-md border text-slate-600 hover:bg-slate-50"
            title="Edit registration"
            aria-label="Edit registration"
          >
            <Edit3 className="size-4" />
          </Link>
        ) : null}
        {viewHref ? (
          <Link
            href={viewHref}
            className="inline-flex size-8 items-center justify-center rounded-md border text-slate-600 hover:bg-slate-50"
            title="View registration"
            aria-label="View registration"
          >
            <Eye className="size-4" />
          </Link>
        ) : null}
      </div>

      {message ? <p className="text-xs font-semibold text-red-600">{message}</p> : null}
    </div>
  );
}
