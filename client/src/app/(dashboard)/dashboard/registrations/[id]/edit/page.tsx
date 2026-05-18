import { redirect, notFound } from "next/navigation";
import { getStrapiAuthHeaders } from "@/data/services/strapi-auth-headers";
import { getRegistrations } from "@/data/tournament/api";
import { getStrapiURL, getResolvedStrapiURL } from "@/lib/utils";

const inputClass = "h-11 rounded-md border bg-white px-3 text-sm outline-none ring-emerald-600/20 focus:ring-4";
const textareaClass = "min-h-28 rounded-md border bg-white px-3 py-2 text-sm outline-none ring-emerald-600/20 focus:ring-4 md:col-span-2";
const roles = ["Forward", "Midfielder", "Defender", "Goalkeeper"];
const strapiUrl = getResolvedStrapiURL();

export default async function EditRegistrationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const registrations = await getRegistrations();
  const registration = registrations.find((item) => String(item.documentId ?? item.id) === String(id));

  if (!registration) notFound();

  async function updateRegistration(formData: FormData) {
    "use server";

    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email") || undefined,
      age: Number(formData.get("age") || 0) || undefined,
      role: formData.get("role"),
      basePrice: Number(formData.get("basePrice") || 0),
      transactionId: formData.get("transactionId") || undefined,
      address: formData.get("address") || undefined,
      experience: formData.get("experience") || undefined,
    };

    const response = await fetch(`${strapiUrl}/api/registrations/${id}`, {
      method: "PUT",
      headers: await getStrapiAuthHeaders(),
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error("Could not update registration.");
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
        <input className={inputClass} name="transactionId" defaultValue={registration.transactionId} placeholder="Transaction ID" />

        <textarea className={textareaClass} name="address" defaultValue={registration.address} placeholder="Address" />
        <textarea className={textareaClass} name="experience" defaultValue={registration.experience} placeholder="Experience" />

        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-600 px-5 text-sm font-bold text-white">
            Save changes
          </button>
          <a className="inline-flex h-11 items-center justify-center rounded-md border px-5 text-sm font-bold text-slate-700" href="/dashboard/registrations">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
