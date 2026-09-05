import { Logo } from "@/components/Logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <Logo />
        <p className="text-xs text-ink-faint">
          © {new Date().getFullYear()} WorkGPT. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
