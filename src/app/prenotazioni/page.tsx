import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, Search, XCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getBookingsForPlayer, getPlayerAchievements, BOOKING_STATUS_CONFIG } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CancelBookingButton } from "@/components/cancel-booking-button";
import { CoachAvatar } from "@/components/coach-avatar";
import { AchievementsPanel } from "@/components/achievements-panel";
import { ReviewForm } from "@/components/review-form";

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  richiesta: Clock,
  confermata: CheckCircle2,
  rifiutata: XCircle,
  annullata: XCircle,
};

export default async function PrenotazioniPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "player") redirect("/");

  const [bookings, achievements] = await Promise.all([
    getBookingsForPlayer(user.id),
    getPlayerAchievements(user.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="font-mono text-xs tracking-[0.14em] text-primary uppercase">Area giocatore</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">Le mie lezioni</h1>

      <div className="mt-6">
        <AchievementsPanel achievements={achievements} />
      </div>

      <div className="flex flex-col gap-3">
        {bookings.length === 0 && (
          <Card className="items-center py-12 text-center">
            <CardContent className="flex flex-col items-center gap-3">
              <div className="flex size-12 items-center justify-center bg-primary/10 text-primary">
                <CalendarDays className="size-6" />
              </div>
              <p className="text-muted-foreground">Non hai ancora nessuna prenotazione.</p>
              <Button
                nativeButton={false}
                render={<Link href="/cerca" />}
                className="cut-cta bg-ball font-mono text-xs font-bold tracking-wider text-ball-foreground uppercase hover:bg-ball/90"
              >
                <Search /> Trova un coach
              </Button>
            </CardContent>
          </Card>
        )}
        {bookings.map(({ booking, coach, coachAvatarUrl, location, canReview, isReviewed }) => {
          const status = BOOKING_STATUS_CONFIG[booking.status];
          const StatusIcon = STATUS_ICON[booking.status];
          const isConfirmed = booking.status === "confermata";
          return (
            <Card
              key={booking.id}
              className={`border-l-2 py-5 ${isConfirmed ? "border-l-ball" : "border-l-primary"}`}
            >
              <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                <div className="flex items-center gap-3">
                  {coach && <CoachAvatar name={coach.name} src={coachAvatarUrl} className="size-10 text-sm" />}
                  <div>
                    <CardTitle className="text-base">{coach?.name}</CardTitle>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {booking.date} · {booking.startTime}–{booking.endTime} · {location?.name}
                    </p>
                  </div>
                </div>
                <Badge className={`${status.className} gap-1 rounded-full border-transparent font-mono text-[11px] uppercase`}>
                  <StatusIcon className="size-3" />
                  {status.label}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm capitalize text-muted-foreground">
                    {booking.type} · livello {booking.level}
                    {booking.notes ? ` · "${booking.notes}"` : ""}
                  </p>
                  {(booking.status === "richiesta" || booking.status === "confermata") && (
                    <CancelBookingButton bookingId={booking.id} />
                  )}
                </div>
                {canReview && <ReviewForm bookingId={booking.id} coachName={coach?.name} />}
                {isReviewed && <p className="text-xs text-muted-foreground">Hai già recensito questa lezione.</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
