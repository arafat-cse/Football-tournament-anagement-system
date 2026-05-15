import { notFound } from "next/navigation";
import { RegistrationForm } from "@/components/sports/forms";
import { getTournamentBySlug } from "@/data/tournament/api";

export default async function RegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) notFound();
  return (
    <section className="container py-10">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase text-emerald-700">{tournament.name}</p>
        <h1 className="font-heading text-4xl font-black">Player registration</h1>
      </div>
      <RegistrationForm fee={tournament.registrationFee} />
    </section>
  );
}
