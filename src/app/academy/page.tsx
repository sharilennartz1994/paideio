import type { Metadata } from "next";
import { EditorialHero, EditorialSectionGrid } from "@/components/editorial-layout";
import { GameCta } from "@/components/design";
import { AcademyIntro, LearningPath } from "@/components/academy/academy-ui";
import { ACADEMY_SECTIONS } from "@/lib/editorial-content";

export const metadata: Metadata = {
  title: "Academy — Impara il padel | Paideio",
  description: "Tecnica, strategia, regole, preparazione, attrezzatura e cultura del padel.",
};

export default function AcademyPage() {
  return (
    <div>
      {/* THESIS: imparare il padel è un percorso collegato al campo, non un archivio di articoli. OWN-WORLD: Game Arena dark, liste HUD e asset reali. STORY: scegli un'area, capisci cosa allenare, trova un coach. FIRST VIEWPORT: promessa a sinistra, racchetta a destra, CTA percorso. FORM: hub editoriale Read dentro il sistema esistente. */}
      <EditorialHero
        kicker="Paideio Academy"
        title="Capisci il gioco. Poi trasformalo."
        description="Percorsi chiari per leggere meglio il padel, allenare la tecnica e arrivare alla prossima lezione con una domanda precisa."
        asset="racket"
      >
        <GameCta href="/academy/tecnica" tone="ball" showBall arrow>Esplora i colpi</GameCta>
        <GameCta href="/academy/regole" tone="outline" arrow>Regole 2026</GameCta>
      </EditorialHero>
      <div className="mx-auto max-w-7xl space-y-14 px-5 py-12 md:px-8 md:py-16">
        <AcademyIntro title="Non leggere tutto. Parti dal tuo punto.">
          <p>
            Se stai iniziando, costruisci controllo e posizione prima dei colpi spettacolari. Se giochi già,
            identifica una situazione che perdi spesso e segui il percorso fino a un esercizio misurabile.
          </p>
          <p>
            Ogni modulo distingue ciò che devi capire, ciò che devi provare e il segnale che indica se il gesto
            sta funzionando. La correzione individuale resta compito del coach.
          </p>
        </AcademyIntro>
        <section>
          <p className="font-heading text-xs font-bold text-accent-cyan-ink uppercase">Percorso consigliato</p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-calce">Dal controllo alla scelta</h2>
          <div className="mt-6">
            <LearningPath
              steps={[
                {
                  label: "Base",
                  title: "Muoviti e controlla",
                  description: "Posizione d’attesa, split step, colpi compatti e uso del vetro.",
                  href: "/academy/tecnica",
                },
                {
                  label: "Lettura",
                  title: "Occupa lo spazio",
                  description: "Muoviti con il compagno e riconosci quando difendere, transitare o attaccare.",
                  href: "/academy/strategia",
                },
                {
                  label: "Prestazione",
                  title: "Ripeti con qualità",
                  description: "Prepara frenate, accelerazioni e recupero per mantenere lucidità nel punto.",
                  href: "/academy/training",
                },
              ]}
            />
          </div>
        </section>
        <section>
          <p className="font-heading text-xs font-bold text-accent-cyan-ink uppercase">Biblioteca di campo</p>
          <h2 className="mt-2 mb-7 font-heading text-3xl font-bold text-calce">Scegli cosa migliorare oggi</h2>
          <EditorialSectionGrid items={ACADEMY_SECTIONS} />
        </section>
      </div>
    </div>
  );
}
