import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { locations } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { LocationManager } from "@/components/location-manager";

export default async function CampiPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const coachLocations = await db.query.locations.findMany({ where: eq(locations.coachId, user.id) });

  return <LocationManager initialLocations={coachLocations} />;
}
