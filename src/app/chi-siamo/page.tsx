import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Target,
  Users,
} from "@/components/icons/paideio-icons";
import { GameAsset, GameCta, GameDivider } from "@/components/design";

export const metadata: Metadata = {
  title: "Paideio — Il gioco si impara insieme",
  description:
    "Paideio nasce dalla paideia: formazione attraverso pratica, guida e comunità. Oggi rende più semplice trovare un coach di padel.",
};

const PRINCIPLES = [
  {
    number: "01",
    icon: GraduationCap,
    title: "Una guida",
    body: "Un coach osserva ciò che da soli è difficile vedere e trasforma una correzione in un gesto allenabile.",
  },
  {
    number: "02",
    icon: Target,
    title: "Una pratica",
    body: "Il miglioramento non è astratto: vive negli appoggi, nelle scelte e nella palla successiva.",
  },
  {
    number: "03",
    icon: Users,
    title: "Una relazione",
    body: "Il padel è un gioco di coppia. Si cresce imparando a leggere anche compagno, avversari e spazio.",
  },
] as const;

export default function ChiSiamoPage() {
  return (
    <div className="overflow-hidden">
      {/* THESIS: Paideio rende contemporanea la paideia attraverso il gesto reale del padel. STORY: parola → metodo → servizio. MOTION: la parola si compone e la linea collega guida, pratica e relazione. */}
      <header className="paideio-manifesto-hero relative isolate overflow-hidden bg-game-ink text-game-white">
        <div
          aria-hidden
          className="malla-texture absolute inset-0 -z-20 opacity-55"
        />
        <div className="relative mx-auto grid min-h-[calc(100dvh-4rem)] max-w-[1440px] items-center gap-8 px-5 py-14 md:px-10 lg:grid-cols-12 lg:px-16">
          <div className="relative z-10 lg:col-span-7" data-game-reveal>
            <p className="ui-kicker">Paideio · dal greco παιδεία</p>
            <h1
              aria-label="Il gioco si impara insieme."
              className="mt-5 max-w-5xl font-heading text-[clamp(3.7rem,9vw,8.8rem)] leading-[0.82] font-extrabold tracking-[-0.065em] uppercase"
            >
              <span className="paideio-word-reveal block">Il gioco</span>
              <span className="paideio-word-reveal paideio-word-reveal--delay block text-game-ball">
                si impara
              </span>
              <span className="paideio-word-reveal paideio-word-reveal--late block">
                insieme.
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-game-white/76 md:text-xl">
              Paideio mette in contatto giocatori e coach di padel. Il nome
              racconta il perché: migliorare significa unire pratica, guida e
              relazione.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <GameCta href="/cerca" tone="ball" showBall arrow>
                Trova un coach
              </GameCta>
              <GameCta href="/academy" tone="outline">
                Entra in Academy
              </GameCta>
            </div>
          </div>

          <div
            className="game-asset-stage paideio-manifesto-player mx-auto flex min-h-[330px] w-full max-w-[480px] items-end justify-center lg:col-span-5 lg:min-h-[650px]"
            data-game-reveal
          >
            <GameAsset
              name="playerSmash"
              decorative
              preload
              loading="eager"
              sizes="(max-width: 767px) 82vw, 460px"
              className="max-h-[430px] w-auto lg:max-h-[680px]"
            />
          </div>
        </div>
        <div
          aria-hidden
          className="absolute right-0 bottom-0 left-0 h-1 bg-game-ball"
        />
      </header>

      <div>
        <section className="px-5 py-20 md:px-10 md:py-28 lg:px-16">
          <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-12 lg:items-start">
            <div className="lg:sticky lg:top-28 lg:col-span-5" data-game-reveal>
              <p className="font-heading text-[clamp(4.5rem,10vw,8rem)] leading-none font-black tracking-[-0.06em] text-accent-ball-ink">
                παιδεία
              </p>
              <p className="mt-4 font-heading text-sm font-bold tracking-[0.1em] text-accent-cyan-ink uppercase">
                paideia · formazione
              </p>
            </div>
            <div className="space-y-10 lg:col-span-6 lg:col-start-7">
              <h2
                className="editorial-title text-[40px] text-calce md:text-[58px]"
                data-game-reveal
              >
                Non soltanto sapere. Diventare.
              </h2>
              <div
                className="space-y-6 text-lg leading-relaxed text-nebbia"
                data-game-reveal
              >
                <p>
                  Nell’idea greca di paideia, educare significava formare la
                  persona attraverso conoscenza, esercizio e partecipazione
                  alla comunità.
                </p>
                <p>
                  Paideio porta questa intuizione nel padel contemporaneo:
                  nessuna promessa di scorciatoie, ma la possibilità concreta
                  di trovare una guida e trasformare l’intenzione in una
                  lezione sul campo.
                </p>
              </div>
              <blockquote
                className="border-y border-game-ball/55 py-6 font-heading text-2xl leading-tight font-bold text-calce md:text-3xl"
                data-game-reveal
              >
                Il risultato conta. Il percorso costruisce il giocatore.
              </blockquote>
            </div>
          </div>
        </section>

        <GameDivider />

        <section className="bg-carta-bassa px-5 py-20 md:px-10 md:py-28 lg:px-16">
          <div className="mx-auto max-w-[1240px]">
            <div className="max-w-3xl" data-game-reveal>
              <h2 className="editorial-title text-[40px] text-calce md:text-[58px]">
                La formazione entra in campo
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-nebbia">
                Tre elementi si sostengono a vicenda. Se ne togli uno, il
                miglioramento diventa più difficile da leggere e ripetere.
              </p>
            </div>

            <ol className="paideio-principles relative mt-14 grid gap-10 lg:grid-cols-3">
              {PRINCIPLES.map((principle) => (
                <li
                  key={principle.number}
                  className="paideio-principle relative border-t border-vetro/55 pt-6"
                  data-game-reveal
                >
                  <span className="font-heading text-sm font-bold text-accent-cyan-ink">
                    {principle.number}
                  </span>
                  <principle.icon
                    className="mt-9 size-8 text-accent-ball-ink"
                    aria-hidden
                  />
                  <h3 className="mt-5 font-heading text-3xl font-bold text-calce">
                    {principle.title}
                  </h3>
                  <p className="mt-3 max-w-sm leading-relaxed text-nebbia">
                    {principle.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="relative overflow-hidden bg-game-blue px-5 py-20 text-game-white md:px-10 md:py-28 lg:px-16">
          <div
            aria-hidden
            className="malla-texture absolute inset-0 opacity-20"
          />
          <div className="relative mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7" data-game-reveal>
              <p className="font-heading text-sm font-bold tracking-[0.1em] text-game-white uppercase">
                Dall’idea al servizio
              </p>
              <h2 className="mt-4 max-w-3xl font-heading text-[clamp(2.8rem,6vw,5.8rem)] leading-[0.9] font-extrabold tracking-[-0.05em] uppercase">
                Paideia diventa Paideio quando trovi la persona con cui
                allenarti.
              </h2>
            </div>
            <div className="lg:col-span-4 lg:col-start-9" data-game-reveal>
              <div className="border-l border-game-cyan/55 pl-6">
                <BookOpen className="size-8 text-game-ball" aria-hidden />
                <p className="mt-5 text-lg leading-relaxed text-game-white">
                  Esplora l’Academy per capire cosa allenare. Cerca un coach
                  per trasformarlo in lavoro sul campo.
                </p>
                <div className="mt-7 flex flex-col items-start gap-3">
                  <GameCta href="/cerca" tone="ball" showBall arrow>
                    Cerca il tuo coach
                  </GameCta>
                  <Link
                    href="/diventa-coach"
                    className="inline-flex min-h-11 items-center gap-2 font-heading text-sm font-bold text-game-white underline decoration-game-cyan/60 underline-offset-4 hover:decoration-game-white"
                  >
                    Porta la tua esperienza su Paideio
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
