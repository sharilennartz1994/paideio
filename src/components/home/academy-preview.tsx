import Link from "next/link";
import { ArrowRight, Brain, Dumbbell, Swords } from "@/components/icons/paideio-icons";
import { GameAsset, GameCta } from "@/components/design";

const PATHS = [
  {
    href: "/academy/tecnica",
    eyebrow: "Gesto",
    title: "Costruisci i colpi",
    description: "Dalla posizione d’attesa alla víbora: capisci cosa allenare e in quale momento usarlo.",
    icon: Swords,
  },
  {
    href: "/academy/strategia",
    eyebrow: "Scelta",
    title: "Leggi prima la palla",
    description: "Posizioni, movimento di coppia e decisioni che trasformano uno scambio confuso.",
    icon: Brain,
  },
  {
    href: "/academy/training",
    eyebrow: "Corpo",
    title: "Preparati al campo",
    description: "Mobilità, cambi di direzione e recupero per arrivare lucido alla palla successiva.",
    icon: Dumbbell,
  },
] as const;

export function AcademyPreview() {
  return (
    <section className="overflow-hidden border-y border-game-blue/45 bg-game-blue px-4 py-16 text-game-white md:px-10 md:py-24 lg:px-16">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5" data-game-reveal>
          <p className="ui-kicker ui-kicker-inverse">Paideio Academy</p>
          <h2 className="editorial-title mt-4 max-w-xl text-[42px] leading-[1.02] md:text-[60px]">
            Non solo come colpire. Anche perché.
          </h2>
          <p className="mt-5 max-w-lg text-game-white">
            Una vera area di apprendimento per collegare tecnica, tattica e
            preparazione. Scegli una domanda, studiala e portala in lezione.
          </p>
          <GameCta
            href="/academy"
            tone="ball"
            showBall
            arrow
            size="large"
            className="mt-8"
          >
            Entra nell’Academy
          </GameCta>

          <div className="game-asset-stage mt-8 hidden min-h-[300px] items-center justify-center lg:flex">
            <GameAsset
              name="tacticsBoard"
              decorative
              sizes="420px"
              className="w-full max-w-[420px] rotate-[-5deg]"
            />
          </div>
        </div>

        <div className="self-center border-t border-game-cyan/45 lg:col-span-7">
          {PATHS.map(({ href, eyebrow, title, description, icon: Icon }, index) => (
            <Link
              key={href}
              href={href}
              className="group grid min-h-40 grid-cols-[48px_1fr_auto] gap-4 border-b border-game-cyan/30 py-7 text-game-white transition-colors hover:bg-game-cyan/8 focus-visible:bg-game-cyan/8 md:grid-cols-[64px_1fr_auto] md:px-5"
              data-game-reveal
            >
              <span className="flex size-12 items-center justify-center border border-game-cyan/55 text-game-cyan md:size-14">
                <Icon className="size-5" aria-hidden />
              </span>
              <span>
                <span className="font-heading text-xs font-bold uppercase tracking-[0.12em] text-game-cyan">
                  0{index + 1} · {eyebrow}
                </span>
                <span className="mt-2 block font-heading text-[26px] font-bold leading-tight md:text-[32px]">
                  {title}
                </span>
                <span className="mt-2 block max-w-xl text-sm text-game-white/75 md:text-base">
                  {description}
                </span>
              </span>
              <ArrowRight
                className="mt-2 size-5 text-game-ball transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
