import { notFound } from "next/navigation";
import { connection } from "next/server";
import { RegistrationForm } from "@/components/sports/forms";
import { getTournamentBySlug } from "@/data/tournament/api";

export default async function RegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) notFound();
  return (
    <section className="container py-10">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase text-emerald-700">{tournament.name}</p>
        <h1 className="font-heading text-4xl font-black">Player registration</h1>
      </div>
      {tournament.status === "registration_open" ? (
        <RegistrationForm
          fee={tournament.registrationFee}
          registrationInstruction={tournament.registrationInstruction}
          tournamentId={tournament.id}
          tournamentDocId={tournament.documentId}
          tournamentSlug={slug}
          tournamentName={tournament.name}
        />
      ) : (
        <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <h2 className="font-heading text-2xl font-black text-slate-800">Registration is closed</h2>
          <p className="mt-2 text-slate-600">This tournament is no longer accepting new player registrations.</p>
        </div>
      )}
    </section>
  );
}
