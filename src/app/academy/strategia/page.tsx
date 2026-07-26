import type { Metadata } from "next";
import { CoachClose, EditorialHero } from "@/components/editorial-layout";
import {
  AcademyIntro,
  AcademyVisual,
  Callout,
  DoDont,
  LessonBlock,
  LessonColumns,
  NextLesson,
} from "@/components/academy/academy-ui";

export const metadata: Metadata = { title: "Strategia di padel — Paideio Academy" };

export default function StrategiaPage() {
  return (
    <div>
      <EditorialHero
        kicker="Academy · Strategia"
        title="La decisione viene prima del colpo"
        description="Posizione, probabilità e movimento di coppia: la tattica che rende più semplice scegliere sotto pressione."
        asset="ball"
      />
      <div className="mx-auto max-w-6xl space-y-10 px-5 py-12 md:px-8 md:py-16">
        <AcademyIntro title="La tattica è una decisione condivisa">
          <p>
            Nel padel una buona palla giocata dalla posizione sbagliata può aprire più spazio di quanto ne
            chiuda. Prima leggi la zona, poi scegli il colpo e muoviti con il compagno.
          </p>
          <p>Usa queste sequenze come regole di orientamento, non come automatismi validi per ogni palla.</p>
        </AcademyIntro>

        <AcademyVisual
          asset="courtPositions"
          title="La coppia si muove come un’unità"
          caption="Schema orientativo, non in scala: i due compagni presidiano la stessa zona e mantengono una distanza utile per coprire centro e corridoi. La posizione cambia con la qualità della palla."
        />

        <LessonBlock
          title="Le tre zone del punto"
          subtitle="Fondo, transizione e rete richiedono intenzioni diverse. Sapere dove sei riduce le decisioni affrettate."
        >
          <AcademyVisual
            asset="tacticsBoard"
            title="Prima la geometria, poi il vincente"
            caption="La lavagnetta rappresenta una possibile rotazione delle coppie. Frecce e pedine sono illustrative: una sequenza reale dipende da traiettoria, velocità e posizione dei quattro giocatori."
            className="mb-7"
          />
          <LessonColumns
            principle="Da fondo guadagni tempo; in transizione giochi semplice; a rete togli tempo. La coppia cambia zona insieme."
            practice="Gioca punti vincolati: il punto vale solo se entrambi superano la linea del servizio prima della prima volée."
            check="Quando uno avanza, il compagno riconosce la stessa opportunità e mantiene una distanza gestibile."
          />
          <div className="mt-7">
            <DoDont
              doItems={[
                "Avanza su una palla che costringe gli avversari a colpire dal basso o dopo il vetro.",
                "Arretra insieme quando il lob ti supera o quando perdi pressione.",
              ]}
              dontItems={[
                "Fermarsi a metà campo dopo una palla neutra.",
                "Correre a rete da soli lasciando un corridoio tra i compagni.",
              ]}
            />
          </div>
        </LessonBlock>

        <LessonBlock
          title="Il lob come colpo di costruzione"
          subtitle="Un lob utile non deve soltanto essere alto: deve dare alla coppia il tempo di avanzare e cambiare la geometria."
          level="Intermedio"
        >
          <LessonColumns
            principle="Giocalo quando sei in equilibrio e puoi portare la palla oltre la portata degli avversari, preferibilmente con margine sopra la spalla."
            practice="Da fondo, alterna 5 lob diagonali e 5 al centro. Avanza soltanto quando il difensore vede l’avversario girarsi o colpire arretrando."
            check="Il secondo rimbalzo tende verso il fondo e la coppia raggiunge la rete senza attraversare una palla giocabile dagli avversari."
          />
        </LessonBlock>

        <LessonBlock
          title="Centro, angoli e comunicazione"
          subtitle="Il centro riduce gli angoli e può creare indecisione; la comunicazione assegna responsabilità prima che la palla diventi urgente."
          level="Intermedio"
        >
          <LessonColumns
            principle="Chiama presto e con parole brevi: mia, tua, sale, resta. Sulle palle centrali conta anche la posizione, non soltanto il diritto."
            practice="Gioca un tie-break in cui ogni coppia deve chiamare la palla prima del rimbalzo. Dopo il punto, identifica quale spazio si è aperto."
            check="Le chiamate arrivano prima del gesto e i due giocatori recuperano una linea comune dopo ogni colpo."
          />
          <div className="mt-7">
            <Callout tone="tip" title="Scelta ad alta percentuale">
              Quando non hai un vantaggio chiaro, una palla profonda al centro limita gli angoli e ti concede
              tempo per ricomporre la coppia.
            </Callout>
          </div>
        </LessonBlock>
        <NextLesson
          href="/academy/training"
          label="Prepara il movimento"
          description="Costruisci frenate e primo passo per arrivare in equilibrio nelle zone che hai imparato a leggere."
        />
        <CoachClose title="Allena una scelta, non soltanto un colpo" />
      </div>
    </div>
  );
}
