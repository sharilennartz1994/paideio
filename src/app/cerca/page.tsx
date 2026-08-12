import Link from "next/link";
import { Suspense } from "react";
import { MapPin, Users, User, Star, Euro, GraduationCap } from "@/components/icons/paideio-icons";
import {
  searchCoaches,
  LEVELS,
  parseJsonArray,
  getFavoriteCoachIds,
  type Level,
  type TrainingType,
} from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { UseMyLocationButton } from "@/components/use-my-location-button";
import { readSearchLocation } from "@/lib/search-location";
import { CoachAvatar } from "@/components/coach-avatar";
import { FavoriteButton } from "@/components/favorite-button";
import { GameCta, GameEmptyState } from "@/components/design";
import { MobileFilterSheet } from "@/components/mobile-filter-sheet";

const LEVEL_LABELS: Record<Level, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzato: "Avanzato",
};

// `lat`/`lng` non compaiono più: la posizione arriva dal cookie di sessione,
// non dalla query string. Vedi `lib/actions/search-location.ts`.
type SearchParams = Promise<{
  city?: string;
  type?: string;
  level?: string;
  maxPrice?: string;
}>;

function FiltersForm({
  city,
  type,
  level,
  near,
  maxPrice,
}: {
  city?: string;
  type?: TrainingType;
  level?: Level;
  near?: boolean;
  maxPrice: number;
}) {
  return (
    <form method="get" className="space-y-6">
      <div className="flex items-center justify-between border-b border-nebbia/20 pb-4">
        <h3 className="font-heading text-[26px] text-calce">Filtri</h3>
        <Link href="/cerca" className="inline-flex min-h-11 min-w-11 items-center justify-center text-sm text-nebbia underline hover:text-vetro">
          Azzera
        </Link>
      </div>
      <label className="block text-sm text-nebbia">
        Città
        <span className="relative mt-2 flex min-h-11 items-center border-b border-nebbia/40">
          <input
            name="city"
            type="text"
            defaultValue={city}
            disabled={!!near}
            placeholder="es. Milano"
            className="min-h-11 w-full bg-transparent py-2 pr-7 text-calce placeholder:text-nebbia/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vetro"
          />
          <MapPin className="absolute right-1 size-4 text-vetro" />
        </span>
      </label>
      <fieldset>
        <legend className="mb-3 text-sm text-nebbia">Livello</legend>
        <div className="space-y-2">
          {LEVELS.map((l) => (
            <label key={l} className="flex min-h-11 cursor-pointer items-center gap-3">
              <input type="radio" name="level" value={l} defaultChecked={level === l} className="size-4 accent-vetro" />
              <span className="text-calce">{LEVEL_LABELS[l]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm text-nebbia">Tipo di lezione</legend>
        <div className="flex gap-2">
          {(["singolo", "gruppo"] as const).map((value) => (
            <label key={value} className="flex-1">
              <input type="radio" name="type" value={value} defaultChecked={type === value} className="peer sr-only" />
              <span className="flex min-h-11 items-center justify-center rounded-full border border-nebbia/40 px-3 text-sm text-nebbia peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-vetro peer-checked:border-vetro peer-checked:bg-vetro peer-checked:text-carta">
                {value === "singolo" ? "Singola" : "Gruppo"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm text-nebbia">
        Prezzo massimo: <span className="tabular-nums text-calce">{maxPrice}€</span>
        <input name="maxPrice" type="range" min={20} max={150} defaultValue={maxPrice} className="mt-3 h-11 w-full cursor-pointer accent-vetro" />
      </label>
      <GameCta type="submit" className="w-full">Applica filtri</GameCta>
    </form>
  );
}

export default async function CercaPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const city = params.city?.trim() || undefined;
  const type = params.type === "singolo" || params.type === "gruppo" ? (params.type as TrainingType) : undefined;
  const level = LEVELS.includes(params.level as Level) ? (params.level as Level) : undefined;
  // La città digitata ha la precedenza sulla posizione rilevata.
  const posizione = city ? undefined : await readSearchLocation();
  const near = posizione;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : 150;

  const user = await getCurrentUser();
  const isPlayer = user?.role === "player";
  const [results, favoriteIds] = await Promise.all([
    searchCoaches({ city, type, level, near, maxPrice, sort: near ? undefined : "rating" }),
    isPlayer ? getFavoriteCoachIds(user.id) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <div className="paper-grain min-h-screen bg-carta px-4 py-12 md:px-16">
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="mb-3 font-heading text-headline-lg-mobile leading-none text-calce md:text-headline-lg">
            {city ? `Risultati per ${city}` : near ? "Coach vicino a te" : "Tutti i coach"}
          </h1>
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-vetro" />
            <p className="text-sm text-nebbia">
              {results.length === 1 ? "1 coach disponibile trovato" : `${results.length} coach disponibili trovati`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MobileFilterSheet summary={`${[city, type, level].filter(Boolean).length} filtri applicati`}>
            <FiltersForm city={city} type={type} level={level} near={!!near} maxPrice={maxPrice} />
          </MobileFilterSheet>
          <Suspense fallback={null}><UseMyLocationButton active={!!near} /></Suspense>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="glass-panel hidden h-fit w-72 shrink-0 p-6 lg:sticky lg:top-24 lg:block">
          <FiltersForm city={city} type={type} level={level} near={!!near} maxPrice={maxPrice} />
        </aside>

        {/* Results grid */}
        <div className="flex flex-1 flex-col gap-4">
          {results.length === 0 && (
            <GameEmptyState
              asset="bandejaTrail"
              title="Palla a rete!"
              description={
                near
                  ? "Nessun coach entro 50 km dalla tua posizione. Prova ad allargare la ricerca per città."
                  : "Nessun coach trovato con questi filtri. Prova ad allargare il campo di ricerca."
              }
              className="col-span-full"
            />
          )}
          {results.map(({ coach, profile, locations, rating }) => (
            <article
              key={coach.id}
              className="group grid overflow-hidden border border-nebbia/25 bg-carta-alta transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-vetro md:grid-cols-[150px_1fr_auto]"
            >
              <div className="flex items-center justify-center bg-game-ink p-5">
                <div className="size-24 overflow-hidden rounded-full border-2 border-game-cyan p-1">
                  <CoachAvatar name={coach.name} src={profile.avatarUrl} className="size-full text-2xl" />
                </div>
              </div>
              <div className="p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-2xl">
                      <Link
                        href={`/coach/${coach.id}`}
                        className="inline-flex min-h-11 items-center text-calce transition-colors hover:text-vetro focus-visible:text-vetro"
                      >
                        {coach.name}
                      </Link>
                    </h2>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-nebbia">
                      <MapPin className="size-4 text-vetro" />
                      {locations.map((location) => location.city).join(", ") || "Paideio"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1" aria-label={rating.average ? `Valutazione ${rating.average.toFixed(1)} su 5` : "Nessuna valutazione"}>
                    <Star className={rating.average ? "size-4 fill-vetro text-vetro" : "size-4 text-nebbia"} aria-hidden />
                    <strong className="text-sm text-calce">{rating.average?.toFixed(1) ?? "Nuovo"}</strong>
                    <span className="text-xs text-nebbia">({rating.count})</span>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 max-w-2xl text-sm leading-relaxed text-nebbia">{profile.bio}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {parseJsonArray(profile.levels).slice(0, 3).map((coachLevel) => (
                    <span key={coachLevel} className="flex min-h-7 items-center gap-1 border border-nebbia/25 px-2 text-xs text-nebbia capitalize">
                      <GraduationCap className="size-3.5" aria-hidden /> {coachLevel}
                    </span>
                  ))}
                  <div className="flex gap-2">
                    {parseJsonArray(profile.trainingTypes)
                      .slice(0, 2)
                      .map((t) => (
                        <span
                          key={t}
                          className="flex min-h-7 items-center gap-1 border border-nebbia/25 px-2 text-xs text-nebbia"
                        >
                          {t === "singolo" ? <User className="size-3" aria-hidden /> : <Users className="size-3" aria-hidden />}
                          {t === "singolo" ? "Singola" : "Gruppo"}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-nebbia/20 bg-carta-bassa p-5 md:w-52 md:flex-col md:items-stretch md:justify-center md:border-t-0 md:border-l">
                {/* Un "€ -" sembra un prezzo mancante per errore: se il coach
                    non l'ha indicato, dirlo è più utile del segnaposto. */}
                <div>
                  {profile.pricePerLesson != null ? (
                    <>
                      <p className="text-xs text-nebbia">Lezione da</p>
                      <p className="mt-1 flex items-center gap-1 font-heading text-2xl text-calce">
                        <Euro className="size-4 text-vetro" aria-hidden />
                        {profile.pricePerLesson}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-nebbia">Tariffa</p>
                      <p className="mt-1 font-heading text-lg text-calce">Su richiesta</p>
                    </>
                  )}
                </div>
                <GameCta href={`/coach/${coach.id}#prenota`} tone="ball" showBall arrow className="flex-1 md:flex-none">
                  Prenota
                </GameCta>
                <div className="flex items-center justify-end">
                  <FavoriteButton coachId={coach.id} initialFavorite={favoriteIds.has(coach.id)} viewerRole={user?.role ?? null} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
