import type { Metadata } from "next";
import { CoachClose, EditorialHero, SourceNote } from "@/components/editorial-layout";
import {
  AcademyIntro,
  Callout,
  DoDont,
  LessonBlock,
  NextLesson,
} from "@/components/academy/academy-ui";
import { GameBadge, GamePanel } from "@/components/design";

export const metadata: Metadata = {
  title: "Regole del padel 2026 — Paideio Academy",
  description: "Guida aggiornata alle regole FIP 2026 e ai regolamenti delle competizioni FITP.",
};

export default function RegolePage() {
  return (
    <div>
      <EditorialHero
        kicker="Academy · Verificato 26/07/2026"
        title="Regole del padel 2026"
        description="Una guida editoriale sulle fonti ufficiali FIP e FITP. Le regole di gioco e i regolamenti delle competizioni restano separati."
        asset="glassCorner"
      />
      <div className="mx-auto max-w-6xl space-y-10 px-5 py-12 md:px-8 md:py-16">
        <div className="flex flex-wrap gap-2">
          <GameBadge tone="success">FIP · applicazione 01/01/2026</GameBadge>
          <GameBadge tone="info">FITP · competizioni italiane</GameBadge>
        </div>
        <AcademyIntro title="Regola, formato e regolamento non sono la stessa cosa">
          <p>
            Le Rules of Padel FIP definiscono come si gioca. Il regolamento della competizione specifica formato,
            punteggio adottato, ammissione e organizzazione. Prima di un torneo consulta entrambi.
          </p>
        </AcademyIntro>

        <LessonBlock
          title="Servizio: la sequenza completa"
          subtitle="Il servizio inizia dietro la linea, dopo un rimbalzo e in diagonale nel box opposto."
        >
          <ol className="grid gap-px border border-nebbia/18 bg-nebbia/18 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Posizione", "Entrambi i piedi dietro la linea di servizio, tra il prolungamento della linea centrale e la parete laterale."],
              ["Rimbalzo", "Lascia rimbalzare la palla nel terreno entro la tua zona di servizio."],
              ["Impatto", "Colpisci a o sotto il livello della vita, con almeno un piede a contatto con il terreno."],
              ["Direzione", "La palla deve superare la rete e rimbalzare nel box diagonale corretto."],
            ].map(([title, body]) => (
              <li key={title} className="bg-carta-bassa p-5">
                <h3 className="font-heading font-bold text-calce">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-nebbia">{body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-7">
            <DoDont
              doItems={[
                "Dopo il rimbalzo nel box, la palla può colpire il vetro e il servizio resta valido.",
                "Hai un secondo tentativo se il primo servizio è fallo.",
              ]}
              dontItems={[
                "Dopo il rimbalzo nel box, la palla tocca la griglia metallica.",
                "Camminare, correre o saltare durante l’esecuzione del servizio.",
              ]}
            />
          </div>
        </LessonBlock>

        <LessonBlock
          title="Pareti, griglia e palla in gioco"
          subtitle="Dopo un rimbalzo valido nel campo avversario, vetro e griglia fanno parte del gioco."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <section>
              <h3 className="font-heading text-sm font-bold text-calce uppercase">La palla continua</h3>
              <p className="mt-3 leading-relaxed text-nebbia">
                Se rimbalza prima nel terreno avversario, può poi colpire una parete o la griglia e deve essere
                restituita prima del secondo rimbalzo.
              </p>
            </section>
            <section>
              <h3 className="font-heading text-sm font-bold text-calce uppercase">La palla è fuori</h3>
              <p className="mt-3 leading-relaxed text-nebbia">
                Se il tuo colpo raggiunge direttamente parete, griglia o altra struttura del campo avversario
                prima di toccare il terreno.
              </p>
            </section>
          </div>
          <div className="mt-6">
            <Callout tone="info" title="Gioco esterno">
              Recuperare una palla fuori dal campo è ammesso soltanto negli impianti conformi per il gioco
              esterno. Non è una regola da improvvisare in qualsiasi struttura.
            </Callout>
          </div>
        </LessonBlock>

        <LessonBlock
          title="Punteggio e sicurezza"
          subtitle="Il formato del match dipende dalla competizione; l’uso corretto del cordino non dipende dal punteggio."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-heading font-bold text-calce">Formato</h3>
              <p className="mt-2 leading-relaxed text-nebbia">
                Il formato standard è al meglio dei tre set, con tie-break sul 6–6. Nel 2026 la FIP contempla
                sistemi di punteggio alternativi, tra cui vantaggi, Golden Point e Star Point, da dichiarare
                nel regolamento della manifestazione.
              </p>
            </div>
            <Callout tone="warning" title="Cordino obbligatorio">
              Il cordino non elastico, di lunghezza massima 35 cm, deve essere fissato al manico e indossato al
              polso durante il gioco. Un cordino danneggiato va sostituito prima di rientrare.
            </Callout>
          </div>
        </LessonBlock>

        <GamePanel tone="quiet" className="p-6">
          <h2 className="font-heading text-xl font-bold text-calce">Fonti normative</h2>
          <div className="mt-4 flex flex-col items-start gap-3">
            <SourceNote href="https://www.padelfip.com/wp-content/uploads/2025/12/FIP_Rules-of-Padel.pdf">Rules of Padel FIP 2026</SourceNote>
            <SourceNote href="https://www.fitp.it/Padel/Campionati-e-Tornei">Regolamenti e competizioni FITP</SourceNote>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-nebbia">
            Questa sintesi non sostituisce il regolamento ufficiale o quello della singola manifestazione.
          </p>
        </GamePanel>
        <NextLesson
          href="/academy/strategia"
          label="Leggi la strategia"
          description="Ora usa pareti, servizio e punteggio per scegliere meglio durante il punto."
        />
        <CoachClose title="Ora metti le regole dentro il gioco" />
      </div>
    </div>
  );
}
