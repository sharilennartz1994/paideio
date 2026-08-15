import { getCurrentUser } from "@/lib/session";
import {
  getBookingsForCoach,
  getCoachSchedule,
  getCoachProfileBasics,
  BOOKING_STATUS_CONFIG,
} from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { BookingRequestActions } from "@/components/booking-request-actions";
import type { ProposalWindow } from "@/components/booking-request-actions";
import { CoachAvatar } from "@/components/coach-avatar";
import { GameEmptyState } from "@/components/design";

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default async function RichiestePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [bookings, schedule, profile] = await Promise.all([
    getBookingsForCoach(user.id),
    // Le finestre servono al form "proponi un altro orario": il client ci
    // ricava gli inizi proponibili con `proposableStarts`, la stessa funzione
    // che valida la proposta lato server.
    getCoachSchedule(user.id, 28),
    getCoachProfileBasics(user.id),
  ]);

  const windows: ProposalWindow[] = schedule.map((slot) => ({
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    locationId: slot.locationId,
    locationName: slot.locationName,
    busy: slot.busy,
    closed: slot.closed,
  }));

  return (
    <div className="flex flex-col gap-4">
      {bookings.length === 0 && (
        <GameEmptyState
          asset="ballBasket"
          title="La lobby è libera"
          description="Nessuna richiesta in attesa. La prossima sfida potrebbe arrivare da un momento all’altro."
        />
      )}
      {bookings.map(({ booking, player, location }) => {
        const status = BOOKING_STATUS_CONFIG[booking.status];
        return (
          <div key={booking.id} className="card-clip flex flex-col gap-3 bg-surface-container-high p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                {player && <CoachAvatar name={player.name} className="size-10 text-sm" />}
                <div>
                  <h3 className="font-heading text-headline-md text-on-surface">{player?.name}</h3>
                  <p className="mt-1 font-mono text-[11px] text-on-surface-variant">
                    {booking.date} · {booking.startTime}–{booking.endTime} · {location?.name}
                  </p>
                </div>
              </div>
              <Badge className={`${status.className} rounded-full border-transparent font-mono text-[11px] uppercase`}>
                {status.label}
              </Badge>
            </div>
            <p className="font-sans text-sm text-on-surface-variant capitalize">
              {booking.type} · livello {booking.level}
            </p>
            {booking.notes && (
              <p className="border-t-2 border-vetro bg-surface-container-lowest p-3 font-sans text-sm text-on-surface">
                &ldquo;{booking.notes}&rdquo;
              </p>
            )}
            {booking.coachMessage && (
              <p className="border-t-2 border-accent-cyan-ink bg-surface-container-lowest p-3 font-sans text-sm text-on-surface">
                <span className="font-heading text-[10px] text-nebbia uppercase">
                  La tua motivazione
                </span>
                <br />
                {booking.coachMessage}
              </p>
            )}
            {booking.status === "controproposta" && booking.proposedDate && (
              <p className="border border-accent-cyan-ink/45 bg-surface-container-lowest p-3 font-sans text-sm text-on-surface">
                Hai proposto <strong>{formatDate(booking.proposedDate)}</strong> alle{" "}
                <strong>
                  {booking.proposedStartTime}–{booking.proposedEndTime}
                </strong>
                . La lezione è in attesa della risposta di {player?.name ?? "il giocatore"} e non
                occupa il campo finché non accetta.
              </p>
            )}
            {booking.status === "richiesta" && (
              <BookingRequestActions
                bookingId={booking.id}
                playerId={booking.playerId}
                playerName={player?.name ?? "Il giocatore"}
                date={booking.date}
                startTime={booking.startTime}
                endTime={booking.endTime}
                type={booking.type}
                locationId={booking.locationId}
                windows={windows}
                groupCapacity={profile.groupCapacity}
                trainingTypes={profile.trainingTypes}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
