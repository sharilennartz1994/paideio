import Link from "next/link";
import { Inbox, CalendarCheck, Star, ArrowRight, User, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getCoachAdminStats, getBookingsForCoach } from "@/lib/queries";
import { BookingRequestActions } from "@/components/booking-request-actions";
import { CoachAvatar } from "@/components/coach-avatar";

export default async function CoachAdminDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [stats, bookings] = await Promise.all([getCoachAdminStats(user.id), getBookingsForCoach(user.id)]);
  const pending = bookings.filter(({ booking }) => booking.status === "richiesta").slice(0, 3);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-headline-lg-mobile text-secondary-fixed uppercase italic md:text-headline-lg">
          Bentornato, {user.name.split(" ")[0]}
        </h1>
        <p className="font-sans text-body-lg text-on-surface-variant">
          {stats.pendingRequests > 0
            ? "Ci sono giocatori in attesa della tua risposta."
            : "Nessuna richiesta in sospeso: campo libero."}
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden border-l-4 border-primary bg-surface-container-high p-6 shadow-xl">
          <Inbox className="absolute -right-4 -bottom-4 size-32 text-on-surface opacity-5 transition-transform duration-500 group-hover:scale-110" />
          <p className="mb-2 font-mono text-label-caps text-on-surface-variant uppercase">Richieste in attesa</p>
          <p className="font-heading text-headline-lg text-on-surface">{stats.pendingRequests}</p>
        </div>
        <div className="group relative overflow-hidden border-l-4 border-secondary-fixed bg-surface-container-high p-6 shadow-xl">
          <CalendarCheck className="absolute -right-4 -bottom-4 size-32 text-on-surface opacity-5 transition-transform duration-500 group-hover:scale-110" />
          <p className="mb-2 font-mono text-label-caps text-on-surface-variant uppercase">Confermate questa settimana</p>
          <p className="font-heading text-headline-lg text-on-surface">{stats.confirmedThisWeek}</p>
        </div>
        <div className="group relative overflow-hidden border-l-4 border-tertiary bg-surface-container-high p-6 shadow-xl">
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
            <h2 className="flex items-center gap-3 font-heading text-headline-md uppercase italic">
              <Clock className="size-5 text-primary" />
              Richieste Pendenti
            </h2>
            <Link href="/coach-admin/richieste" className="font-mono text-[10px] text-primary hover:underline">
              VEDI TUTTE
            </Link>
          </div>
          {pending.length === 0 && (
            <p className="py-8 text-center text-sm text-on-surface-variant">
              Nessuna richiesta in sospeso al momento.
            </p>
          )}
          {pending.map(({ booking, player, location }) => (
            <div key={booking.id} className="card-clip flex flex-col gap-6 bg-surface-container-high p-6 transition-all hover:bg-surface-bright md:flex-row">
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
                  <div className="mt-2 border-l-2 border-primary bg-surface-container-lowest p-3">
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
            <h2 className="mb-6 font-heading text-headline-md uppercase italic">Gestione Rapida</h2>
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
