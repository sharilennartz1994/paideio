import Link from "next/link";
import { Suspense } from "react";
import { MapPin, Users, User, Star, ArrowRight, Zap } from "lucide-react";
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
import { CoachAvatar } from "@/components/coach-avatar";
import { FavoriteButton } from "@/components/favorite-button";

const LEVEL_LABELS: Record<Level, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzato: "Avanzato",
};

type SearchParams = Promise<{
  city?: string;
  type?: string;
  level?: string;
  lat?: string;
  lng?: string;
  maxPrice?: string;
}>;

export default async function CercaPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const city = params.city?.trim() || undefined;
  const type = params.type === "singolo" || params.type === "gruppo" ? (params.type as TrainingType) : undefined;
  const level = LEVELS.includes(params.level as Level) ? (params.level as Level) : undefined;
  const lat = params.lat ? Number(params.lat) : undefined;
  const lng = params.lng ? Number(params.lng) : undefined;
  const near = lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng) ? { lat, lng } : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : 150;

  const user = await getCurrentUser();
  const isPlayer = user?.role === "player";
  const [results, favoriteIds] = await Promise.all([
    searchCoaches({ city, type, level, near, maxPrice, sort: near ? undefined : "rating" }),
    isPlayer ? getFavoriteCoachIds(user.id) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <div className="hex-texture min-h-screen bg-background px-4 py-12 md:px-16">
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 font-heading text-headline-lg-mobile leading-none text-primary uppercase italic md:text-headline-lg">
            {city ? `Risultati per ${city}` : near ? "Coach vicino a te" : "Tutti i coach"}
          </h1>
          <div className="flex items-center gap-2">
            <span className="h-1 w-8 bg-secondary-fixed" />
            <p className="font-mono text-label-caps text-on-surface-variant uppercase">
              {results.length === 1 ? "1 coach disponibile trovato" : `${results.length} coach disponibili trovati`}
            </p>
          </div>
        </div>
        <Suspense fallback={null}>
          <UseMyLocationButton />
        </Suspense>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters */}
        <aside className="h-fit w-full space-y-8 border border-outline-variant/20 bg-surface-container/50 p-6 backdrop-blur-md lg:sticky lg:top-24 lg:w-72">
          <form method="get" className="space-y-8">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <h3 className="font-mono text-label-caps text-secondary-fixed uppercase italic">Filtri</h3>
              <Link href="/cerca" className="font-mono text-[10px] text-on-surface-variant underline hover:text-primary">
                Resetta
              </Link>
            </div>

            <div>
              <label className="mb-4 block font-mono text-[10px] tracking-widest text-on-surface-variant uppercase">
                Città
              </label>
              <div className="relative">
                <input
                  name="city"
                  type="text"
                  defaultValue={city}
                  disabled={!!near}
                  placeholder="es. Milano"
                  className="w-full border-b-2 border-primary-container bg-transparent py-2 font-sans text-on-surface placeholder:text-outline-variant focus:border-secondary-fixed focus:outline-none"
                />
                <MapPin className="absolute top-2 right-0 size-4 text-outline" />
              </div>
            </div>

            <div>
              <label className="mb-4 block font-mono text-[10px] tracking-widest text-on-surface-variant uppercase">
                Livello
              </label>
              <div className="space-y-3">
                {LEVELS.map((l) => (
                  <label key={l} className="group flex cursor-pointer items-center gap-3">
                    <input type="radio" name="level" value={l} defaultChecked={level === l} className="peer hidden" />
                    <div className="size-4 border-2 border-outline transition-all peer-checked:border-secondary-fixed peer-checked:bg-secondary-fixed" />
                    <span className="font-sans text-on-surface-variant transition-colors group-hover:text-on-surface peer-checked:text-on-surface">
                      {LEVEL_LABELS[l]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-4 block font-mono text-[10px] tracking-widest text-on-surface-variant uppercase">
                Tipo lezione
              </label>
              <div className="flex gap-2">
                <label className="group flex-1">
                  <input type="radio" name="type" value="singolo" defaultChecked={type === "singolo"} className="peer hidden" />
                  <div className="slanted-chip border border-outline-variant bg-surface-container-highest px-1 py-2 text-center font-mono text-[10px] text-on-surface-variant peer-checked:bg-secondary-fixed peer-checked:text-on-secondary-fixed">
                    SINGOLA
                  </div>
                </label>
                <label className="group flex-1">
                  <input type="radio" name="type" value="gruppo" defaultChecked={type === "gruppo"} className="peer hidden" />
                  <div className="slanted-chip border border-outline-variant bg-surface-container-highest px-1 py-2 text-center font-mono text-[10px] text-on-surface-variant peer-checked:bg-secondary-fixed peer-checked:text-on-secondary-fixed">
                    GRUPPO
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="mb-4 block font-mono text-[10px] tracking-widest text-on-surface-variant uppercase">
                Prezzo orario
              </label>
              <input
                name="maxPrice"
                type="range"
                min={20}
                max={150}
                defaultValue={maxPrice}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-surface-container-highest accent-secondary-fixed"
              />
              <div className="mt-2 flex justify-between font-mono text-[10px] text-on-surface-variant">
                <span>20€</span>
                <span className="font-bold text-secondary-fixed">Max: {maxPrice}€</span>
                <span>150€</span>
              </div>
            </div>

            {near && (
              <>
                <input type="hidden" name="lat" value={lat} />
                <input type="hidden" name="lng" value={lng} />
              </>
            )}

            <button
              type="submit"
              className="w-full bg-primary py-4 font-mono text-label-caps text-on-primary uppercase italic tracking-wider transition-all hover:bg-secondary-fixed hover:text-on-secondary-fixed active:scale-95"
            >
              Applica Filtri
            </button>
          </form>
        </aside>

        {/* Results grid */}
        <div className="grid flex-1 grid-cols-1 gap-8 md:grid-cols-2 2xl:grid-cols-3">
          {results.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-2 py-16 text-center">
              <span className="text-3xl">🎾</span>
              <p className="font-heading text-headline-md text-on-surface">Palla a rete!</p>
              <p className="max-w-xs text-sm text-on-surface-variant">
                {near
                  ? "Nessun coach entro 50 km dalla tua posizione. Prova ad allargare la ricerca per città."
                  : "Nessun coach trovato con questi filtri. Prova ad allargare il campo di ricerca."}
              </p>
            </div>
          )}
          {results.map(({ coach, profile, locations, rating }) => (
            <div
              key={coach.id}
              className="card-clip group relative overflow-hidden border-l-2 border-secondary-fixed bg-surface-container-low shadow-xl transition-all duration-300 hover:border-l-8"
            >
              {profile.pricePerLesson != null && (
                <div className="absolute top-0 right-0 flex size-24 -translate-y-12 translate-x-12 rotate-45 items-center justify-center bg-secondary-fixed shadow-lg transition-transform group-hover:scale-110">
                  <div className="mt-8 mr-2 -rotate-45 font-mono text-label-caps font-bold text-on-secondary-fixed">
                    {profile.pricePerLesson}€
                  </div>
                </div>
              )}
              <div className="p-6">
                <div className="mb-6 flex gap-4">
                  <div className="relative">
                    <div className="size-20 overflow-hidden rounded-full border-2 border-secondary-fixed p-1 transition-transform group-hover:rotate-12">
                      <CoachAvatar name={coach.name} src={profile.avatarUrl} className="size-full text-xl" />
                    </div>
                    {profile.pricePerLesson != null && profile.pricePerLesson >= 60 && (
                      <div className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border-2 border-background bg-tertiary-container">
                        <Zap className="size-3.5 fill-current text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            rating.average != null && i < Math.round(rating.average)
                              ? "fill-secondary-fixed text-secondary-fixed"
                              : "text-outline"
                          }`}
                        />
                      ))}
                      <span className="ml-1 font-mono text-[10px] text-on-surface-variant">({rating.count})</span>
                    </div>
                    <h3 className="font-heading text-headline-md text-on-surface uppercase italic transition-colors group-hover:text-primary">
                      {coach.name}
                    </h3>
                    <p className="font-mono text-[10px] text-secondary-fixed-dim">
                      {locations.map((l) => l.city).join(", ") || "Paideio"}
                    </p>
                  </div>
                </div>
                <p className="mb-8 line-clamp-3 font-sans text-on-surface-variant">{profile.bio}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {parseJsonArray(profile.trainingTypes)
                      .slice(0, 2)
                      .map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1 border border-outline-variant/30 bg-surface-container-highest px-2 py-1 font-mono text-[10px] text-outline"
                        >
                          {t === "singolo" ? <User className="size-3" /> : <Users className="size-3" />}
                          {t === "singolo" ? "SINGOLA" : "GRUPPO"}
                        </span>
                      ))}
                  </div>
                  <FavoriteButton coachId={coach.id} initialFavorite={favoriteIds.has(coach.id)} isPlayer={isPlayer} />
                </div>
                <Link
                  href={`/coach/${coach.id}`}
                  className="group/btn mt-4 flex items-center gap-2 font-mono text-label-caps font-bold text-secondary-fixed uppercase italic transition-all hover:gap-4"
                >
                  Vedi Profilo <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
