import type { Metadata } from "next";
import { EditorialHero, SourceNote } from "@/components/editorial-layout";
import { GamePanel } from "@/components/design";

export const metadata: Metadata = { title: "Come funziona il ranking FIP 2026 — Paideio" };

export default function RankingGuidePage() {
  return (
    <div>
      <EditorialHero
        kicker="Circuito · Verificato 26/07/2026"
        title="Ranking e Race non sono la stessa cosa"
        description="Due classifiche utili per rispondere a domande diverse: valore mondiale nel tempo e rendimento nella stagione 2026."
        asset="ball"
      />
      <div className="mx-auto grid max-w-5xl gap-6 px-5 py-12 md:grid-cols-2 md:px-8">
        <GamePanel className="p-6">
          <h2 className="font-heading text-2xl font-bold text-calce">Ranking FIP</h2>
          <p className="mt-3 leading-relaxed text-nebbia">Considera i migliori 22 risultati ottenuti tra Premier Padel e CUPRA FIP Tour in una finestra mobile di 52 settimane.</p>
        </GamePanel>
        <GamePanel tone="cyan" className="p-6">
          <h2 className="font-heading text-2xl font-bold text-calce">Race 2026</h2>
          <p className="mt-3 leading-relaxed text-nebbia">Conta i migliori 22 risultati ottenuti soltanto durante la stagione 2026 e racconta la corsa dell’anno in corso.</p>
        </GamePanel>
        <div className="md:col-span-2"><SourceNote href="https://www.padelfip.com/ranking-system-points-breakdown/">Sistema punti ufficiale FIP</SourceNote></div>
      </div>
    </div>
  );
}
