import Link from "next/link";
import { eq } from "drizzle-orm";
import { Inbox, CalendarCheck, Star, ArrowRight, User, Clock, Check, Circle, Eye, Sparkles } from "@/components/icons/paideio-icons";
import { getCurrentCoach } from "@/lib/session";
import { getCoachAdminStats, getBookingsForCoach, parseJsonArray } from "@/lib/queries";
import { db } from "@/lib/db";
import { availabilitySlots, locations } from "@/lib/db/schema";
import { BookingRequestActions } from "@/components/booking-request-actions";
import { CoachAvatar } from "@/components/coach-avatar";
import { GameAsset, GameEmptyState } from "@/components/design/field-assets";

export default async function CoachAdminDashboard() {
  const current = await getCurrentCoach();
  if (!current?.profile) return null;
  const { user, profile } = current;

  const [stats, bookings, coachLocations, slots] = await Promise.all([
    getCoachAdminStats(user.id),
    getBookingsForCoach(user.id),
    db.query.locations.findMany({ where: eq(locations.coachId, user.id) }),
    db.query.availabilitySlots.findMany({ where: eq(availabilitySlots.coachId, user.id) }),
  ]);
  const pending = bookings.filter(({ booking }) => booking.status === "richiesta").slice(0, 3);
  const setup = [
    {
      label: "Profilo pubblico",
      detail: "Foto, presentazione, livelli e tariffa",
      href: "/coach-admin/profilo",
      done:
        Boolean(profile.avatarUrl && profile.bio.trim() && profile.pricePerLesson) &&
        parseJsonArray(profile.levels).length > 0 &&
        parseJsonArray(profile.trainingTypes).length > 0,
    },
    {
      label: "Campi di allenamento",
      detail: "Almeno un club dove ricevere giocatori",
      href: "/coach-admin/campi",
      done: coachLocations.length > 0,
    },
    {
      label: "Disponibilità",
      detail: "Pubblica almeno un turno settimanale",
      href: "/coach-admin/orari",
      done: slots.length > 0,
    },
  ];
  const completedSetup = setup.filter((item) => item.done).length;
  const setupPercent = Math.round((completedSetup / setup.length) * 100);
  const nextSetup = setup.find((item) => !item.done);

  return (
    <div>
      <div className="paper-grain mb-10 grid overflow-hidden border border-nebbia/20 bg-carta-bassa px-6 pt-7 md:grid-cols-[1fr_220px] md:items-end md:px-9">
        <div className="pb-8">
          <p className="ui-kicker mb-3">Il tuo lato del campo</p>
          <h1 className="font-heading text-headline-lg-mobile text-calce md:text-headline-lg">
            Bentornato, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-2 font-sans text-body-lg text-on-surface-variant">
            {stats.pendingRequests > 0
              ? "Ci sono giocatori in attesa della tua risposta."
              : "Nessuna richiesta in sospeso: campo libero."}
          </p>
        </div>
        <GameAsset
          name="playerSmash"
          decorative
          sizes="220px"
          className="hidden max-h-64 w-auto justify-self-center md:block"
        />
      </div>

      <section className="mb-8 grid gap-5 border border-nebbia/25 bg-carta-alta p-5 md:grid-cols-[1fr_1.25fr] md:p-7">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-accent-ball-ink" />
            <h2 className="font-heading text-xl text-calce">Il tuo profilo è pronto al {setupPercent}%</h2>
          </div>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-nebbia">
            Completa questi passaggi perché i giocatori possano trovarti, capire la tua proposta e scegliere un orario.
          </p>
          {/* Senza turni il coach non compare in /cerca (vedi `searchCoaches`).
              Se non glielo diciamo qui, l'unico segnale è il silenzio. */}
          {slots.length === 0 && (
            <p className="mt-4 flex items-start gap-2 border border-nebbia/30 bg-carta-bassa p-3 text-sm leading-relaxed text-nebbia">
              <Clock className="mt-0.5 size-4 shrink-0 text-accent-ball-ink" aria-hidden />
              <span>
                Finché non pubblichi almeno un turno <strong className="text-calce">non compari nella ricerca</strong>:
                chi arriva sul tuo profilo può solo salvarti tra i preferiti.
              </span>
            </p>
          )}
          <div
            className="mt-5 h-2 overflow-hidden bg-nebbia/15"
            role="progressbar"
            aria-label="Completamento configurazione"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={setupPercent}
          >
            <div className="h-full bg-accent-ball-ink transition-[width] duration-300" style={{ width: `${setupPercent}%` }} />
          </div>
          {nextSetup ? (
            <Link
              href={nextSetup.href}
              className="mt-5 inline-flex min-h-11 items-center gap-2 border border-game-ink bg-game-ball px-4 text-sm font-semibold text-game-ink hover:bg-game-white"
            >
              Continua da “{nextSetup.label}” <ArrowRight className="size-4" />
            </Link>
          ) : (
            <Link href={`/coach/${user.id}`} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-vetro hover:text-calce">
              <Eye className="size-4" /> Guarda il profilo come giocatore
            </Link>
          )}
        </div>
        <ol className="divide-y divide-nebbia/20 border-y border-nebbia/20">
          {setup.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="flex min-h-16 items-center gap-3 py-3 hover:text-vetro">
                {item.done ? (
                  <span className="flex size-7 shrink-0 items-center justify-center bg-vetro text-carta"><Check className="size-4" /></span>
                ) : (
                  <span className="flex size-7 shrink-0 items-center justify-center border border-nebbia/40"><Circle className="size-3 text-nebbia" /></span>
                )}
                <span className="flex-1">
                  <strong className="block text-sm text-calce">{item.label}</strong>
                  <span className="text-xs text-nebbia">{item.detail}</span>
                </span>
                <ArrowRight className="size-4 text-nebbia" />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="group relative overflow-hidden border-t border-primary bg-surface-container-high p-6">
          <Inbox className="absolute -right-4 -bottom-4 size-32 text-on-surface opacity-5 transition-transform duration-500 group-hover:scale-110" />
          <p className="mb-2 font-mono text-label-caps text-on-surface-variant uppercase">Richieste in attesa</p>
          <p className="font-heading text-headline-lg text-on-surface">{stats.pendingRequests}</p>
        </div>
        <div className="group relative overflow-hidden border-t border-secondary-fixed bg-surface-container-high p-6">
          <CalendarCheck className="absolute -right-4 -bottom-4 size-32 text-on-surface opacity-5 transition-transform duration-500 group-hover:scale-110" />
          <p className="mb-2 font-mono text-label-caps text-on-surface-variant uppercase">Confermate questa settimana</p>
          <p className="font-heading text-headline-lg text-on-surface">{stats.confirmedThisWeek}</p>
        </div>
        <div className="group relative overflow-hidden border-t border-tertiary bg-surface-container-high p-6">
          <Star className="absolute -right-4 -bottom-4 size-32 text-on-surface opacity-5 transition-transform duration-500 group-hover:scale-110" />
          <p className="mb-2 font-mono text-label-caps text-on-surface-variant uppercase">Valutazione media</p>
          <p className="font-heading text-headline-lg text-on-surface">
            {stats.rating.average != null ? stats.rating.average.toFixed(1) : "—"}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            {stats.rating.count === 0 ? "nessuna recensione ancora" : `su ${stats.rating.count} recensioni`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
            <h2 className="flex items-center gap-3 font-heading text-headline-md">
              <Clock className="size-5 text-primary" />
              Richieste Pendenti
            </h2>
            <Link href="/coach-admin/richieste" className="font-mono text-[10px] text-primary hover:underline">
              VEDI TUTTE
            </Link>
          </div>
          {pending.length === 0 && (
            <GameEmptyState
              asset="ballBasket"
              title="Cesta pronta"
              description="Nessuna richiesta in sospeso. Usa questo momento per preparare i prossimi allenamenti."
            />
          )}
          {pending.map(({ booking, player, location }) => (
            <div key={booking.id} className="card-clip flex flex-col gap-6 bg-surface-container-high p-6 transition-colors duration-150 hover:bg-surface-bright md:flex-row">
              {player ? (
                <CoachAvatar name={player.name} className="size-20 shrink-0 border-2 border-secondary-fixed text-xl" />
              ) : (
                <div className="flex size-20 shrink-0 items-center justify-center rounded-full border-2 border-outline-variant bg-surface-container-highest">
                  <User className="size-8 text-outline" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-headline-md text-on-surface">{player?.name}</h3>
                    <div className="flex items-center gap-4 font-mono text-[11px] text-on-surface-variant">
                      <span className="capitalize">Livello {booking.level}</span>
                      <span>
                        {booking.startTime}–{booking.endTime}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-headline-md text-secondary-fixed">{booking.date}</p>
                    <p className="font-mono text-[10px] text-on-surface-variant">{location?.name}</p>
                  </div>
                </div>
                {booking.notes && (
                  <div className="mt-2 border-t-2 border-primary bg-surface-container-lowest p-3">
                    <p className="font-sans text-sm text-on-surface italic">&ldquo;{booking.notes}&rdquo;</p>
                  </div>
                )}
                <div className="pt-2">
                  <BookingRequestActions bookingId={booking.id} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="border border-outline-variant/20 bg-surface-container p-6 shadow-2xl">
            <h2 className="font-heading text-headline-md">Gestione rapida</h2>
            <p className="mt-2 mb-6 text-sm text-nebbia">Aggiorna ciò che i giocatori vedono prima di prenotare.</p>
            <div className="space-y-3">
              <Link
                href="/coach-admin/profilo"
                className="flex items-center justify-between border border-outline-variant/20 bg-surface-container-low p-4 text-sm text-on-surface transition-colors hover:border-primary"
              >
                Profilo &amp; tariffa <ArrowRight className="size-4 text-primary" />
              </Link>
              <Link
                href="/coach-admin/campi"
                className="flex items-center justify-between border border-outline-variant/20 bg-surface-container-low p-4 text-sm text-on-surface transition-colors hover:border-primary"
              >
                I tuoi club <ArrowRight className="size-4 text-primary" />
              </Link>
              <Link
                href="/coach-admin/orari"
                className="flex items-center justify-between border border-outline-variant/20 bg-surface-container-low p-4 text-sm text-on-surface transition-colors hover:border-primary"
              >
                Orari disponibili <ArrowRight className="size-4 text-primary" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
