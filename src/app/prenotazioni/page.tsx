import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getBookingsForPlayer, getPlayerAchievements } from "@/lib/queries";
import { AchievementsPanel } from "@/components/achievements-panel";
import { PlayerBookingsOverview } from "@/components/player-bookings-overview";

export default async function PrenotazioniPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "player") redirect("/");

  const [bookings, achievements] = await Promise.all([
    getBookingsForPlayer(user.id),
    getPlayerAchievements(user.id),
  ]);

  return (
    <div className="hex-texture mx-auto max-w-6xl px-4 py-10 md:px-8">
      <p className="ui-kicker">Area giocatore</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="editorial-title text-headline-lg-mobile text-calce md:text-headline-lg">
            Le mie lezioni
          </h1>
          <p className="mt-3 max-w-2xl text-nebbia">
            Controlla le richieste, organizza i prossimi allenamenti e ritrova lo storico delle lezioni.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <AchievementsPanel achievements={achievements} />
      </div>

      <div className="mt-8">
        <PlayerBookingsOverview
          items={bookings.map(({ booking, coach, coachAvatarUrl, location, canReview, isReviewed }) => ({
            id: booking.id,
            coachName: coach?.name ?? "Coach",
            coachAvatarUrl,
            locationName: location?.name ?? "Campo non disponibile",
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            type: booking.type,
            level: booking.level,
            status: booking.status,
            notes: booking.notes,
            canReview,
            isReviewed,
            coachMessage: booking.coachMessage,
            proposedDate: booking.proposedDate,
            proposedStartTime: booking.proposedStartTime,
            proposedEndTime: booking.proposedEndTime,
          }))}
        />
      </div>
    </div>
  );
}
