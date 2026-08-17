import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Clock, MapPin, Search, User, Users } from "@/components/icons/paideio-icons";
import { getCurrentUser } from "@/lib/session";
import { getFavoriteCoaches, parseJsonArray, levelBadgeClass } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { CoachAvatar } from "@/components/coach-avatar";
import { StarRatingDisplay } from "@/components/star-rating";
import { FavoriteButton } from "@/components/favorite-button";
import { GameCta, GameEmptyState } from "@/components/design";

export default async function PreferitiPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "player") redirect("/");

  const favorites = await getFavoriteCoaches(user.id);

  return (
    <div className="hex-texture mx-auto max-w-4xl px-4 py-10">
      <p className="font-mono text-label-caps text-primary uppercase">Salvati</p>
      <h1 className="mt-2 font-heading text-headline-lg-mobile text-on-surface md:text-headline-lg">
        I miei preferiti
      </h1>
      <p className="mt-1.5 font-sans text-on-surface-variant">I coach che hai salvato per dopo.</p>

      <div className="mt-8 grid gap-4">
        {favorites.length === 0 && (
          <GameEmptyState
            asset="backpack"
            title="Lo zaino è ancora vuoto"
            description="Salva i coach che ti interessano per ritrovarli qui prima della prossima partita."
            action={
              <GameCta href="/cerca" showBall arrow tone="ball">
                <Search /> Trova un coach
              </GameCta>
            }
          />
        )}
        {favorites.map(({ coach, profile, locations, rating, hasPublishedAvailability, offersLessons }) => (
          <div
            key={coach.id}
            className="card-clip group flex flex-col gap-4 border-t border-accent-ball-ink bg-surface-container-low p-6 transition-colors hover:bg-surface-container-high"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <CoachAvatar name={coach.name} src={profile.avatarUrl} />
                <div>
                  <h2 className="font-heading text-headline-md text-on-surface">{coach.name}</h2>
                  <p className="flex items-center gap-1 font-mono text-[11px] text-on-surface-variant">
                    <MapPin className="size-3" />
                    {locations.map((l) => l.city).join(", ")}
                  </p>
                  <div className="mt-1">
                    <StarRatingDisplay rating={rating.average} count={rating.count} />
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                {profile.pricePerLesson != null && (
                  <span className="font-mono text-label-caps font-bold text-accent-ball-ink">
                    €{profile.pricePerLesson}/lezione
                  </span>
                )}
                <FavoriteButton coachId={coach.id} initialFavorite viewerRole="player" />
              </div>
            </div>
            <p className="line-clamp-2 font-sans text-sm text-on-surface-variant">{profile.bio}</p>
            <div className="flex flex-wrap gap-1.5">
              {parseJsonArray(profile.trainingTypes).map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 border border-outline-variant/30 bg-surface-container-highest px-2 py-1 font-mono text-[10px] text-outline uppercase"
                >
                  {t === "singolo" ? <User className="size-3" /> : <Users className="size-3" />}
                  {t === "singolo" ? "Singolo" : "Gruppo"}
                </span>
              ))}
              {parseJsonArray(profile.levels).map((l) => (
                <Badge key={l} className={`${levelBadgeClass(l)} rounded-full border-transparent font-mono text-[11px] capitalize`}>
                  {l}
                </Badge>
              ))}
            </div>
            {/* Un preferito può essere salvato prima che il coach apra il
                calendario: in quel caso non compare in /cerca e la lista è
                l'unico modo per ritrovarlo, quindi va detto a che punto è. */}
            {!(hasPublishedAvailability && offersLessons) && (
              <p className="flex items-center gap-2 border border-nebbia/30 bg-carta-bassa px-3 py-2 text-xs text-nebbia">
                <Clock className="size-3.5 shrink-0 text-accent-ball-ink" aria-hidden />
                {hasPublishedAvailability
                  ? "Sta ancora completando il profilo - torna a controllare, lo trovi sempre qui."
                  : "Non ha ancora pubblicato orari - torna a controllare, lo trovi sempre qui."}
              </p>
            )}
            <Link
              href={`/coach/${coach.id}`}
              className="group/btn flex w-fit items-center gap-2 font-heading text-label-caps font-bold text-accent-ball-ink uppercase transition-colors duration-150 hover:text-calce"
            >
              {hasPublishedAvailability && offersLessons ? "Vedi profilo e calendario" : "Vedi profilo"}{" "}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
