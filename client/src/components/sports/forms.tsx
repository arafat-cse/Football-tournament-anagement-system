"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { PlayerCardPreview, fileToDataUrl, type CardData } from "@/components/sports/player-card";

const inputClass = "h-11 rounded-md border bg-white px-3 text-sm outline-none ring-emerald-600/20 focus:ring-4";

const roles = [
  "Forward",
  "Midfielder",
  "Defender",
  "Goalkeeper",
];

export function RegistrationForm({
  fee,
  registrationInstruction,
  tournamentId,
  tournamentSlug,
  tournamentName,
}: {
  fee: number;
  registrationInstruction?: string;
  tournamentId: number;
  tournamentSlug: string;
  tournamentName: string;
}) {
  const [submittedCard, setSubmittedCard] = useState<CardData | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function updatePhotoPreview(file: File | null) {
    if (!file || file.size === 0) {
      setPhotoPreview("");
      return;
    }
    setPhotoPreview(await fileToDataUrl(file));
  }

  async function submitRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("tournament", String(tournamentId));
    formData.set("tournamentSlug", tournamentSlug);
    formData.set("amount", String(fee));

    const photo = formData.get("photo");
    let cardPhotoUrl = photoPreview;
    if (photo instanceof File && photo.size > 0 && !cardPhotoUrl) {
      cardPhotoUrl = await fileToDataUrl(photo);
      setPhotoPreview(cardPhotoUrl);
    }

    let response: Response;
    try {
      response = await fetch("/api/registrations", {
        method: "POST",
        body: formData,
      });
    } catch {
      setPending(false);
      setError("Registration save failed. Please make sure Next.js is running and try again.");
      return;
    }

    const payload = await response.json().catch(() => null);
    setPending(false);

    if (!response.ok) {
      setError(payload?.error ?? "Registration save failed. Please check Strapi permissions and try again.");
      return;
    }

    setSubmittedCard({
      name: String(formData.get("name") ?? ""),
      role: String(formData.get("role") ?? ""),
      age: String(formData.get("age") ?? ""),
      tournamentName,
      photoUrl: cardPhotoUrl,
    });
  }

  if (submittedCard) {
    return (
      <PlayerCardPreview
        card={submittedCard}
        title="Registration submitted"
        subtitle="Your official player card is ready for download or sharing."
      />
    );
  }

  return (
    <form className="grid gap-4 rounded-lg border bg-white p-5 shadow-sm md:grid-cols-2" onSubmit={submitRegistration}>
      <input className={inputClass} name="name" required placeholder="Player name / খেলোয়াড়ের নাম" />
      <input className={inputClass} name="phone" required placeholder="Phone" />
      <input className={inputClass} name="email" type="email" placeholder="Email" />
      <input className={inputClass} name="age" type="number" min="12" placeholder="Age" />

      <select className={inputClass} name="role" required defaultValue="">
        <option value="" disabled>Select role / position</option>
        {roles.map((role) => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>

      <input className={inputClass} name="basePrice" type="number" min="0" placeholder="Base price" />
      <textarea className="min-h-24 rounded-md border bg-white px-3 py-2 text-sm outline-none ring-emerald-600/20 focus:ring-4 md:col-span-2" name="address" placeholder="Address" />
      <textarea className="min-h-24 rounded-md border bg-white px-3 py-2 text-sm outline-none ring-emerald-600/20 focus:ring-4 md:col-span-2" name="experience" placeholder="Experience" />

      <label className="grid min-h-32 cursor-pointer place-items-center gap-3 rounded-md border border-dashed bg-slate-50 p-4 text-sm font-semibold text-slate-600 md:col-span-2">
        {photoPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoPreview} alt="Player preview" className="h-40 w-40 rounded-md object-cover" />
        ) : (
          <span className="inline-flex items-center gap-2"><Upload className="size-4" /> Upload player photo</span>
        )}
        <span className="text-xs text-slate-500">{photoPreview ? "Click to change photo" : "Preview will show here"}</span>
        <input className="hidden" name="photo" type="file" accept="image/*" onChange={(event) => updatePhotoPreview(event.currentTarget.files?.[0] ?? null)} />
      </label>

      <select className={inputClass} name="paymentMethod" defaultValue="bkash">
        <option value="bkash">bKash</option>
        <option value="nagad">Nagad</option>
        <option value="rocket">Rocket</option>
        <option value="bank">Bank</option>
        <option value="cash">Cash</option>
      </select>

      {registrationInstruction ? (
        <div className="rounded-md border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-950 md:col-span-2">
          <p className="font-heading text-lg font-black">Registration instruction</p>
          <p className="mt-2 whitespace-pre-line leading-6">{registrationInstruction}</p>
          <p className="mt-3 font-bold">Registration fee: Tk {fee.toLocaleString()}</p>
        </div>
      ) : null}
      <input className={inputClass} name="transactionId" placeholder={`Transaction ID, fee ৳${fee}`} />

      {/* <label className="flex h-24 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed bg-slate-50 text-sm font-semibold text-slate-600 md:col-span-2">
        <Upload className="size-4" />
        Upload payment screenshot
        <input className="hidden" name="paymentScreenshot" type="file" accept="image/*" />
      </label> */}

      {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700 md:col-span-2">{error}</p> : null}

      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 text-sm font-bold text-white disabled:opacity-60 md:col-span-2" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {pending ? "Saving..." : "Submit registration"}
      </button>
    </form>
  );
}
