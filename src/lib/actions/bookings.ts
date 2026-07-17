"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, availabilitySlots, coachProfiles } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { parseJsonArray, toLocalDateString } from "@/lib/constants";

const MAX_NOTES_LENGTH = 500;
const MAX_OPEN_REQUESTS = 10;

export async function createBooking(input: {
  coachId: string;
  locationId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "singolo" | "gruppo";
  level: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "player") {
    throw new Error("Devi accedere come giocatore per prenotare.");
  }

  // Data valida (YYYY-MM-DD) e non nel passato — le stringhe in questo formato
  // sono ordinabili lessicograficamente.
  const today = toLocalDateString(new Date());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || input.date < today) {
    throw new Error("Data non valida: scegli una data a partire da oggi.");
  }

  // Lo slot richiesto deve corrispondere a una disponibilità reale del coach
  // (campo, giorno della settimana e orari devono combaciare).
  const dayOfWeek = new Date(`${input.date}T00:00:00`).getDay();
  const slot = await db.query.availabilitySlots.findFirst({
    where: and(
      eq(availabilitySlots.coachId, input.coachId),
      eq(availabilitySlots.locationId, input.locationId),
      eq(availabilitySlots.dayOfWeek, dayOfWeek),
      eq(availabilitySlots.startTime, input.startTime),
      eq(availabilitySlots.endTime, input.endTime)
    ),
  });
  if (!slot) {
    throw new Error("Questo orario non corrisponde a nessuna disponibilità del coach.");
  }

  // Tipo di allenamento e livello devono essere tra quelli offerti dal coach.
  const profile = await db.query.coachProfiles.findFirst({
    where: eq(coachProfiles.userId, input.coachId),
  });
  if (!profile) {
    throw new Error("Coach non trovato.");
  }
  if (!parseJsonArray(profile.trainingTypes).includes(input.type)) {
    throw new Error("Questo coach non offre questo tipo di allenamento.");
  }
  if (!parseJsonArray(profile.levels).includes(input.level)) {
    throw new Error("Questo coach non offre lezioni per questo livello.");
  }

  // Note: trim + taglio a 500 caratteri (non rifiutiamo, tronchiamo).
  const notes = (input.notes ?? "").trim().slice(0, MAX_NOTES_LENGTH);

  // Massimo 10 richieste aperte per giocatore.
  const openRequests = await db.query.bookings.findMany({
    where: and(eq(bookings.playerId, user.id), eq(bookings.status, "richiesta")),
  });
  if (openRequests.length >= MAX_OPEN_REQUESTS) {
    throw new Error("Hai troppe richieste in attesa, aspetta una risposta prima di prenotarne altre.");
  }

  const conflict = await db.query.bookings.findFirst({
    where: and(
      eq(bookings.coachId, input.coachId),
      eq(bookings.date, input.date),
      eq(bookings.locationId, input.locationId),
      eq(bookings.startTime, input.startTime),
      inArray(bookings.status, ["richiesta", "confermata"])
    ),
  });
  if (conflict) {
    throw new Error("Questo slot non è più disponibile.");
  }

  try {
    await db.insert(bookings).values({
      id: randomUUID(),
      playerId: user.id,
      coachId: input.coachId,
      locationId: input.locationId,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      type: input.type,
      level: input.level,
      notes,
      status: "richiesta",
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    // L'indice unico parziale (bookings_active_slot_idx) intercetta le
    // prenotazioni concorrenti sullo stesso slot sfuggite al check sopra.
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      throw new Error("Questo slot non è più disponibile.");
    }
    throw error;
  }

  revalidatePath("/prenotazioni");
  revalidatePath(`/coach/${input.coachId}`);
  revalidatePath("/coach-admin/richieste");
}

const BOOKING_STATUSES = ["confermata", "rifiutata", "annullata"] as const;

export async function updateBookingStatus(bookingId: string, status: "confermata" | "rifiutata" | "annullata") {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non autenticato.");

  // Difesa contro chiamate raw che bypassano il tipo TS.
  if (!BOOKING_STATUSES.includes(status)) {
    throw new Error("Stato non valido.");
  }

  const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
  if (!booking) throw new Error("Prenotazione non trovata.");

  const isOwnerCoach = user.role === "coach" && booking.coachId === user.id;
  const isOwnerPlayer = user.role === "player" && booking.playerId === user.id;
  if (!isOwnerCoach && !isOwnerPlayer) {
    throw new Error("Non autorizzato a modificare questa prenotazione.");
  }

  // Transizioni consentite:
  // - coach:    richiesta → confermata | rifiutata
  // - giocatore: richiesta → annullata, confermata → annullata
  const allowed = isOwnerCoach
    ? booking.status === "richiesta" && (status === "confermata" || status === "rifiutata")
    : (booking.status === "richiesta" || booking.status === "confermata") && status === "annullata";
  if (!allowed) {
    throw new Error("Questo cambio di stato non è consentito.");
  }

  if (status === "confermata" && booking.date < toLocalDateString(new Date())) {
    throw new Error("Non puoi confermare una prenotazione con data già passata.");
  }

  await db.update(bookings).set({ status }).where(eq(bookings.id, bookingId));

  revalidatePath("/prenotazioni");
  revalidatePath("/coach-admin/richieste");
}
