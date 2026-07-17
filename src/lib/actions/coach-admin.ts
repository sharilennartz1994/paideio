"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq, gte, inArray } from "drizzle-orm";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { locations, availabilitySlots, coachProfiles, bookings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { LEVELS, TRAINING_TYPES, toLocalDateString } from "@/lib/constants";

const MAX_AVATAR_BYTES = 4 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function requireCoach() {
  const user = await getCurrentUser();
  if (!user || user.role !== "coach") throw new Error("Devi accedere come coach.");
  return user;
}

export async function addLocation(input: {
  name: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
}) {
  const coach = await requireCoach();
  await db.insert(locations).values({
    id: randomUUID(),
    coachId: coach.id,
    name: input.name,
    address: input.address,
    city: input.city,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
  });
  revalidatePath("/coach-admin/campi");
}

export async function removeLocation(locationId: string) {
  const coach = await requireCoach();
  const location = await db.query.locations.findFirst({ where: eq(locations.id, locationId) });
  if (!location || location.coachId !== coach.id) throw new Error("Non autorizzato.");

  // Prima di eliminare il campo, annulliamo esplicitamente le prenotazioni
  // future ancora attive: il cascade della FK le cancellerebbe in silenzio e
  // i giocatori non saprebbero mai che la lezione è saltata.
  const today = toLocalDateString(new Date());
  db.transaction((tx) => {
    tx.update(bookings)
      .set({ status: "annullata" })
      .where(
        and(
          eq(bookings.locationId, locationId),
          inArray(bookings.status, ["richiesta", "confermata"]),
          gte(bookings.date, today)
        )
      )
      .run();
    tx.delete(locations).where(eq(locations.id, locationId)).run();
  });

  revalidatePath("/coach-admin/campi");
  revalidatePath("/prenotazioni");
}

export async function addAvailabilitySlot(input: {
  locationId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}) {
  const coach = await requireCoach();
  const location = await db.query.locations.findFirst({ where: eq(locations.id, input.locationId) });
  if (!location || location.coachId !== coach.id) throw new Error("Non autorizzato.");

  await db.insert(availabilitySlots).values({
    id: randomUUID(),
    coachId: coach.id,
    locationId: input.locationId,
    dayOfWeek: input.dayOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
  });
  revalidatePath("/coach-admin/orari");
}

export async function removeAvailabilitySlot(slotId: string) {
  const coach = await requireCoach();
  const slot = await db.query.availabilitySlots.findFirst({ where: eq(availabilitySlots.id, slotId) });
  if (!slot || slot.coachId !== coach.id) throw new Error("Non autorizzato.");
  await db.delete(availabilitySlots).where(eq(availabilitySlots.id, slotId));
  revalidatePath("/coach-admin/orari");
}

export async function updateCoachAvatar(formData: FormData) {
  const coach = await requireCoach();
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Seleziona un'immagine.");
  }
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    throw new Error("Formato non supportato: usa JPG, PNG o WebP.");
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("L'immagine supera i 4 MB.");
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Upload foto non ancora configurato su questo ambiente.");
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const blob = await put(`avatars/${coach.id}-${Date.now()}.${ext}`, file, { access: "public" });

  await db.update(coachProfiles).set({ avatarUrl: blob.url }).where(eq(coachProfiles.userId, coach.id));
  revalidatePath("/coach-admin/profilo");
  revalidatePath(`/coach/${coach.id}`);
  revalidatePath("/cerca");
}

export async function updateCoachProfile(input: {
  bio: string;
  levels: string[];
  trainingTypes: string[];
  pricePerLesson?: number | null;
}) {
  const coach = await requireCoach();

  // Whitelist contro i valori canonici: scarta qualsiasi voce sconosciuta.
  const levels = input.levels.filter((l) => (LEVELS as readonly string[]).includes(l));
  const trainingTypes = input.trainingTypes.filter((t) =>
    (TRAINING_TYPES as readonly string[]).includes(t)
  );

  const pricePerLesson = input.pricePerLesson ?? null;
  if (pricePerLesson !== null && (!Number.isInteger(pricePerLesson) || pricePerLesson <= 0)) {
    throw new Error("Il prezzo per lezione deve essere un numero intero positivo.");
  }

  await db
    .update(coachProfiles)
    .set({
      bio: input.bio,
      levels: JSON.stringify(levels),
      trainingTypes: JSON.stringify(trainingTypes),
      pricePerLesson,
    })
    .where(eq(coachProfiles.userId, coach.id));
  revalidatePath("/coach-admin/profilo");
}
