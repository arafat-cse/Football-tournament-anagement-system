import type { Sponsor } from "@/data/tournament/types";

export function SponsorSection({ sponsors }: { sponsors: Sponsor[] }) {
  if (!sponsors.length) return null;

  const titleSponsor = sponsors.find((s) => s.tier === "title");
  const others = sponsors.filter((s) => s.tier !== "title");

  return (
    <div className="mt-12 border-t pt-10">
      <h2 className="text-center font-heading text-2xl font-black text-slate-900">Our Proud Sponsors</h2>
      <p className="mt-2 text-center text-sm text-slate-500 uppercase tracking-widest font-bold">Supporting the game</p>
      
      {titleSponsor && (
        <div className="mt-8 flex flex-col items-center">
          <span className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full ring-1 ring-emerald-100">Title Sponsor</span>
          <SponsorLogo sponsor={titleSponsor} isTitle />
        </div>
      )}

      {others.length > 0 && (
        <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16">
          {others.map((sponsor) => (
            <SponsorLogo key={sponsor.id} sponsor={sponsor} />
          ))}
        </div>
      )}
    </div>
  );
}

function SponsorLogo({ sponsor, isTitle }: { sponsor: Sponsor; isTitle?: boolean }) {
  const content = (
    <div className={`flex flex-col items-center group transition-all duration-300 hover:scale-105 ${isTitle ? 'max-w-[280px]' : 'max-w-[140px]'}`}>
      <div className={`flex items-center justify-center overflow-hidden rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-100 transition-shadow group-hover:shadow-md group-hover:ring-emerald-100 ${isTitle ? 'h-32 w-64' : 'h-16 w-32'}`}>
        {sponsor.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sponsor.logoUrl} alt={sponsor.name} className="h-full w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500" />
        ) : (
          <span className="font-heading font-black text-slate-300 group-hover:text-emerald-500 transition-colors">{sponsor.name}</span>
        )}
      </div>
      <span className={`mt-3 font-bold uppercase tracking-tighter transition-colors group-hover:text-emerald-600 ${isTitle ? 'text-sm' : 'text-[10px]'} ${sponsor.website ? 'text-slate-500' : 'text-slate-400'}`}>
        {sponsor.name}
      </span>
    </div>
  );

  if (sponsor.website) {
    const url = sponsor.website.startsWith("http") ? sponsor.website : `https://${sponsor.website}`;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
        {content}
      </a>
    );
  }

  return content;
}
