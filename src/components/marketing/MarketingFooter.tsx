import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";
import { Mail, Phone, MapPin } from "lucide-react";

export async function MarketingFooter() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .single<SiteSettings>();

  const hasContact = settings?.contact_email || settings?.contact_phone || settings?.contact_address;

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo />
          <p className="text-xs text-ink-faint">
            © {new Date().getFullYear()} WorkGPT. Tous droits réservés.
          </p>
        </div>

        {hasContact ? (
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-border pt-6 text-sm text-ink-soft sm:justify-start">
            {settings?.contact_email ? (
              <a
                href={`mailto:${settings.contact_email}`}
                className="flex items-center gap-2 transition-colors duration-150 hover:text-ink"
              >
                <Mail className="h-4 w-4 text-accent-strong" />
                {settings.contact_email}
              </a>
            ) : null}
            {settings?.contact_phone ? (
              <a
                href={`tel:${settings.contact_phone}`}
                className="flex items-center gap-2 transition-colors duration-150 hover:text-ink"
              >
                <Phone className="h-4 w-4 text-accent-strong" />
                {settings.contact_phone}
              </a>
            ) : null}
            {settings?.contact_address ? (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent-strong" />
                {settings.contact_address}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
