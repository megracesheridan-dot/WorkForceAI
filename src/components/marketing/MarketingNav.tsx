import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
          <a href="#how-it-works" className="transition-colors duration-150 hover:text-ink">
            Comment ça marche
          </a>
          <a href="#workforce" className="transition-colors duration-150 hover:text-ink">
            AI Workforce
          </a>
          <a href="#why" className="transition-colors duration-150 hover:text-ink">
            Pourquoi WorkGPT
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="px-4 py-2 text-sm">
              Se connecter
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="px-4 py-2 text-sm">Créer mon Workforce</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
