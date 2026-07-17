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

  return <AvailabilityManager locations={coachLocations} initialSlots={slots} />;
}
