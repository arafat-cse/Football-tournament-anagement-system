"use client";

import { useMemo, useRef, useState } from "react";
import { CheckCircle2, Download, Loader2, Share2, Upload } from "lucide-react";

const inputClass = "h-11 rounded-md border bg-white px-3 text-sm outline-none ring-emerald-600/20 focus:ring-4";

const roles = [
  "Forward",
  "Midfielder",
  "Defender",
  "Goalkeeper",
];

type CardData = {
  name: string;
  role: string;
  age: string;
  tournamentName: string;
  photoUrl: string;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function createCardBlob(card: CardData) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
  gradient.addColorStop(0, "#052e2b");
  gradient.addColorStop(0.54, "#16a34a");
  gradient.addColorStop(1, "#f8fafc");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1350);

  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.roundRect(80, 90, 920, 1170, 36);
  ctx.fill();

  ctx.fillStyle = "#064e3b";
  ctx.font = "900 54px Arial";
  ctx.fillText("PLAYER REGISTRATION", 130, 180);

  ctx.fillStyle = "#64748b";
  ctx.font = "700 28px Arial";
  ctx.fillText("TournamentPro", 130, 225);

  if (card.photoUrl) {
    const image = await loadImage(card.photoUrl);
    const size = 520;
    const x = 280;
    const y = 285;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 28);
    ctx.clip();
    ctx.drawImage(image, x, y, size, size);
    ctx.restore();
  } else {
    ctx.fillStyle = "#dcfce7";
    ctx.roundRect(280, 285, 520, 520, 28);
    ctx.fill();
  }

  ctx.fillStyle = "#0f172a";
  ctx.font = "900 72px Arial";
  ctx.textAlign = "center";
  ctx.fillText(card.name, 540, 900, 820);

  ctx.fillStyle = "#16a34a";
  ctx.font = "800 42px Arial";
  ctx.fillText(card.role, 540, 970, 820);

  ctx.fillStyle = "#334155";
  ctx.font = "700 34px Arial";
  ctx.fillText(`Age: ${card.age || "-"}`, 540, 1030);

  ctx.fillStyle = "#f0fdf4";
  ctx.roundRect(130, 1090, 820, 100, 22);
  ctx.fill();
  ctx.fillStyle = "#064e3b";
  ctx.font = "900 34px Arial";
  ctx.fillText(`Registered for ${card.tournamentName}`, 540, 1153, 760);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not generate card"));
    }, "image/png");
  });
}

function PlayerShareCard({ card }: { card: CardData }) {
  const [busy, setBusy] = useState(false);
  const fileName = useMemo(() => `${card.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "player"}-registration-card.png`, [card.name]);

  async function downloadCard() {
    setBusy(true);
    const blob = await createCardBlob(card);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    setBusy(false);
  }

  async function shareCard() {
    setBusy(true);
    const blob = await createCardBlob(card);
    const file = new File([blob], fileName, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: `${card.name} registered for ${card.tournamentName}`,
        text: `${card.name} (${card.role}) registered for ${card.tournamentName}.`,
        files: [file],
      });
    } else {
      await downloadCard();
    }
    setBusy(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="bg-emerald-950 p-5 text-white">
          <p className="text-xs font-black uppercase tracking-wide text-lime-200">Player registration</p>
          <h2 className="mt-2 font-heading text-2xl font-black">{card.name}</h2>
        </div>
        <div className="p-5">
          <div className="aspect-[4/5] overflow-hidden rounded-lg bg-emerald-50">
            {card.photoUrl ? <img src={card.photoUrl} alt={card.name} className="h-full w-full object-cover" /> : null}
          </div>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between rounded-md bg-slate-50 p-3"><span>Role</span><b>{card.role}</b></div>
            <div className="flex justify-between rounded-md bg-slate-50 p-3"><span>Age</span><b>{card.age || "-"}</b></div>
            <div className="rounded-md bg-emerald-50 p-3 text-center font-black text-emerald-800">{card.tournamentName}</div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-emerald-50 p-6 text-emerald-950">
        <CheckCircle2 className="mb-3 size-8" />
        <h2 className="font-heading text-2xl font-black">Registration submitted</h2>
        <p className="mt-2 text-sm">Your player card is ready for Facebook or social media posting.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="inline-flex h-11 items-center gap-2 rounded-md bg-emerald-600 px-5 text-sm font-bold text-white disabled:opacity-60" disabled={busy} onClick={downloadCard}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Download card
          </button>
          <button className="inline-flex h-11 items-center gap-2 rounded-md border border-emerald-700 px-5 text-sm font-bold text-emerald-900 disabled:opacity-60" disabled={busy} onClick={shareCard}>
            <Share2 className="size-4" />
            Share post
          </button>
        </div>
      </div>
    </div>
  );
}

export function RegistrationForm({
  fee,
  tournamentId,
  tournamentSlug,
  tournamentName,
}: {
  fee: number;
  tournamentId: number;
  tournamentSlug: string;
  tournamentName: string;
}) {
  const [submittedCard, setSubmittedCard] = useState<CardData | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const photoUrlRef = useRef("");

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
    if (photo instanceof File && photo.size > 0) {
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = URL.createObjectURL(photo);
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
      photoUrl: photoUrlRef.current,
    });
  }

  if (submittedCard) return <PlayerShareCard card={submittedCard} />;

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

      <label className="flex h-24 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed bg-slate-50 text-sm font-semibold text-slate-600 md:col-span-2">
        <Upload className="size-4" />
        Upload player photo
        <input className="hidden" name="photo" type="file" accept="image/*" />
      </label>

      <select className={inputClass} name="paymentMethod" defaultValue="bkash">
        <option value="bkash">bKash</option>
        <option value="nagad">Nagad</option>
        <option value="rocket">Rocket</option>
        <option value="bank">Bank</option>
        <option value="cash">Cash</option>
      </select>
      <input className={inputClass} name="transactionId" placeholder={`Transaction ID, fee ৳${fee}`} />

      <label className="flex h-24 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed bg-slate-50 text-sm font-semibold text-slate-600 md:col-span-2">
        <Upload className="size-4" />
        Upload payment screenshot
        <input className="hidden" name="paymentScreenshot" type="file" accept="image/*" />
      </label>

      {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700 md:col-span-2">{error}</p> : null}

      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 text-sm font-bold text-white disabled:opacity-60 md:col-span-2" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {pending ? "Saving..." : "Submit registration"}
      </button>
    </form>
  );
}
