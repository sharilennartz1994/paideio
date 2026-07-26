import { CalendarDays, MapPinned, UserRoundCog } from "@/components/icons/paideio-icons";
import { GameAsset, GameCta } from "@/components/design";

const COACH_TOOLS = [
  {
    title: "Il tuo profilo",
    description: "Racconta metodo, livelli seguiti, tipi di allenamento e prezzo.",
    icon: UserRoundCog,
  },
  {
    title: "Campi e orari",
    description: "Indica dove alleni e le disponibilità settimanali reali.",
    icon: MapPinned,
  },
  {
    title: "Richieste ordinate",
    description: "Conferma o rifiuta ogni lezione dalla tua area riservata.",
    icon: CalendarDays,
  },
] as const;

export function CoachPath() {
  return (
    <section className="net-texture overflow-hidden px-4 py-16 md:px-10 md:py-24 lg:px-16">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5" data-game-reveal>
          <p className="ui-kicker text-game-cyan">Coach mode</p>
          <h2 className="editorial-title mt-4 text-[42px] leading-[1.02] text-game-white md:text-[58px]">
            Il tuo metodo merita un campo tutto suo.
          </h2>
          <p className="mt-5 max-w-xl text-game-white/78">
            Paideio ti aiuta a farti trovare e a gestire il lavoro quotidiano.
            Nessuna promessa artificiale: sei tu a decidere dove, quando e con
            chi allenare.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <GameCta href="/diventa-coach" tone="ball" showBall arrow size="large">
              Diventa coach
            </GameCta>
            <GameCta href="/cerca" tone="outline" arrow size="large">
              Guarda i profili
            </GameCta>
          </div>
        </div>

        <div className="grid gap-5 lg:col-span-7 lg:grid-cols-[1fr_220px]">
          <div className="border-y border-game-cyan/38">
            {COACH_TOOLS.map(({ title, description, icon: Icon }, index) => (
              <article
                key={title}
                className="grid grid-cols-[44px_1fr] gap-4 border-b border-game-cyan/24 py-6 last:border-b-0"
                data-game-reveal
              >
                <span className="flex size-11 items-center justify-center bg-game-cyan text-game-ink">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-heading text-xs font-bold uppercase tracking-[0.12em] text-game-ball">
                    0{index + 1}
                  </p>
                  <h3 className="mt-1 font-heading text-[24px] text-game-white">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm text-game-white/72">{description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="game-asset-stage hidden min-h-[330px] items-center justify-center lg:flex">
            <GameAsset
              name="crossedRackets"
              decorative
              sizes="220px"
              className="w-full max-w-[220px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
