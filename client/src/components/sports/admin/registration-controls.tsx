"use client";

import { useState, useTransition } from "react";
import { Check, CircleDollarSign, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/sports/status-badge";
import type { PaymentStatus, RegistrationStatus } from "@/data/tournament/types";

export function RegistrationStatusControls({
  approveId,
  paymentId,
  paymentStatus,
  registrationStatus,
}: {
  approveId: string | number;
  paymentId: string | number;
  paymentStatus: PaymentStatus;
  registrationStatus: RegistrationStatus;
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
    <div className="flex min-w-52 flex-col gap-2">
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
          className="inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
          disabled={isPending || isApproved || !isPaid}
          title={isPaid ? "Approve registration" : "Mark payment paid before approval"}
          onClick={() => run(() => fetch(`/api/admin/registrations/${approveId}/approve`, { method: "POST" }))}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4 text-emerald-600" />}
          Approve
        </button>
      </div>

      {message ? <p className="text-xs font-semibold text-red-600">{message}</p> : null}
    </div>
  );
}
