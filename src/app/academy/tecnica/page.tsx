import type { Metadata } from "next";
import { CoachClose, EditorialHero } from "@/components/editorial-layout";
import {
  AcademyIntro,
  AcademyVisual,
  DoDont,
  LessonBlock,
  LessonColumns,
  NextLesson,
} from "@/components/academy/academy-ui";
import { GameBadge, GameCta } from "@/components/design";
import { SHOTS } from "@/lib/editorial-content";

export const metadata: Metadata = { title: "Tecnica e colpi del padel — Paideio Academy" };

export default function TecnicaPage() {
  return (
    <div>
      <EditorialHero
        kicker="Academy · Tecnica"
        title="L’arsenale dei colpi"
        description="Dai fondamentali alle soluzioni avanzate: cosa serve, quando usarlo e quale gesto allenare dopo."
        asset="playerSmash"
      />
      <div className="mx-auto max-w-6xl space-y-10 px-5 py-12 md:px-8 md:py-16">
        <AcademyIntro title="Prima il controllo, poi la velocità">
          <p>
            Nel padel il gesto utile è spesso corto: prepara presto, impatta davanti al corpo e recupera una
            posizione da cui puoi giocare la palla successiva.
          </p>
          <p>
            Allena un solo obiettivo per serie. Se la palla entra ma perdi equilibrio o posizione, il risultato
            non è ancora stabile.
          </p>
        </AcademyIntro>

        <LessonBlock
          title="Fondamentali da fondo"
          subtitle="Posizione d’attesa, diritto e rovescio costruiscono il tempo necessario per leggere pareti e avversari."
        >
          <LessonColumns
            principle="Racchetta davanti, appoggi attivi e preparazione compatta. Il bersaglio iniziale è profondo e centrale, non la riga."
            practice="Scambia in diagonale a velocità controllata: 10 palle consecutive oltre la linea del servizio, recuperando il centro del tuo spazio."
            check="Riesci a preparare prima del rimbalzo e a terminare ogni colpo in equilibrio, senza arretrare dopo l’impatto."
          />
          <div className="mt-7">
            <DoDont
              doItems={[
                "Ruota spalle e busto mantenendo la testa stabile.",
                "Lascia spazio tra corpo e palla per un impatto comodo.",
              ]}
              dontItems={[
                "Aprire troppo il movimento e arrivare tardi.",
                "Cercare potenza mentre gli appoggi stanno ancora scappando indietro.",
              ]}
            />
          </div>
        </LessonBlock>

        <LessonBlock
          title="Volée e conquista della rete"
          subtitle="La volée serve a togliere tempo e mantenere posizione: non deve essere sempre un colpo vincente."
          level="Intermedio"
        >
          <LessonColumns
            principle="Split step quando l’avversario impatta, gesto breve e punto di contatto davanti. La racchetta accompagna, non carica."
            practice="Una coppia difende e una attacca: gioca 6 volée dirette al centro o ai piedi, poi cambia ruolo."
            check="Dopo l’impatto resti vicino al compagno e pronto al lob, senza invadere il suo corridoio."
          />
          <div className="mt-7">
            <DoDont
              doItems={[
                "Usa le gambe per portare il corpo verso la palla.",
                "Mantieni una distanza simile dalla rete rispetto al compagno.",
              ]}
              dontItems={[
                "Fare uno swing ampio come nel diritto da fondo.",
                "Chiudere troppo la rete lasciando scoperto il lob.",
              ]}
            />
          </div>
        </LessonBlock>

        <LessonBlock
          title="Parete e uscita di vetro"
          subtitle="Il vetro non è un ostacolo: è tempo aggiuntivo, se lasci passare la palla e prepari la distanza corretta."
          level="Intermedio"
        >
          <LessonColumns
            principle="Riconosci traiettoria e velocità prima di decidere se giocare prima o dopo il vetro. Muoviti con passi piccoli, senza restare incollato alla parete."
            practice="Il coach alimenta 8 palle: alterna uscita dopo parete e palla giocata prima del vetro, dichiarando la scelta ad alta voce."
            check="La palla resta davanti al corpo dopo il vetro e puoi indirizzarla alta o bassa senza colpirla mentre arretri."
          />
        </LessonBlock>

        <section>
          <AcademyVisual
            asset="smashTrail"
            title="Leggi prima la traiettoria"
            caption="La scia visualizza intenzione e uscita della palla: è un supporto editoriale per discutere direzione, margine e recupero della posizione."
            className="mb-8"
          />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-heading text-xs font-bold text-accent-cyan-ink uppercase">Mappa dei colpi</p>
              <h2 className="mt-2 font-heading text-3xl font-bold text-calce">Cosa viene dopo</h2>
            </div>
            <GameCta href="/cerca" tone="quiet" size="compact" arrow>Allenali con un coach</GameCta>
          </div>
          <div className="mt-6 divide-y divide-nebbia/18 border-y border-nebbia/18">
            {SHOTS.map(([title, level, description]) => (
              <article key={title} className="grid gap-3 py-5 md:grid-cols-[150px_220px_1fr] md:items-center">
                <GameBadge tone={level === "Fondamentale" ? "info" : level === "Intermedio" ? "pending" : "neutral"}>
                  {level}
                </GameBadge>
                <h3 className="font-heading text-lg font-bold text-calce">{title}</h3>
                <p className="leading-relaxed text-nebbia">{description}</p>
              </article>
            ))}
          </div>
        </section>
        <NextLesson
          href="/academy/strategia"
          label="Vai alla strategia"
          description="Ora collega il gesto alla posizione e alla decisione della coppia."
        />
        <CoachClose title="Un colpo si impara facendolo vedere" />
      </div>
    </div>
  );
}
