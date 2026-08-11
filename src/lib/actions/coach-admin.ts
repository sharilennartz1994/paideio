"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq, gte, inArray } from "drizzle-orm";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { locations, availabilitySlots, coachProfiles, bookings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import {
  LEVELS,
  TRAINING_TYPES,
  toLocalDateString,
  DEFAULT_GROUP_CAPACITY,
  MIN_GROUP_CAPACITY,
  MAX_GROUP_CAPACITY,
} from "@/lib/constants";
import { type ActionResult, ok, err } from "@/lib/action-result";

const MAX_AVATAR_BYTES = 4 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function requireCoach(): Promise<ActionResult<NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>>> {
  const user = await getCurrentUser();
  if (!user || user.role !== "coach") return err("Devi accedere come coach.");
  return ok(user);
}

// Campi e turni non toccano solo la scheda da cui sono stati modificati: la
// checklist di /coach-admin, la pagina orari, il profilo pubblico e la ricerca
// mostrano tutti gli stessi dati. Rivalidarne solo una lasciava il coach
// convinto di non aver salvato nulla e i giocatori senza disponibilità nuove.
function revalidateCoachSurfaces(coachId: string) {
  revalidatePath("/coach-admin");
  revalidatePath("/coach-admin/campi");
  revalidatePath("/coach-admin/orari");
  revalidatePath(`/coach/${coachId}`);
  revalidatePath("/cerca");
}

export async function addLocation(input: {
  name: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
}): Promise<ActionResult> {
  const coachResult = await requireCoach();
  if (!coachResult.ok) return coachResult;

  await db.insert(locations).values({
    id: randomUUID(),
    coachId: coachResult.data.id,
    name: input.name,
    address: input.address,
    city: input.city,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
  });
  revalidateCoachSurfaces(coachResult.data.id);
  return ok(undefined);
}

export async function removeLocation(locationId: string): Promise<ActionResult> {
  const coachResult = await requireCoach();
  if (!coachResult.ok) return coachResult;
  const coach = coachResult.data;

  const location = await db.query.locations.findFirst({ where: eq(locations.id, locationId) });
  if (!location || location.coachId !== coach.id) return err("Non autorizzato.");

  // Prima di eliminare il campo, annulliamo esplicitamente le prenotazioni
  // future ancora attive: il cascade della FK le cancellerebbe in silenzio e
  // i giocatori non saprebbero mai che la lezione è saltata.
  const today = toLocalDateString(new Date());
  await db.transaction(async (tx) => {
    await tx
      .update(bookings)
      .set({ status: "annullata" })
      .where(
        and(
          eq(bookings.locationId, locationId),
          inArray(bookings.status, ["richiesta", "confermata"]),
          gte(bookings.date, today)
        )
      );
    await tx.delete(locations).where(eq(locations.id, locationId));
  });

  revalidateCoachSurfaces(coach.id);
  revalidatePath("/prenotazioni");
  return ok(undefined);
}

export async function addAvailabilitySlot(input: {
  locationId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}): Promise<ActionResult> {
  const coachResult = await requireCoach();
  if (!coachResult.ok) return coachResult;
  const coach = coachResult.data;

  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (
    !Number.isInteger(input.dayOfWeek) ||
    input.dayOfWeek < 0 ||
    input.dayOfWeek > 6 ||
    !timePattern.test(input.startTime) ||
    !timePattern.test(input.endTime)
  ) {
    return err("Giorno o orario non valido.");
  }
  if (input.startTime >= input.endTime) {
    return err("L'orario di fine deve essere dopo l'orario di inizio.");
  }

  const location = await db.query.locations.findFirst({ where: eq(locations.id, input.locationId) });
  if (!location || location.coachId !== coach.id) return err("Non autorizzato.");

  const duplicate = await db.query.availabilitySlots.findFirst({
    where: and(
      eq(availabilitySlots.coachId, coach.id),
      eq(availabilitySlots.locationId, input.locationId),
      eq(availabilitySlots.dayOfWeek, input.dayOfWeek),
      eq(availabilitySlots.startTime, input.startTime),
      eq(availabilitySlots.endTime, input.endTime)
    ),
  });
  if (duplicate) {
    return err("Questo turno è già presente nel calendario.");
  }

  await db.insert(availabilitySlots).values({
    id: randomUUID(),
    coachId: coach.id,
    locationId: input.locationId,
    dayOfWeek: input.dayOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
  });
  revalidateCoachSurfaces(coach.id);
  return ok(undefined);
}

export async function removeAvailabilitySlot(slotId: string): Promise<ActionResult> {
  const coachResult = await requireCoach();
  if (!coachResult.ok) return coachResult;
  const coach = coachResult.data;

  const slot = await db.query.availabilitySlots.findFirst({ where: eq(availabilitySlots.id, slotId) });
  if (!slot || slot.coachId !== coach.id) return err("Non autorizzato.");
  await db.delete(availabilitySlots).where(eq(availabilitySlots.id, slotId));
  revalidateCoachSurfaces(coach.id);
  return ok(undefined);
}

export async function updateCoachAvatar(formData: FormData): Promise<ActionResult> {
  const coachResult = await requireCoach();
  if (!coachResult.ok) return coachResult;
  const coach = coachResult.data;

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return err("Seleziona un'immagine.");
  }
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return err("Formato non supportato: usa JPG, PNG o WebP.");
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return err("L'immagine supera i 4 MB.");
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return err("Upload foto non ancora configurato su questo ambiente.");
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const blob = await put(`avatars/${coach.id}-${Date.now()}.${ext}`, file, { access: "public" });

  await db.update(coachProfiles).set({ avatarUrl: blob.url }).where(eq(coachProfiles.userId, coach.id));
  revalidatePath("/coach-admin/profilo");
  revalidatePath(`/coach/${coach.id}`);
  revalidatePath("/cerca");
  return ok(undefined);
}

export async function updateCoachProfile(input: {
  bio: string;
  levels: string[];
  trainingTypes: string[];
  pricePerLesson?: number | null;
  groupCapacity?: number;
}): Promise<ActionResult> {
  const coachResult = await requireCoach();
  if (!coachResult.ok) return coachResult;
  const coach = coachResult.data;

  // Whitelist contro i valori canonici: scarta qualsiasi voce sconosciuta.
  const levels = input.levels.filter((l) => (LEVELS as readonly string[]).includes(l));
  const trainingTypes = input.trainingTypes.filter((t) =>
    (TRAINING_TYPES as readonly string[]).includes(t)
  );

  const pricePerLesson = input.pricePerLesson ?? null;
  if (pricePerLesson !== null && (!Number.isInteger(pricePerLesson) || pricePerLesson <= 0)) {
    return err("Il prezzo per lezione deve essere un numero intero positivo.");
  }

  const groupCapacity = input.groupCapacity ?? DEFAULT_GROUP_CAPACITY;
  if (
    !Number.isInteger(groupCapacity) ||
    groupCapacity < MIN_GROUP_CAPACITY ||
    groupCapacity > MAX_GROUP_CAPACITY
  ) {
    return err(
      `I posti per lezione di gruppo devono essere un numero tra ${MIN_GROUP_CAPACITY} e ${MAX_GROUP_CAPACITY}.`
    );
  }

  await db
    .update(coachProfiles)
    .set({
      bio: input.bio,
      levels: JSON.stringify(levels),
      trainingTypes: JSON.stringify(trainingTypes),
      pricePerLesson,
      groupCapacity,
    })
    .where(eq(coachProfiles.userId, coach.id));
  revalidatePath("/coach-admin/profilo");
  // Livelli, tipi di lezione e tariffa sono gli stessi dati che filtrano la
  // ricerca e riempiono il profilo pubblico.
  revalidateCoachSurfaces(coach.id);
  return ok(undefined);
}
