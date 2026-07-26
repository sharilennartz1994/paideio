import type { Metadata } from "next";
import { EditorialHero, SourceNote } from "@/components/editorial-layout";
import { GameBadge } from "@/components/design";

export const metadata: Metadata = { title: "Classifiche mondiali FIP 2026 — Paideio" };

const MEN = [["1", "Arturo Coello", "21.337"], ["1", "Agustín Tapia", "21.337"], ["3", "Ale Galán", "17.394"], ["3", "Fede Chingotto", "17.394"]];
const WOMEN = [["1", "Gemma Triay", "18.257"], ["1", "Delfi Brea", "18.257"], ["3", "Bea González", "14.469"], ["4", "Ari Sánchez", "14.274"]];

function Ranking({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <section>
      <h2 className="font-heading text-2xl font-bold text-calce">{title}</h2>
      <div className="mt-4 divide-y divide-nebbia/18 border-y border-nebbia/18">
        {rows.map(([rank, name, points]) => (
          <div key={name} className="grid grid-cols-[48px_1fr_auto] items-center gap-4 py-4">
            <span className="font-heading text-xl text-accent-ball-ink">{rank}</span>
            <strong className="text-calce">{name}</strong>
            <span className="font-heading tabular-nums text-vetro">{points} pt</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ClassifichePage() {
  return (
    <div>
      <EditorialHero
        kicker="Circuito · Snapshot ufficiale"
        title="Classifica mondiale FIP"
        description="Premier Padel e CUPRA FIP Tour contribuiscono allo stesso ranking mondiale. Questi dati sono uno snapshot editoriale."
        asset="ball"
      />
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
        <GameBadge tone="success">Fonte FIP · aggiornato al 20/07/2026</GameBadge>
        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <Ranking title="Uomini" rows={MEN} />
          <Ranking title="Donne" rows={WOMEN} />
        </div>
        <div className="mt-8"><SourceNote href="https://www.padelfip.com/fip-rankings/">Apri la classifica completa FIP</SourceNote></div>
      </div>
    </div>
  );
}
