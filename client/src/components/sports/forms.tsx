"use client";

import { useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";

const inputClass = "h-11 rounded-md border bg-white px-3 text-sm outline-none ring-emerald-600/20 focus:ring-4";

export function RegistrationForm({ fee }: { fee: number }) {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) {
    return (
      <div className="rounded-lg border bg-emerald-50 p-6 text-emerald-900">
        <CheckCircle2 className="mb-3 size-8" />
        <h2 className="font-heading text-2xl font-black">Registration submitted</h2>
        <p className="mt-2 text-sm">Admin approval will verify payment first, then move approved players to the auction pool.</p>
      </div>
    );
  }

  return (
    <form className="grid gap-4 rounded-lg border bg-white p-5 shadow-sm md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
      <input className={inputClass} required placeholder="Player name / খেলোয়াড়ের নাম" />
      <input className={inputClass} required placeholder="Phone" />
      <input className={inputClass} type="email" placeholder="Email" />
      <input className={inputClass} type="number" min="12" placeholder="Age" />
      <input className={inputClass} placeholder="Position or role" />
      <input className={inputClass} type="number" min="0" placeholder="Base price" />
      <textarea className="min-h-24 rounded-md border bg-white px-3 py-2 text-sm outline-none ring-emerald-600/20 focus:ring-4 md:col-span-2" placeholder="Address and experience" />
      <select className={inputClass} defaultValue="bkash">
        <option value="bkash">bKash</option>
        <option value="nagad">Nagad</option>
        <option value="rocket">Rocket</option>
        <option value="bank">Bank</option>
        <option value="cash">Cash</option>
      </select>
      <input className={inputClass} placeholder={`Transaction ID, fee ৳${fee}`} />
      <label className="flex h-24 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed bg-slate-50 text-sm font-semibold text-slate-600 md:col-span-2">
        <Upload className="size-4" />
        Upload payment screenshot
        <input className="hidden" type="file" accept="image/*" />
      </label>
      <button className="h-11 rounded-md bg-emerald-600 px-5 text-sm font-bold text-white md:col-span-2">Submit registration</button>
    </form>
  );
}
