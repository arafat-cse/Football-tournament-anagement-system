import { notFound } from "next/navigation";
import { Gavel, Trophy, User } from "lucide-react";
import { getAuctions, getTournamentBySlug } from "@/data/tournament/api";

export default async function AuctionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) notFound();

  const auctions = await getAuctions(slug);
  const liveAuction = auctions.find((a) => a.displayStatus === "live");
  const player = liveAuction?.player;

  return (
    <div className="pb-20">
      <div className="relative h-30 w-full overflow-hidden bg-slate-900 md:h-56">
        {tournament.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tournament.bannerUrl} alt={tournament.name} className="h-full w-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-heading text-5xl font-black text-white md:text-4xl">Player Auction</p>
        </div>
      </div>

      <div className="container relative -mt-10 mb-10 text-center">
        <div className="inline-block rounded-2xl bg-white px-8 py-6 shadow-xl ring-1 ring-slate-100">
          <h1 className="font-heading text-3xl font-black text-slate-900 md:text-4xl">{tournament.name}</h1>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Live Player Auction Session</p>
          </div>
        </div>
      </div>

      <div className="container">

      {!liveAuction ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-20 text-center">
          <h2 className="text-xl font-bold text-slate-400">No live auction session currently active.</h2>
          <p className="mt-2 text-sm text-slate-400 text-center">Please check back later or contact the administrator.</p>
        </div>
      ) : !player ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-20 text-center">
          <h2 className="text-xl font-bold text-slate-400">Waiting for next player...</h2>
          <p className="mt-2 text-sm text-slate-400 text-center">The administrator is preparing the next player for bidding.</p>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-100">
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-square bg-slate-900 md:aspect-auto">
              {player.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={player.photoUrl} alt={player.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-700">
                  <User className="size-32 opacity-20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">{player.role}</p>
                <h2 className="font-heading text-3xl font-black">{player.name}</h2>
              </div>
            </div>
            
            <div className="flex flex-col p-8 md:p-12">
              <div className="flex-1">
                <div className="mb-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 bg-amber-50 px-3 py-1 rounded-full ring-1 ring-amber-100">Current Player</span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-black text-slate-900">৳{player.basePrice}</span>
                    <span className="text-sm font-bold text-slate-400">Base Price</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Experience</p>
                      <p className="mt-1 font-bold text-slate-700">{player.experience || "Not specified"}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Age</p>
                      <p className="mt-1 font-bold text-slate-700">{player.age || "N/A"}</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-emerald-50 p-6 ring-1 ring-emerald-100">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Trophy className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-900">Auction Pool</h4>
                        <p className="text-sm text-emerald-700">বর্তমানে নিলামের জন্য উপলব্ধ। দলগুলো তাদের স্কোয়াডের জন্য এই খেলোয়াড়কে বেছে নিতে পারে।</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 space-y-4">
                <div className="flex items-center justify-between border-t pt-6 text-sm">
                  <span className="text-slate-500 italic">Admin controlled auction session</span>
                  <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                    <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                    Live Connection
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
