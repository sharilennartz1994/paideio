import type { Metadata } from "next";
import { CoachClose, EditorialHero, SourceNote } from "@/components/editorial-layout";
import { AcademyIntro, Callout, NextLesson } from "@/components/academy/academy-ui";

export const metadata: Metadata = { title: "Storia e cultura del padel - Paideio Academy" };

const EVENTS = [
  ["1969", "Acapulco", "Enrique Corcuera adatta lo spazio della propria casa e dà forma al primo campo."],
  ["Anni ’70", "Spagna e Argentina", "Il gioco attraversa l’Atlantico e trova due culture sportive decisive."],
  ["1991", "Nasce la FIP", "La federazione internazionale costruisce una governance comune."],
  ["1997", "Regole unificate", "Il nome e il regolamento trovano una base internazionale condivisa."],
  ["2022", "Premier Padel", "Inizia una nuova fase globale del circuito professionistico."],
] as const;

export default function StoriaCulturaPage() {
  return (
    <div>
      <EditorialHero
        kicker="Academy · Storia e cultura"
        title="Uno sport giovane con memoria"
        description="Messico, Spagna, Argentina e Italia: il padel è cresciuto perché il campo è diventato un luogo di relazione."
        asset="ball"
      />
      <div className="mx-auto max-w-5xl space-y-10 px-5 py-12 md:px-8 md:py-16">
        <AcademyIntro title="Una storia di adattamento e scambio">
          <p>
            Il padel nasce da uno spazio domestico trasformato in campo e cresce viaggiando tra comunità
            sportive. La sua cultura conserva questa origine: vicinanza, coppia e relazione fanno parte del
            gioco quanto pareti e racchetta.
          </p>
        </AcademyIntro>
        <div className="divide-y divide-nebbia/20 border-y border-nebbia/20">
          {EVENTS.map(([year, place, body]) => (
            <article key={year} className="grid gap-2 py-6 md:grid-cols-[120px_180px_1fr]">
              <strong className="font-heading text-2xl text-accent-ball-ink">{year}</strong>
              <h2 className="font-heading text-lg font-bold text-calce">{place}</h2>
              <p className="leading-relaxed text-nebbia">{body}</p>
            </article>
          ))}
        </div>
        <section className="grid gap-8 border-y border-nebbia/20 py-8 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl font-bold text-calce">Perché si gioca in coppia</h2>
            <p className="mt-3 leading-relaxed text-nebbia">
              Il campo 20 × 10 m, le pareti e la rete costruiscono un problema condiviso: coprire lo spazio,
              comunicare e alternare iniziativa e sostegno. La coppia non è soltanto il formato, è l’unità
              tattica del padel.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-calce">La cultura del terzo tempo</h2>
            <p className="mt-3 leading-relaxed text-nebbia">
              Club e circoli hanno reso il padel accessibile anche perché una partita organizza relazione prima,
              durante e dopo il campo. Competizione e convivialità convivono senza cancellare rispetto e cura
              degli spazi comuni.
            </p>
          </div>
        </section>
        <Callout tone="info" title="Fonti e memoria">
          Le ricostruzioni storiche possono semplificare passaggi e date. Questa timeline segue la sintesi
          ufficiale FIP; per approfondire, consulta direttamente la fonte.
        </Callout>
        <div><SourceNote href="https://www.padelfip.com/history/">Storia ufficiale FIP</SourceNote></div>
        <NextLesson
          href="/academy"
          label="Torna ai percorsi"
          description="Porta questa cultura nei moduli di tecnica, tattica e preparazione."
        />
        <CoachClose title="Continua la storia sul campo" />
      </div>
    </div>
  );
}
