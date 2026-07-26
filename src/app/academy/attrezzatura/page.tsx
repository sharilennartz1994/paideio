import type { Metadata } from "next";
import { CoachClose, EditorialHero } from "@/components/editorial-layout";
import {
  AcademyIntro,
  AcademyVisual,
  Callout,
  LessonBlock,
  NextLesson,
} from "@/components/academy/academy-ui";
import { GameBadge } from "@/components/design";

export const metadata: Metadata = { title: "Attrezzatura da padel — Paideio Academy" };

export default function AttrezzaturaPage() {
  return (
    <div>
      <EditorialHero
        kicker="Academy · Attrezzatura"
        title="Compra meno. Scegli meglio."
        description="Guide neutrali per costruire un kit adatto al tuo gioco, senza classifiche commerciali mascherate."
        asset="backpack"
      />
      <div className="mx-auto max-w-6xl space-y-10 px-5 py-12 md:px-8 md:py-16">
        <AcademyIntro title="La racchetta giusta non corregge il gesto">
          <p>
            Parti da comfort, maneggevolezza e tolleranza. Forma, peso, bilanciamento, materiali e distribuzione
            dei fori lavorano insieme: la sagoma da sola non descrive tutta la racchetta.
          </p>
          <p>Quando possibile, prova il modello in campo e valuta controllo anche dopo che il braccio si affatica.</p>
        </AcademyIntro>

        <LessonBlock
          title="Rotonda, goccia o diamante"
          subtitle="Tre famiglie utili per orientarsi, non tre garanzie automatiche di controllo o potenza."
        >
          <AcademyVisual
            asset="racketShapes"
            title="Confronta prima la sagoma"
            caption="Da sinistra: testa rotonda, a goccia e a diamante. È un orientamento visivo: peso, bilanciamento e rigidità restano determinanti."
            className="mb-7"
          />
          <div className="grid gap-px border border-nebbia/18 bg-nebbia/18 md:grid-cols-3">
            {[
              ["Rotonda", "Sweet spot generalmente ampio e bilanciamento spesso basso. Un punto di partenza gestibile per chi cerca controllo."],
              ["Goccia", "Compromesso frequente tra maneggevolezza e spinta. Va confrontata nel peso e nel bilanciamento reali."],
              ["Diamante", "Sweet spot più alto e bilanciamento spesso verso la testa. Richiede timing e forza adeguati, non è una scorciatoia."],
            ].map(([name, body], index) => (
              <article key={name} className="bg-carta-bassa p-5">
                <GameBadge tone={index === 0 ? "info" : "neutral"}>{name}</GameBadge>
                <p className="mt-4 leading-relaxed text-nebbia">{body}</p>
              </article>
            ))}
          </div>
          <div className="mt-6">
            <Callout tone="info" title="Controlla la scheda completa">
              Due racchette della stessa forma possono comportarsi in modo diverso. Confronta peso effettivo,
              bilanciamento, rigidità, spessore del grip e sensazioni durante volée e difesa.
            </Callout>
          </div>
        </LessonBlock>

        <LessonBlock
          title="Scarpe e appoggio"
          subtitle="Servono stabilità laterale, aderenza compatibile con la superficie e spazio sufficiente per il piede."
        >
          <div className="mb-7 grid gap-5 md:grid-cols-2">
            <AcademyVisual
              asset="shoes"
              title="Stabilità prima della velocità"
              caption="La scarpa deve sostenere frenate e spinte laterali sulla superficie reale del club."
              className="sm:grid-cols-1"
            />
            <AcademyVisual
              asset="grip"
              title="Una presa che resta costante"
              caption="Sostituisci l’overgrip quando perde aderenza e avvolgilo con sovrapposizione regolare."
              className="sm:grid-cols-1"
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <section>
              <h3 className="font-heading text-sm font-bold text-calce uppercase">Prova dinamica</h3>
              <ul className="mt-4 space-y-3 text-nebbia">
                <li className="border-t border-nebbia/20 pt-3">Fai arresti e passi laterali, non soltanto una camminata.</li>
                <li className="border-t border-nebbia/20 pt-3">Il tallone resta stabile e le dita non urtano in frenata.</li>
                <li className="border-t border-nebbia/20 pt-3">La suola non deve obbligarti a forzare la rotazione.</li>
              </ul>
            </section>
            <section>
              <h3 className="font-heading text-sm font-bold text-calce uppercase">Kit essenziale</h3>
              <ul className="mt-4 space-y-3 text-nebbia">
                <li className="border-t border-nebbia/20 pt-3">Cordino integro e sempre indossato durante il gioco.</li>
                <li className="border-t border-nebbia/20 pt-3">Overgrip asciutto, avvolto con una sovrapposizione regolare e senza rigonfiamenti.</li>
                <li className="border-t border-nebbia/20 pt-3">Acqua, protezione solare e ricambio nelle giornate calde.</li>
              </ul>
            </section>
          </div>
        </LessonBlock>

        <Callout tone="warning" title="Cambia o controlla l’attrezzatura">
          Ferma l’uso se il telaio presenta crepe, il cordino è danneggiato o la scarpa perde stabilità. Dolore
          persistente a gomito, spalla, piede o ginocchio non si risolve scegliendo una racchetta diversa:
          confrontati con un professionista.
        </Callout>
        <NextLesson
          href="/academy/regole"
          label="Ripassa le regole"
          description="Verifica misure, servizio, cordino e situazioni di gioco prima di entrare in campo."
        />
        <CoachClose title="Prova l’attrezzatura nel tuo gioco reale" />
      </div>
    </div>
  );
}
