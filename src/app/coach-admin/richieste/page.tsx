import { Inbox } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getBookingsForCoach, BOOKING_STATUS_CONFIG } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingRequestActions } from "@/components/booking-request-actions";
import { CoachAvatar } from "@/components/coach-avatar";

export default async function RichiestePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const bookings = await getBookingsForCoach(user.id);

  return (
    <div className="flex flex-col gap-3">
      {bookings.length === 0 && (
        <Card className="items-center py-12 text-center">
          <CardContent className="flex flex-col items-center gap-3">
            <div className="flex size-12 items-center justify-center bg-primary/10 text-primary">
              <Inbox className="size-6" />
            </div>
            <p className="text-muted-foreground">Nessuna richiesta di prenotazione, per ora.</p>
          </CardContent>
        </Card>
      )}
      {bookings.map(({ booking, player, location }) => {
        const status = BOOKING_STATUS_CONFIG[booking.status];
        return (
          <Card key={booking.id} className="py-5">
            <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
              <div className="flex items-center gap-3">
                {player && <CoachAvatar name={player.name} className="size-10 text-sm" />}
                <div>
                  <CardTitle className="text-base">{player?.name}</CardTitle>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {booking.date} · {booking.startTime}–{booking.endTime} · {location?.name}
                  </p>
                </div>
              </div>
              <Badge className={`${status.className} rounded-full border-transparent font-mono text-[11px] uppercase`}>
                {status.label}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground capitalize">
                {booking.type} · livello {booking.level}
              </p>
              {booking.notes && (
                <p className="border-l-2 border-primary bg-accent/40 py-2 pl-3 text-sm text-muted-foreground italic">
                  &ldquo;{booking.notes}&rdquo;
                </p>
              )}
              {booking.status === "richiesta" && <BookingRequestActions bookingId={booking.id} />}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
