import { getCurrentUser } from "@/lib/session";
import { getBookingsForCoach, BOOKING_STATUS_CONFIG } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { BookingRequestActions } from "@/components/booking-request-actions";
import { CoachAvatar } from "@/components/coach-avatar";
import { GameEmptyState } from "@/components/design";

export default async function RichiestePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const bookings = await getBookingsForCoach(user.id);

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
            {booking.status === "richiesta" && <BookingRequestActions bookingId={booking.id} />}
          </div>
        );
      })}
    </div>
  );
}
