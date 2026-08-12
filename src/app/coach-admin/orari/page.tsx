import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { locations, availabilitySlots } from "@/lib/db/schema";
import { getCoachSchedule, getCoachClosedDays } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { AvailabilityManager } from "@/components/availability-manager";
import { ScheduleExceptions } from "@/components/schedule-exceptions";

export default async function OrariPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [coachLocations, slots, schedule, closedDays] = await Promise.all([
    db.query.locations.findMany({ where: eq(locations.coachId, user.id) }),
    db.query.availabilitySlots.findMany({ where: eq(availabilitySlots.coachId, user.id) }),
    getCoachSchedule(user.id),
    getCoachClosedDays(user.id),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="mb-5">
          <h2 className="font-heading text-2xl text-calce">Quando sei disponibile</h2>
          <p className="mt-1 text-sm text-nebbia">
            Pubblica le fasce in cui sei in campo, anche ampie. I giocatori ci prenotano dentro lezioni da un’ora o un’ora e mezza, e ogni prenotazione libera automaticamente il resto della fascia.
          </p>
        </div>
        <div className="border border-outline-variant/20 bg-surface-container p-6 shadow-2xl">
          <AvailabilityManager locations={coachLocations} initialSlots={slots} />
        </div>
      </section>

      {coachLocations.length > 0 && (
        <section>
          <div className="mb-5">
            <h2 className="font-heading text-2xl text-calce">Le prossime date</h2>
            <p className="mt-1 text-sm text-nebbia">
              Le fasce qui sopra si ripetono ogni settimana. Se una data precisa non ti va bene, chiudila
              qui: la ricorrenza resta, sparisce solo quel giorno dalle disponibilità dei giocatori.
            </p>
          </div>
          <div className="border border-outline-variant/20 bg-surface-container p-6 shadow-2xl">
            <ScheduleExceptions slots={schedule} closedDays={closedDays} />
          </div>
        </section>
      )}
    </div>
  );
}
