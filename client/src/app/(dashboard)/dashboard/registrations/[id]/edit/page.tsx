import { revalidatePath } from "next/cache";
import { redirect, notFound } from "next/navigation";
import { getStrapiAuthHeaders } from "@/data/services/strapi-auth-headers";
import { getRegistrations } from "@/data/tournament/api";
import { getResolvedStrapiURL } from "@/lib/utils";

const inputClass = "h-11 rounded-md border bg-white px-3 text-sm outline-none ring-emerald-600/20 focus:ring-4";
const textareaClass = "min-h-28 rounded-md border bg-white px-3 py-2 text-sm outline-none ring-emerald-600/20 focus:ring-4 md:col-span-2";
const roles = ["Forward", "Midfielder", "Defender", "Goalkeeper"];
const paymentMethods = ["bkash", "nagad", "rocket", "bank", "cash", "waived"];
const strapiUrl = getResolvedStrapiURL();

type EntityRecord = Record<string, unknown> & {
  id?: string | number;
  documentId?: string;
  attributes?: Record<string, unknown>;
};

function asRecord(value: unknown): EntityRecord | undefined {
  return value && typeof value === "object" ? (value as EntityRecord) : undefined;
}

function entity(payload: unknown) {
  const payloadRecord = asRecord(payload);
  const data = asRecord(payloadRecord?.data) ?? payloadRecord;
  if (!data) return undefined;
  if (!data.attributes) return data;
  return { id: data.id, documentId: data.documentId, ...data.attributes };
}

function firstEntity(payload: unknown) {
  const payloadRecord = asRecord(payload);
  const data = Array.isArray(payloadRecord?.data) ? payloadRecord.data[0] : undefined;
  return entity(data);
}

function relationId(value: unknown) {
  if (!value) return undefined;
  if (typeof value === "string" || typeof value === "number") return value;
  const record = asRecord(value);
  const data = asRecord(record?.data);
  if (data?.documentId || data?.id) return data.documentId ?? data.id;
  return record?.documentId ?? record?.id;
}

async function strapiJson(path: string, init: RequestInit = {}) {
  const response = await fetch(`${strapiUrl}${path}`, {
    ...init,
    headers: {
      ...(await getStrapiAuthHeaders()),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  return { response, payload };
}

export default async function EditRegistrationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const registrations = await getRegistrations();
  const registration = registrations.find((item) => String(item.documentId ?? item.id) === String(id));

  if (!registration) notFound();
  const tournamentSlug = registration.tournamentSlug;
  const registrationPlayerId = registration.id;

  async function updateRegistration(formData: FormData) {
    "use server";

    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email") || undefined,
      age: Number(formData.get("age") || 0) || undefined,
      role: formData.get("role"),
      basePrice: Number(formData.get("basePrice") || 0),
      amount: Number(formData.get("amount") || 0),
      paymentMethod: formData.get("paymentMethod") || "bkash",
      transactionId: formData.get("transactionId") || undefined,
      address: formData.get("address") || undefined,
      experience: formData.get("experience") || undefined,
    };

    const updateResult = await strapiJson(`/api/registrations/${id}`, {
      method: "PUT",
      body: JSON.stringify({ data }),
    });

    if (!updateResult.response.ok) {
      throw new Error("Could not update registration.");
    }

    const registrationResult = await strapiJson(`/api/registrations/${id}?populate[0]=player`);
    const savedRegistration = entity(registrationResult.payload);
    let player = entity(savedRegistration?.player);

    if (!player) {
      const existingPlayerResult = await strapiJson(
        `/api/players?filters[registration][documentId][$eq]=${encodeURIComponent(savedRegistration?.documentId ?? id)}&pagination[pageSize]=1`
      );
      if (existingPlayerResult.response.ok) {
        player = firstEntity(existingPlayerResult.payload);
      }
    }

    const playerId = relationId(player);
    if (playerId) {
      const playerResult = await strapiJson(`/api/players/${playerId}`, {
        method: "PUT",
        body: JSON.stringify({
          data: {
            name: data.name,
            phone: data.phone,
            email: data.email,
            age: data.age,
            address: data.address,
            role: data.role,
            experience: data.experience,
            basePrice: data.basePrice,
          },
        }),
      });

      if (!playerResult.response.ok) {
        throw new Error("Registration updated, but linked player could not be updated.");
      }
    }

    revalidatePath("/dashboard/registrations");
    if (tournamentSlug) {
      revalidatePath(`/tournaments/${tournamentSlug}/players`);
      revalidatePath(`/tournaments/${tournamentSlug}/players/${registrationPlayerId}`);
    }

    redirect("/dashboard/registrations");
  }

  return (
    <div>
      <div>
        <p className="text-sm font-bold uppercase text-emerald-700">Edit registration</p>
        <h1 className="font-heading text-3xl font-black">{registration.name}</h1>
      </div>

      <form action={updateRegistration} className="mt-6 grid gap-4 rounded-lg border bg-white p-5 shadow-sm md:grid-cols-2">
        <input className={inputClass} name="name" required defaultValue={registration.name} placeholder="Player name" />
        <input className={inputClass} name="phone" required defaultValue={registration.phone} placeholder="Phone" />
        <input className={inputClass} name="email" type="email" defaultValue={registration.email} placeholder="Email" />
        <input className={inputClass} name="age" type="number" min="12" defaultValue={registration.age || ""} placeholder="Age" />

        <select className={inputClass} name="role" required defaultValue={registration.role}>
          <option value="" disabled>Select role / position</option>
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <input className={inputClass} name="basePrice" type="number" min="0" defaultValue={registration.basePrice} placeholder="Base price" />
        <input className={inputClass} name="amount" type="number" min="0" defaultValue={registration.amount} placeholder="Payment amount" />
        <select className={inputClass} name="paymentMethod" defaultValue={registration.paymentMethod}>
          {paymentMethods.map((method) => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
        <input className={inputClass} name="transactionId" defaultValue={registration.transactionId} placeholder="Transaction ID" />

        <textarea className={textareaClass} name="address" defaultValue={registration.address} placeholder="Address" />
        <textarea className={textareaClass} name="experience" defaultValue={registration.experience} placeholder="Experience" />

        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button type="submit" className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-95">
            Save changes
          </button>
          <a className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md border px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50" href="/dashboard/registrations">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
