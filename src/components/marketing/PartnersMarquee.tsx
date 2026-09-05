import { createClient } from "@/lib/supabase/server";
import type { PartnerLogo } from "@/lib/types";

export async function PartnersMarquee() {
  const supabase = await createClient();
  const { data: partners } = await supabase
    .from("partner_logos")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .returns<PartnerLogo[]>();

  const list = partners ?? [];
  if (!list.length) return null;

  const urls = list.map((p) => ({
    ...p,
    url: supabase.storage.from("partner-logos").getPublicUrl(p.logo_path).data.publicUrl,
  }));
  const loop = [...urls, ...urls];

  return (
    <section className="border-t border-border py-14">
      <p className="mx-auto mb-8 max-w-6xl px-6 font-mono text-xs uppercase tracking-widest text-ink-faint">
        Partenaires
      </p>
      <div className="relative overflow-hidden">
        <div className="marquee-track flex w-max items-center gap-16">
          {loop.map((p, i) => (
            <a
              key={`${p.id}-${i}`}
              href={p.website_url ?? undefined}
              target={p.website_url ? "_blank" : undefined}
              rel={p.website_url ? "noreferrer" : undefined}
              className="flex shrink-0 items-center opacity-70 grayscale transition-all duration-150 hover:opacity-100 hover:grayscale-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.name} className="h-8 w-auto object-contain" />
            </a>
          ))}
        </div>
      </div>
      <style>{`
        .marquee-track {
          animation: marquee-scroll 40s linear infinite;
        }
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
