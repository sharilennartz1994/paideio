import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { locations, availabilitySlots } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { AvailabilityManager } from "@/components/availability-manager";

export default async function OrariPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [coachLocations, slots] = await Promise.all([
    db.query.locations.findMany({ where: eq(locations.coachId, user.id) }),
    db.query.availabilitySlots.findMany({ where: eq(availabilitySlots.coachId, user.id) }),
  ]);

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-heading text-2xl text-calce">Quando sei disponibile</h2>
        <p className="mt-1 text-sm text-nebbia">Crea turni settimanali ricorrenti. Le richieste già attive bloccano automaticamente lo slot.</p>
      </div>
      <div className="border border-outline-variant/20 bg-surface-container p-6 shadow-2xl">
      <AvailabilityManager locations={coachLocations} initialSlots={slots} />
      </div>
    </div>
  );
}
