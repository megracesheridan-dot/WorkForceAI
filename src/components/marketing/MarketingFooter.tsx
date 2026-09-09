import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";
import { Mail, MessageCircle, MessageSquare, Phone, Send, MapPin } from "lucide-react";

export async function MarketingFooter() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .single<SiteSettings>();

  const hasContact =
    (settings?.show_email && settings.contact_email) ||
    (settings?.show_phone && settings.contact_phone) ||
    settings?.contact_address ||
    (settings?.show_telegram && settings.contact_telegram) ||
    (settings?.show_whatsapp && settings.contact_whatsapp) ||
    (settings?.show_live_chat && settings.contact_live_chat);

  return (
    <footer className="relative z-10 border-t border-border bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo />
          <p className="text-xs text-ink-faint">
            © {new Date().getFullYear()} WorkGPT. Tous droits réservés.
          </p>
        </div>

        {hasContact ? (
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-border pt-6 text-sm text-ink-soft sm:justify-start">
            {settings?.show_email && settings.contact_email ? (
              <a
                href={`mailto:${settings.contact_email}`}
                className="flex items-center gap-2 transition-colors duration-150 hover:text-ink"
              >
                <Mail className="h-4 w-4 text-accent-strong" />
                {settings.contact_email}
              </a>
            ) : null}
            {settings?.show_phone && settings.contact_phone ? (
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
            {settings?.show_telegram && settings.contact_telegram ? (
              <a href={settings.contact_telegram.startsWith("http") ? settings.contact_telegram : `https://t.me/${settings.contact_telegram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 transition-colors duration-150 hover:text-ink"><Send className="h-4 w-4 text-accent-strong" />Telegram</a>
            ) : null}
            {settings?.show_whatsapp && settings.contact_whatsapp ? (
              <a href={settings.contact_whatsapp.startsWith("http") ? settings.contact_whatsapp : `https://wa.me/${settings.contact_whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 transition-colors duration-150 hover:text-ink"><MessageCircle className="h-4 w-4 text-accent-strong" />WhatsApp</a>
            ) : null}
            {settings?.show_live_chat && settings.contact_live_chat ? (
              <a href={settings.contact_live_chat} target="_blank" rel="noreferrer" className="flex items-center gap-2 transition-colors duration-150 hover:text-ink"><MessageSquare className="h-4 w-4 text-accent-strong" />Live chat</a>
            ) : null}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
