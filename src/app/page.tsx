import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  MapPin,
  Star,
  TrendingUp,
} from "@/components/icons/paideio-icons";
import { CoachAvatar } from "@/components/coach-avatar";
import { GameAsset, GameCta, GameDivider, GlassPanel } from "@/components/design";
import { AcademyPreview } from "@/components/home/academy-preview";
import { CoachPath } from "@/components/home/coach-path";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchCoaches } from "@/lib/queries";

const REASONS = [
  ["Tecnica che resta", "Ogni lezione parte dal tuo gioco reale, non da un programma uguale per tutti."],
  ["Strategia leggibile", "Impari a scegliere prima di colpire: posizione, tempi e intenzione."],
  ["Coach vicino a te", "Trovi disponibilità, livello e prezzo prima di inviare la richiesta."],
];

export default async function Home() {
  const featured = (await searchCoaches({ sort: "rating" })).slice(0, 3);
  const [lead, ...others] = featured;

  return (
    <div>
      {/* THESIS: la home è il lobby di una vera arena di padel, con tre ingressi reali: coach, Academy e coach mode. OWN-WORLD: cel-shaded, HUD netti, asset PNG e nessuna gamification finta. STORY: trova → scegli → impara → entra come coach. FIRST VIEWPORT: promessa, ricerca operativa e giocatrice. FORM: landing marketplace Persuade dentro il sistema Game Arena. */}
      <section className="paper-grain overflow-hidden px-4 py-12 md:px-10 md:py-20 lg:px-16">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6" data-game-reveal>
            <p className="ui-kicker mb-5">Coach di padel · lezioni nella tua città</p>
            <h1 className="editorial-title max-w-3xl text-[42px] text-calce md:text-[64px] lg:text-[68px]">
              Trova il tuo coach. <span className="text-accent-ball-ink">Prenota una lezione.</span>
            </h1>
            <p className="mt-6 max-w-xl text-body-lg text-nebbia">
              Paideio ti aiuta a trovare coach di padel, confrontare prezzi e
              disponibilità e inviare una richiesta di prenotazione.
            </p>

            <GlassPanel className="mt-9 max-w-3xl p-4 md:p-5" data-game-tilt>
              <form action="/cerca" className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                <label className="block text-sm text-nebbia">
                  Città
                  <span className="mt-2 flex min-h-11 items-center border-b border-nebbia/40">
                    <MapPin className="mr-2 size-4 text-vetro" />
                    <input
                      name="city"
                      placeholder="es. Milano"
                      className="w-full bg-transparent py-2 text-calce placeholder:text-nebbia/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vetro"
                    />
                  </span>
                </label>
                <div className="block text-sm text-nebbia">
                  <label htmlFor="home-lesson-type">Tipo di lezione</label>
                  <div className="mt-2 flex min-h-11 items-center">
                    <GraduationCap className="mr-2 size-4 text-vetro" />
                    <Select
                      name="type"
                      defaultValue=""
                      items={[
                        { value: "", label: "Tutte" },
                        { value: "singolo", label: "Singola" },
                        { value: "gruppo", label: "Gruppo" },
                      ]}
                    >
                      <SelectTrigger id="home-lesson-type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="start">
                        <SelectItem value="">Tutte</SelectItem>
                        <SelectItem value="singolo">Singola</SelectItem>
                        <SelectItem value="gruppo">Gruppo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="block text-sm text-nebbia">
                  <label htmlFor="home-level">Livello</label>
                  <div className="mt-2 flex min-h-11 items-center">
                    <TrendingUp className="mr-2 size-4 text-vetro" />
                    <Select
                      name="level"
                      defaultValue=""
                      items={[
                        { value: "", label: "Tutti" },
                        { value: "principiante", label: "Principiante" },
                        { value: "intermedio", label: "Intermedio" },
                        { value: "avanzato", label: "Avanzato" },
                      ]}
                    >
                      <SelectTrigger id="home-level" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="start">
                        <SelectItem value="">Tutti</SelectItem>
                        <SelectItem value="principiante">Principiante</SelectItem>
                        <SelectItem value="intermedio">Intermedio</SelectItem>
                        <SelectItem value="avanzato">Avanzato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <GameCta type="submit" showBall arrow>
                  Cerca
                </GameCta>
              </form>
            </GlassPanel>
          </div>
          <div className="game-asset-stage game-hero-rally mx-auto flex min-h-[340px] w-full max-w-[520px] items-end justify-center lg:col-span-5 lg:col-start-8 lg:min-h-[560px]" data-game-tilt data-game-reveal>
            <GameAsset
              name="playerSmash"
              decorative
              preload
              loading="eager"
              sizes="(max-width: 768px) 84vw, (max-width: 1280px) 42vw, 520px"
              className="max-h-[360px] w-auto lg:max-h-[590px]"
            />
          </div>
        </div>
      </section>

      <GameDivider />

      <section className="px-4 py-16 md:px-10 md:py-24 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between" data-game-reveal>
            <div className="max-w-2xl">
              <p className="ui-kicker">Coach in campo</p>
              <h2 className="editorial-title mt-3 text-headline-lg-mobile text-calce md:text-headline-lg">
                Trova la guida giusta
              </h2>
              <p className="mt-3 text-nebbia">
                Valutazioni, città e prezzo ti aiutano a scegliere. Nel profilo
                trovi poi campi, orari e modalità di allenamento.
              </p>
            </div>
            <GameCta href="/cerca" tone="outline" arrow>
              Esplora tutti i coach
            </GameCta>
          </div>

          {lead ? (
            <div className="grid min-w-0 gap-5 lg:grid-cols-12">
              <GlassPanel className="min-w-0 p-6 md:p-8 lg:col-span-7" data-game-reveal data-game-tilt>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <CoachAvatar name={lead.coach.name} src={lead.profile.avatarUrl} className="size-24 shrink-0 text-2xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm text-nebbia">
                      <Star className="size-4 fill-vetro text-vetro" />
                      <span className="tabular-nums">{lead.rating.average?.toFixed(1) ?? "Nuovo"}</span>
                      <span>· {lead.rating.count} recensioni</span>
                    </div>
                    <h3 className="mt-2 font-heading text-[34px] text-calce">{lead.coach.name}</h3>
                    {lead.locations.length > 0 && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-accent-cyan-ink">
                        <MapPin className="size-4" aria-hidden />
                        {[...new Set(lead.locations.map((location) => location.city))].join(", ")}
                      </p>
                    )}
                    <p className="mt-3 line-clamp-2 text-nebbia">{lead.profile.bio}</p>
                  </div>
                  <div className="sm:text-right">
                    {lead.profile.pricePerLesson != null && <p className="tabular-nums text-xl text-calce">€{lead.profile.pricePerLesson}<span className="text-sm text-nebbia"> / lezione</span></p>}
                    <Link href={`/coach/${lead.coach.id}`} className="mt-4 inline-flex min-h-11 items-center gap-2 bg-vetro px-5 font-semibold text-carta hover:bg-calce">
                      Vedi il profilo <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </GlassPanel>
              <div className="grid min-w-0 gap-5 lg:col-span-5">
                {others.map(({ coach, profile, rating }) => (
                  <GlassPanel key={coach.id} className="flex min-w-0 items-center gap-4 p-5" data-game-reveal>
                    <CoachAvatar name={coach.name} src={profile.avatarUrl} className="size-16 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-heading text-headline-md text-calce">{coach.name}</h3>
                      <p className="mt-1 text-sm text-nebbia">{rating.average?.toFixed(1) ?? "Nuovo"} · {profile.pricePerLesson != null ? `€${profile.pricePerLesson}` : "Prezzo su richiesta"}</p>
                    </div>
                    <Link href={`/coach/${coach.id}`} aria-label={`Vedi il profilo di ${coach.name}`} className="flex size-11 shrink-0 items-center justify-center border border-vetro text-vetro hover:bg-vetro hover:text-carta">
                      <ArrowRight className="size-4" />
                    </Link>
                  </GlassPanel>
                ))}
              </div>
            </div>
          ) : (
            <GlassPanel className="grid gap-5 p-8 text-nebbia sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <h3 className="font-heading text-[26px] text-calce">I primi coach stanno entrando in campo.</h3>
                <p className="mt-2">Prova una ricerca oppure torna presto per scoprire i nuovi profili.</p>
              </div>
              <GameCta href="/cerca" tone="outline" arrow>
                Apri la ricerca
              </GameCta>
            </GlassPanel>
          )}
        </div>
      </section>

      <AcademyPreview />

      <section className="px-4 py-16 md:px-10 md:py-24 lg:px-16">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4" data-game-reveal>
            <p className="ui-kicker">Dalla ricerca al campo</p>
            <h2 className="editorial-title mt-3 text-[40px] text-calce md:text-[52px]">Il tuo training loop</h2>
            <p className="mt-5 max-w-md text-nebbia">Cerca, prenota, gioca. Ogni lezione rende il prossimo scambio più leggibile.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 lg:col-span-8">
            {REASONS.map(([title, description], index) => (
              <article key={title} className="training-rally-step border-t border-accent-ball-ink/70 pt-5" data-game-reveal>
                <span className="font-heading text-xs font-bold tracking-[0.1em] text-accent-ball-ink">STEP 0{index + 1}</span>
                <h3 className="mt-4 font-heading text-[26px] text-calce">{title}</h3>
                <p className="mt-3 text-nebbia">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <GameDivider />
      <CoachPath />
    </div>
  );
}
