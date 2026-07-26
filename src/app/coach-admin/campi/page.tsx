import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { locations } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { LocationManager } from "@/components/location-manager";

export default async function CampiPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const coachLocations = await db.query.locations.findMany({ where: eq(locations.coachId, user.id) });

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-heading text-2xl text-calce">Dove alleni</h2>
        <p className="mt-1 text-sm text-nebbia">Aggiungi i club una sola volta: li ritroverai quando pubblichi gli orari.</p>
      </div>
      <div className="border border-outline-variant/20 bg-surface-container p-6 shadow-2xl">
      <LocationManager initialLocations={coachLocations} />
      </div>
    </div>
  );
}
