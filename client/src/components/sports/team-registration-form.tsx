"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, PlusCircle, Upload, X } from "lucide-react";

const inputClass = "h-11 rounded-md border bg-white px-3 text-sm outline-none ring-emerald-600/20 focus:ring-4";

export function TeamRegistrationForm({ tournamentId }: { tournamentId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logoPreview, setLogoPreview] = useState("");

  function updateLogo(file: File | null) {
    if (!file || file.size === 0) {
      setLogoPreview("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  async function submitTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("tournament", String(tournamentId));

    const response = await fetch("/api/teams", {
      method: "POST",
      body: formData,
    }).catch(() => null);

    setPending(false);
    if (!response) {
      setError("Team save failed. Please make sure the app is running.");
      return;
    }

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error ?? "Team save failed.");
      return;
    }

    form.reset();
    setLogoPreview("");
    setSuccess("Team registration submitted. Admin approval will team list-e show.");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <div className="mt-6">
        <button className="inline-flex h-11 items-center gap-2 rounded-md bg-emerald-600 px-5 text-sm font-bold text-white" onClick={() => setOpen(true)}>
          <PlusCircle className="size-4" /> Team registration
        </button>
        {success ? <p className="mt-3 rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{success}</p> : null}
      </div>
    );
  }

  return (
    <form className="mt-6 grid gap-4 rounded-lg border bg-white p-5 shadow-sm md:grid-cols-2" onSubmit={submitTeam}>
      <div className="flex items-start justify-between gap-4 md:col-span-2">
        <h2 className="font-heading text-2xl font-black">Team registration</h2>
        <button className="grid size-9 place-items-center rounded-md border text-slate-500" type="button" onClick={() => setOpen(false)} aria-label="Close team registration form">
          <X className="size-4" />
        </button>
      </div>
      <input className={inputClass} name="name" required placeholder="Team name" />
      <input className={inputClass} name="ownerName" placeholder="Owner name" />
      <input className={inputClass} name="ownerPhone" placeholder="Owner phone" />
      <input className={inputClass} name="budget" type="number" min="0" defaultValue={50000} placeholder="Team budget" />
      <label className="flex h-11 items-center gap-3 rounded-md border bg-white px-3 text-sm font-semibold text-slate-600">
        Jersey color
        <input className="h-7 w-12 cursor-pointer rounded border" name="jerseyColor" type="color" defaultValue="#16a34a" />
      </label>
      <label className="flex min-h-24 cursor-pointer items-center justify-center gap-3 rounded-md border border-dashed bg-slate-50 p-3 text-sm font-semibold text-slate-600 md:col-span-2">
        {logoPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoPreview} alt="Team logo preview" className="size-16 rounded-md object-cover" />
        ) : (
          <Upload className="size-4" />
        )}
        {logoPreview ? "Click to change logo" : "Upload team logo"}
        <input className="hidden" name="logo" type="file" accept="image/*" onChange={(event) => updateLogo(event.currentTarget.files?.[0] ?? null)} />
      </label>

      {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700 md:col-span-2">{error}</p> : null}
      {success ? <p className="rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 md:col-span-2">{success}</p> : null}

      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 text-sm font-bold text-white disabled:opacity-60 md:col-span-2" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <PlusCircle className="size-4" />}
        {pending ? "Saving team..." : "Submit for admin approval"}
      </button>
    </form>
  );
}
