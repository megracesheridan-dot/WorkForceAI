import Link from "next/link";
import { Card, Button } from "@/components/ui";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Card accent className="flex flex-col items-center gap-4 py-14 text-center">
        <h2 className="font-display text-3xl font-bold">Prêt à déployer ton Workforce ?</h2>
        <p className="max-w-md text-ink-soft">
          200 crédits de démarrage, aucune carte bancaire requise.
        </p>
        <Link href="/signup">
          <Button className="px-6 py-3 text-base">Créer mon Workforce</Button>
        </Link>
      </Card>
    </section>
  );
}
