import type { Metadata } from "next";
import { EditorialHero, EditorialSectionGrid } from "@/components/editorial-layout";
import { CIRCUIT_SECTIONS } from "@/lib/editorial-content";

export const metadata: Metadata = { title: "Circuito professionistico di padel — Paideio" };

export default function CircuitoPage() {
  return (
    <div>
      <EditorialHero
        kicker="Circuito professionistico"
        title="Segui il gioco al livello più alto"
        description="Ranking mondiale FIP, Race 2026 e calendario Premier Padel spiegati senza confondere circuiti e classifiche."
        asset="playerSmash"
      />
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <EditorialSectionGrid items={CIRCUIT_SECTIONS} />
      </div>
    </div>
  );
}
