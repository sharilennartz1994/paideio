import { notFound } from "next/navigation";
import { Quote, Triangle } from "lucide-react";
import {
  getCoachDetail,
  getCoachCalendar,
  getCoachReviews,
  getFavoriteCoachIds,
  parseJsonArray,
} from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { BookingCalendar } from "@/components/booking-calendar";
import { CoachAvatar } from "@/components/coach-avatar";
import { StarRatingDisplay } from "@/components/star-rating";
import { FavoriteButton } from "@/components/favorite-button";

export default async function CoachDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getCoachDetail(id);
  if (!detail) notFound();

  const user = await getCurrentUser();
  const isPlayer = user?.role === "player";
  const [calendar, reviews, favoriteIds] = await Promise.all([
    getCoachCalendar(id),
    getCoachReviews(id),
    isPlayer ? getFavoriteCoachIds(user.id) : Promise.resolve(new Set<string>()),
  ]);
  const trainingTypes = parseJsonArray(detail.profile.trainingTypes);
  const levels = parseJsonArray(detail.profile.levels);

  return (
    <div className="pb-32">
      {/* Cover + avatar */}
      <section className="relative mb-12 overflow-hidden">
        <div className="relative h-64 w-full md:h-96">
          <div className="hex-texture absolute inset-0 bg-gradient-to-br from-court via-surface-container-lowest to-primary-container/30" />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        <div className="relative z-20 -mt-24 flex flex-col items-center gap-8 px-4 md:flex-row md:items-end md:px-16">
          <div className="group relative">
            <div className="animate-active-ring absolute -inset-2 rounded-full bg-[conic-gradient(from_0deg,var(--secondary-fixed),var(--primary-container),var(--secondary-fixed))] opacity-75 blur-sm" />
            <div className="relative size-40 overflow-hidden rounded-full border-4 border-background shadow-2xl md:size-56">
              <CoachAvatar name={detail.coach.name} src={detail.profile.avatarUrl} className="size-full text-5xl" />
            </div>
          </div>
          <div className="flex-grow pb-4 text-center md:text-left">
            <h1 className="font-heading text-headline-lg-mobile text-on-background uppercase italic md:text-headline-lg">
              {detail.coach.name}
            </h1>
            <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
              {trainingTypes.map((t) => (
                <span
                  key={t}
                  className="skew-x-[-12deg] border border-outline-variant bg-surface-container-highest px-3 py-1 font-mono text-xs text-primary"
                >
                  <span className="inline-block skew-x-[12deg]">{t === "singolo" ? "Singolo" : "Gruppo"}</span>
                </span>
              ))}
              {levels.map((l) => (
                <span
                  key={l}
                  className="skew-x-[-12deg] border border-outline-variant bg-surface-container-highest px-3 py-1 font-mono text-xs text-primary capitalize"
                >
                  <span className="inline-block skew-x-[12deg]">{l}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="hidden shrink-0 flex-col items-center gap-1 border-l-4 border-secondary-fixed bg-surface-container/80 p-4 backdrop-blur lg:flex">
            <StarRatingDisplay rating={detail.rating.average} size="lg" />
            <span className="font-mono text-label-caps text-on-surface-variant">
              {detail.rating.count} {detail.rating.count === 1 ? "recensione" : "recensioni"}
            </span>
          </div>
          <FavoriteButton
            coachId={id}
            initialFavorite={favoriteIds.has(id)}
            isPlayer={isPlayer}
            className="absolute top-4 right-4 border-outline-variant bg-surface-container/80 md:static"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 px-4 md:px-16 lg:grid-cols-12">
        {/* Left: bio + reviews */}
        <div className="space-y-12 lg:col-span-7">
          <article className="hex-texture relative overflow-hidden bg-surface-container-low p-8">
            <div className="mb-6 h-1 w-24 skew-x-[-15deg] bg-secondary-fixed" />
            <h3 className="mb-4 font-heading text-headline-md text-primary uppercase">Biografia</h3>
            <p className="font-sans text-body-lg leading-relaxed text-on-surface-variant">{detail.profile.bio}</p>
            <ul className="mt-8 space-y-4 font-mono text-on-surface">
              <li className="flex items-center gap-3">
                <Triangle className="size-3 fill-secondary-fixed text-secondary-fixed" />
                Coach dal {new Date(detail.coach.createdAt).getFullYear()}
              </li>
              <li className="flex items-center gap-3">
                <Triangle className="size-3 fill-secondary-fixed text-secondary-fixed" />
                {detail.lessonsCompleted} {detail.lessonsCompleted === 1 ? "lezione svolta" : "lezioni svolte"}
              </li>
              <li className="flex items-center gap-3">
                <Triangle className="size-3 fill-secondary-fixed text-secondary-fixed" />
                {detail.locations.map((l) => l.name).join(" · ")}
              </li>
            </ul>
          </article>

          <section>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h3 className="font-heading text-headline-md text-on-background uppercase">Recensioni</h3>
                <div className="mt-2 h-1 w-24 skew-x-[-15deg] bg-secondary-fixed" />
              </div>
            </div>
            {reviews.length === 0 && (
              <p className="text-sm text-on-surface-variant">Nessuna recensione ancora — sii il primo a lasciarne una!</p>
            )}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {reviews.map(({ review, player }) => (
                <div key={review.id} className="relative bg-surface-container-highest p-6">
                  <Quote className="absolute top-4 right-4 size-12 text-on-surface opacity-10" />
                  <StarRatingDisplay rating={review.rating} size="sm" />
                  {review.comment && <p className="mt-3 mb-4 font-sans text-on-surface">&ldquo;{review.comment}&rdquo;</p>}
                  <div className="flex items-center gap-3">
                    {player && <CoachAvatar name={player.name} className="size-8 text-xs" />}
                    <span className="font-mono text-xs text-on-surface-variant">{player?.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: booking */}
        <div className="lg:col-span-5">
          <BookingCalendar
            coachId={id}
            slots={calendar}
            trainingTypes={trainingTypes}
            levels={levels}
            isPlayer={isPlayer}
            pricePerLesson={detail.profile.pricePerLesson}
          />
        </div>
      </div>
    </div>
  );
}
