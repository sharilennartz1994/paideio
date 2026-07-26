import type { Metadata } from "next";
import { CoachClose, EditorialHero } from "@/components/editorial-layout";
import {
  AcademyIntro,
  AcademyVisual,
  Callout,
  LessonBlock,
  LessonColumns,
  NextLesson,
  SessionPlan,
} from "@/components/academy/academy-ui";

export const metadata: Metadata = { title: "Training e fitness per il padel — Paideio Academy" };

export default function TrainingPage() {
  return (
    <div>
      <EditorialHero
        kicker="Academy · Training"
        title="Preparati al punto successivo"
        description="Forza, mobilità e capacità di ripetere accelerazioni e frenate senza perdere qualità nel gioco."
        asset="backpack"
      />
      <div className="mx-auto max-w-6xl space-y-10 px-5 py-12 md:px-8 md:py-16">
        <AcademyIntro title="Allenati per arrivare bene sulla palla">
          <p>
            Il lavoro fisico per il padel sostiene accelerazioni brevi, frenate, rotazioni e recuperi ripetuti.
            La qualità viene prima del volume: aumenta difficoltà soltanto quando controlli appoggi e postura.
          </p>
        </AcademyIntro>

        <LessonBlock
          title="Split step e primo passo"
          subtitle="Un piccolo atterraggio sincronizzato con l’impatto avversario prepara il corpo a partire in qualunque direzione."
        >
          <AcademyVisual
            asset="splitStep"
            title="Il fotogramma dell’atterraggio"
            caption="L’immagine rappresenta la fase di atterraggio, non una posa da mantenere: appoggi comodi, ginocchia morbide e busto pronto a reagire subito dopo l’impatto avversario."
            className="mb-7"
          />
          <LessonColumns
            principle="Atterra sugli avampiedi con base comoda e ginocchia morbide. La direzione nasce dalla lettura della palla, non da saltelli continui."
            practice="Con due cinesini a destra e sinistra, reagisci al segnale del compagno: split step, primo passo, tocco del cono e recupero."
            check="Parti senza incrociare subito i piedi e riesci a frenare mantenendo ginocchio e piede orientati nella stessa direzione."
          />
        </LessonBlock>

        <LessonBlock
          title="Frenate e cambi di direzione"
          subtitle="Decelerare bene permette di arrivare in equilibrio, colpire e ripartire senza disperdere tempo."
          level="Intermedio"
        >
          <AcademyVisual
            asset="changeDirectionPlayer"
            title="Frena prima di ripartire"
            caption="La giocatrice usa più appoggi per frenare e orientarsi. Il cambio efficace è una sequenza di decelerazione, controllo e spinta, non un taglio rigido su un solo piede."
            className="mb-7"
          />
          <LessonColumns
            principle="Abbassa gradualmente il baricentro, usa più passi di frenata e mantieni il busto controllato prima della nuova accelerazione."
            practice="Navetta a T con cinesini: avanti, laterale, ritorno al centro. Lavora 15 secondi e recupera 45, per 4–6 serie."
            check="Il piede non collassa verso l’interno, il busto non supera gli appoggi e l’ultima ripetizione resta simile alla prima."
          />
        </LessonBlock>

        <section className="grid gap-5 md:grid-cols-3">
          {[
            ["markerCones", "Cinesini", "Disegnano riferimenti e distanze: non devono trasformare il drill in uno slalom scollegato dal gioco."],
            ["resistanceBands", "Elastici", "Usali con resistenza leggera e controllo per attivare anche e spalle, senza cercare fatica precoce."],
            ["waterBottle", "Idratazione", "Arriva già idratato e bevi regolarmente: caldo, durata e intensità cambiano il fabbisogno individuale."],
          ].map(([asset, title, description]) => (
            <AcademyVisual
              key={asset}
              asset={asset as "markerCones" | "resistanceBands" | "waterBottle"}
              title={title}
              caption={description}
              className="sm:grid-cols-1"
            />
          ))}
        </section>

        <SessionPlan
          title="Preparazione essenziale prima di giocare"
          duration="15 minuti"
          blocks={[
            { minutes: "0–4′", title: "Alza la temperatura", description: "Corsa leggera, passi laterali e mobilità dinamica senza forzare il range." },
            { minutes: "4–8′", title: "Attiva", description: "Elastico leggero per anche e spalle, con movimenti controllati e senza dolore." },
            { minutes: "8–12′", title: "Accelera e frena", description: "Tre direzioni, intensità progressiva, recupero completo tra le prove." },
            { minutes: "12–15′", title: "Racchetta", description: "Mini scambi, volée controllate e due sequenze di servizio più primo colpo." },
          ]}
        />

        <Callout tone="warning" title="Fermati e chiedi supporto">
          Questi contenuti non diagnosticano né riabilitano. Dolore acuto, trauma, capogiro, dolore toracico o
          sintomi persistenti richiedono lo stop e il confronto con un professionista sanitario. Dopo un
          infortunio, la ripresa va personalizzata.
        </Callout>
        <NextLesson
          href="/academy/attrezzatura"
          label="Scegli il tuo kit"
          description="Completa la preparazione con scarpe, racchetta e accessori coerenti con il tuo livello."
        />
        <CoachClose />
      </div>
    </div>
  );
}
