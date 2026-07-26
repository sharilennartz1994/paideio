import type { Metadata } from "next";
import {
  BellRing,
  ClipboardCheck,
  Lightbulb,
  Network,
  Share2,
  Trophy,
} from "@/components/icons/paideio-icons";
import { EditorialHero } from "@/components/editorial-layout";
import { ReleaseFeedbackForm } from "@/components/release-feedback-form";

export const metadata: Metadata = {
  title: "Prossime release — Paideio",
  description: "Scopri cosa stiamo preparando per coach e giocatori e proponi la prossima evoluzione di Paideio.",
};

const RELEASES = [
  {
    icon: ClipboardCheck,
    marker: "Coach tools · In progettazione",
    title: "Scheda di valutazione tecnica",
    description:
      "Il coach potrà valutare i colpi del giocatore, annotare osservazioni e trasformarle in obiettivi concreti per le lezioni successive.",
    details: ["Valutazione colpo per colpo", "Note private del coach", "Obiettivi per il prossimo allenamento"],
  },
  {
    icon: Trophy,
    marker: "Eventi · In esplorazione",
    title: "Tornei e americane",
    description:
      "I coach potranno creare un torneo o un’americana scegliendo club, orario e modalità, poi invitare direttamente i propri allievi.",
    details: ["Club e fascia oraria", "Formato e modalità di gioco", "Inviti agli allievi"],
  },
  {
    icon: Share2,
    marker: "Community · Prossimo set",
    title: "Condivisione dei profili coach",
    description:
      "Una condivisione più efficace aiuterà amici e conoscenti a ritrovarsi sullo stesso coach e organizzare lezioni di gruppo.",
    details: ["Link condivisibili", "Inviti tra conoscenti", "Ingresso rapido nel gruppo"],
  },
  {
    icon: BellRing,
    marker: "Notifiche · Evoluzione continua",
    title: "Aggiornamenti più intelligenti",
    description:
      "Continueremo a migliorare il centro notifiche con preferenze, promemoria utili e aggiornamenti più precisi sul ciclo della lezione.",
    details: ["Preferenze personali", "Promemoria prima della lezione", "Stati più dettagliati"],
  },
] as const;

export default function ProssimeReleasePage() {
  return (
    <div>
      <EditorialHero
        kicker="Paideio · Roadmap"
        title="Il prossimo set si costruisce insieme"
        description="Queste sono le direzioni su cui stiamo lavorando. Non sono promesse con una data finta: sono problemi reali che vogliamo risolvere bene."
        asset="tacticsBoard"
        showSectionNav={false}
      />

      <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
        <section aria-labelledby="roadmap-title">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="ui-kicker">Roadmap aperta</p>
              <h2 id="roadmap-title" className="editorial-title mt-3 max-w-3xl text-4xl text-calce md:text-5xl">
                Quattro evoluzioni, un solo obiettivo: giocare e allenare meglio.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-nebbia">
              Ordine e contenuti possono cambiare in base ai test e ai contributi della community.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {RELEASES.map(({ icon: Icon, marker, title, description, details }, index) => (
              <article key={title} className="card-clip border-t-2 border-game-cyan/55 bg-carta-alta p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-12 items-center justify-center bg-game-blue text-game-white">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <span className="font-heading text-4xl font-bold text-nebbia/25">0{index + 1}</span>
                </div>
                <p className="mt-6 font-heading text-[10px] font-bold tracking-[0.08em] text-accent-cyan-ink uppercase">
                  {marker}
                </p>
                <h3 className="mt-2 font-heading text-2xl font-bold text-calce">{title}</h3>
                <p className="mt-3 leading-relaxed text-nebbia">{description}</p>
                <ul className="mt-5 grid gap-2 border-t border-nebbia/18 pt-5">
                  {details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2 text-sm text-nebbia">
                      <span className="size-1.5 bg-game-ball" aria-hidden />
                      {detail}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-8 border border-game-cyan/35 bg-carta-bassa p-6 md:grid-cols-[0.8fr_1.2fr] md:p-10" aria-labelledby="feedback-title">
          <div>
            <span className="flex size-14 items-center justify-center bg-game-ball text-game-ink">
              <Lightbulb className="size-7" aria-hidden />
            </span>
            <p className="ui-kicker mt-6">La tua idea conta</p>
            <h2 id="feedback-title" className="editorial-title mt-3 text-4xl text-calce">
              Cosa dovrebbe entrare nel prossimo set?
            </h2>
            <p className="mt-4 leading-relaxed text-nebbia">
              Segnala una funzionalità, un miglioramento o un bug. La richiesta viene salvata nel backlog Paideio e,
              quando il canale email sarà attivo, notificata al team su <strong className="text-calce">info@playpaideio.com</strong>.
            </p>
            <p className="mt-5 flex items-center gap-2 text-sm text-nebbia">
              <Network className="size-4 text-accent-cyan-ink" aria-hidden />
              Niente voti finti: useremo i contributi per decidere cosa validare prima.
            </p>
          </div>
          <div className="border border-nebbia/22 bg-carta-alta p-5 md:p-7">
            <ReleaseFeedbackForm />
          </div>
        </section>
      </div>
    </div>
  );
}
