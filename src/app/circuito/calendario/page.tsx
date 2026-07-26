import type { Metadata } from "next";
import { Checklist, EditorialHero, SourceNote } from "@/components/editorial-layout";

export const metadata: Metadata = { title: "Calendario Premier Padel 2026 — Paideio" };

export default function CalendarioPage() {
  return (
    <div>
      <EditorialHero
        kicker="Circuito · Verificato 26/07/2026"
        title="Major, P1 e P2"
        description="Il calendario può cambiare durante la stagione: qui trovi le categorie e il collegamento alla fonte ufficiale aggiornata."
        asset="racket"
      />
      <div className="mx-auto max-w-5xl px-5 py-12 md:px-8">
        <Checklist items={[
          "Major: gli appuntamenti di massimo peso del circuito Premier Padel.",
          "P1: tornei di prima fascia distribuiti nella stagione.",
          "P2: tappe più compatte ma pienamente inserite nel circuito.",
          "La stagione 2026 comprende tappe in categorie Major, P1 e P2.",
          "Pretoria è passata da P2 a P1 e Kuwait da P1 a Major durante la stagione.",
          "Date, categoria e stato dell’evento vanno sempre verificati sulla pagina ufficiale.",
        ]} />
        <div className="mt-8"><SourceNote href="https://www.padelfip.com/calendar-premier-padel/?events-year=2026">Calendario Premier Padel ufficiale 2026</SourceNote></div>
      </div>
    </div>
  );
}
