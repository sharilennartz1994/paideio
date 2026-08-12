import { notFound } from "next/navigation";
import { CalendarDays, Quote, Triangle } from "@/components/icons/paideio-icons";
import {
  getCoachDetail,
  getCoachCalendar,
  getCoachReviews,
  getFavoriteCoachIds,
  parseJsonArray,
} from "@/lib/queries";
import { coachOffersLessons } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";
import { BookingCalendar } from "@/components/booking-calendar";
import { BookingHashScroll } from "@/components/booking-hash-scroll";
import { CoachAvatar } from "@/components/coach-avatar";
import { StarRatingDisplay } from "@/components/star-rating";
import { FavoriteButton } from "@/components/favorite-button";
import { GameAsset, GameCta, GameDivider } from "@/components/design";

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
  // Due condizioni distinte, entrambe necessarie. I turni sono settimanali,
  // quindi un coach che ne ha pubblicato almeno uno genera sempre slot nella
  // finestra di 21 giorni: calendario vuoto = nessun turno. Ma anche con i
  // turni, senza tipi di lezione e livelli ogni slot risulta pieno (vedi
  // `coachOffersLessons`). Questi coach non compaiono in /cerca, però la pagina
  // resta raggiungibile da link diretto e preferiti: lì la CTA diventa
  // "Salva tra i preferiti".
  const offersLessons = coachOffersLessons(levels, trainingTypes);
  const isBookable = offersLessons && calendar.length > 0;

  return (
    <div className="pb-32">
      <BookingHashScroll />
      <section className="paper-grain relative mb-12 overflow-hidden px-4 py-12 md:px-16 md:py-20">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-12">
        <div className="flex flex-col items-center gap-8 md:flex-row lg:col-span-8">
          <div className="group relative">
            <div className="relative size-40 overflow-hidden rounded-full border-2 border-vetro md:size-48">
              <CoachAvatar name={detail.coach.name} src={detail.profile.avatarUrl} className="size-full text-5xl" />
            </div>
          </div>
          {/* `min-w-0` + `break-words`: un nome lungo senza spazi (username o
              email) non si spezza da solo e a 40px sfonda il contenitore, che
              l'hero poi taglia con `overflow-hidden`. */}
          <div className="min-w-0 flex-grow pb-4 text-center md:text-left">
            <h1 className="font-heading text-[40px] break-words hyphens-auto text-calce md:text-[62px]">
              {detail.coach.name}
            </h1>
            <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
              {trainingTypes.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-vetro/60 bg-carta-alta px-3 py-1 text-sm text-vetro"
                >
                  <span>{t === "singolo" ? "Singolo" : "Gruppo"}</span>
                </span>
              ))}
              {levels.map((l) => (
                <span
                  key={l}
                  className="rounded-full border border-nebbia/40 bg-carta-alta px-3 py-1 text-sm text-nebbia capitalize"
                >
                  <span>{l}</span>
                </span>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
              {isBookable ? (
                <GameCta href="#prenota" tone="ball" showBall arrow size="large">
                  Scegli giorno e orario
                </GameCta>
              ) : (
                <FavoriteButton
                  coachId={id}
                  initialFavorite={favoriteIds.has(id)}
                  viewerRole={user?.role ?? null}
                  variant="cta"
                />
              )}
              {detail.profile.pricePerLesson != null && (
                <span className="flex min-h-13 items-center border border-nebbia/30 bg-carta-alta px-5 text-sm text-nebbia">
                  Da <strong className="ml-2 font-heading text-xl text-calce">€{detail.profile.pricePerLesson}</strong>
                </span>
              )}
            </div>
          </div>
          <div className="hidden shrink-0 flex-col items-center gap-1 border-t-2 border-vetro bg-carta-alta p-4 lg:flex">
            <StarRatingDisplay rating={detail.rating.average} size="lg" />
            <span className="text-sm text-nebbia">
              {detail.rating.count} {detail.rating.count === 1 ? "recensione" : "recensioni"}
            </span>
          </div>
          <FavoriteButton
            coachId={id}
            initialFavorite={favoriteIds.has(id)}
            viewerRole={user?.role ?? null}
            className="absolute top-4 right-4 border-outline-variant bg-surface-container/80 md:static"
          />
        </div>
        <div className="game-asset-stage hidden min-h-[360px] items-center justify-center lg:col-span-4 lg:flex">
          <GameAsset
            name="racket"
            decorative
            sizes="320px"
            className="max-h-[390px] w-auto"
          />
        </div>
        </div>
      </section>
      <GameDivider className="mb-10" />

      <section id="prenota" className="scroll-mt-24 px-4 md:px-16">
        <div className="mx-auto mb-6 flex max-w-6xl flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="ui-kicker">
              {isBookable ? `Prenota con ${detail.coach.name.split(" ")[0]}` : "Non ancora prenotabile"}
            </p>
            <h2 className="mt-2 font-heading text-3xl text-calce md:text-4xl">
              {isBookable ? "Trova il tuo momento in campo" : "Ancora nessun orario in calendario"}
            </h2>
          </div>
          <p className="flex max-w-md items-start gap-2 text-sm leading-relaxed text-nebbia">
            <CalendarDays className="mt-0.5 size-5 shrink-0 text-vetro" aria-hidden />
            {isBookable
              ? "Scegli uno slot, indica il tuo livello e invia la richiesta. Il coach dovrà confermarla."
              : offersLessons
                ? "Questo coach non ha ancora pubblicato turni, quindi non compare nella ricerca. Salvalo tra i preferiti per ritrovarlo quando apre il calendario."
                : "Questo coach sta ancora completando il profilo e non compare nella ricerca. Salvalo tra i preferiti per ritrovarlo quando apre le prenotazioni."}
          </p>
        </div>
        <div className="mx-auto max-w-6xl">
          <BookingCalendar
            coachId={id}
            slots={calendar}
            trainingTypes={trainingTypes}
            levels={levels}
            viewerRole={user?.role ?? null}
            pricePerLesson={detail.profile.pricePerLesson}
            initialFavorite={favoriteIds.has(id)}
            offersLessons={offersLessons}
          />
        </div>
      </section>

      <GameDivider className="my-12" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 md:px-8 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-12">
          <article className="glass-panel relative overflow-hidden p-8">
            <div className="mb-6 h-px w-24 bg-vetro" />
            <h2 className="mb-4 font-heading text-headline-md text-calce">Biografia</h2>
            <p className="font-sans text-body-lg leading-relaxed text-on-surface-variant">{detail.profile.bio}</p>
            <ul className="mt-8 space-y-4 text-calce">
              <li className="flex items-center gap-3">
                <Triangle className="size-3 fill-vetro text-vetro" />
                Coach dal {new Date(detail.coach.createdAt).getFullYear()}
              </li>
              <li className="flex items-center gap-3">
                <Triangle className="size-3 fill-vetro text-vetro" />
                {detail.lessonsCompleted} {detail.lessonsCompleted === 1 ? "lezione svolta" : "lezioni svolte"}
              </li>
              <li className="flex items-center gap-3">
                <Triangle className="size-3 fill-vetro text-vetro" />
                {detail.locations.map((l) => l.name).join(" · ")}
              </li>
            </ul>
          </article>

          <section>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="font-heading text-headline-md text-calce">Recensioni</h2>
                <div className="mt-2 h-px w-24 bg-vetro" />
              </div>
            </div>
            {reviews.length === 0 && (
              <p className="text-sm text-on-surface-variant">Nessuna recensione ancora - sii il primo a lasciarne una!</p>
            )}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {reviews.map(({ review, player }) => (
                <div key={review.id} className="glass-panel relative bg-carta-alta p-6">
                  <Quote className="absolute top-4 right-4 size-12 text-on-surface opacity-10" />
                  <StarRatingDisplay rating={review.rating} size="sm" />
                  {review.comment && <p className="mt-3 mb-4 font-sans text-on-surface">&ldquo;{review.comment}&rdquo;</p>}
                  <div className="flex items-center gap-3">
                    {player && <CoachAvatar name={player.name} className="size-8 text-xs" />}
                    <span className="text-sm text-nebbia">{player?.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
