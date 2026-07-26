"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, availabilitySlots, coachProfiles, notifications, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { parseJsonArray, toLocalDateString } from "@/lib/constants";
import { type ActionResult, ok, err } from "@/lib/action-result";

const MAX_NOTES_LENGTH = 500;
const MAX_OPEN_REQUESTS = 10;
const POSTGRES_UNIQUE_VIOLATION = "23505";

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === POSTGRES_UNIQUE_VIOLATION;
}

export async function createBooking(input: {
  coachId: string;
  locationId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "singolo" | "gruppo";
  level: string;
  notes?: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "player") {
    return err("Devi accedere come giocatore per prenotare.");
  }

  // Data valida (YYYY-MM-DD) e non nel passato — le stringhe in questo formato
  // sono ordinabili lessicograficamente.
  const today = toLocalDateString(new Date());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || input.date < today) {
    return err("Data non valida: scegli una data a partire da oggi.");
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
    return err("Questo orario non corrisponde a nessuna disponibilità del coach.");
  }

  // Tipo di allenamento e livello devono essere tra quelli offerti dal coach.
  const profile = await db.query.coachProfiles.findFirst({
    where: eq(coachProfiles.userId, input.coachId),
  });
  if (!profile) {
    return err("Coach non trovato.");
  }
  if (!parseJsonArray(profile.trainingTypes).includes(input.type)) {
    return err("Questo coach non offre questo tipo di allenamento.");
  }
  if (!parseJsonArray(profile.levels).includes(input.level)) {
    return err("Questo coach non offre lezioni per questo livello.");
  }

  // Note: trim + taglio a 500 caratteri (non rifiutiamo, tronchiamo).
  const notes = (input.notes ?? "").trim().slice(0, MAX_NOTES_LENGTH);

  // Massimo 10 richieste aperte per giocatore.
  const openRequests = await db.query.bookings.findMany({
    where: and(eq(bookings.playerId, user.id), eq(bookings.status, "richiesta")),
  });
  if (openRequests.length >= MAX_OPEN_REQUESTS) {
    return err("Hai troppe richieste in attesa, aspetta una risposta prima di prenotarne altre.");
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
    return err("Questo slot non è più disponibile.");
  }

  try {
    const bookingId = randomUUID();
    const createdAt = new Date().toISOString();
    await db.transaction(async (tx) => {
      await tx.insert(bookings).values({
        id: bookingId,
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
        createdAt,
      });
      await tx.insert(notifications).values([
        {
          id: randomUUID(),
          userId: user.id,
          bookingId,
          type: "booking_created",
          title: "Richiesta inviata",
          message: `La tua lezione del ${input.date} alle ${input.startTime} è stata inviata al coach.`,
          href: "/prenotazioni",
          createdAt,
        },
        {
          id: randomUUID(),
          userId: input.coachId,
          bookingId,
          type: "booking_created",
          title: "Nuova richiesta di lezione",
          message: `${user.name} vuole allenarsi il ${input.date} alle ${input.startTime}.`,
          href: "/coach-admin/richieste",
          createdAt,
        },
      ]);
    });
  } catch (error) {
    // L'indice unico parziale (bookings_active_slot_idx) intercetta le
    // prenotazioni concorrenti sullo stesso slot sfuggite al check sopra.
    if (isUniqueViolation(error)) {
      return err("Questo slot non è più disponibile.");
    }
    throw error;
  }

  revalidatePath("/prenotazioni");
  revalidatePath(`/coach/${input.coachId}`);
  revalidatePath("/coach-admin/richieste");
  revalidatePath("/notifiche");
  revalidatePath("/", "layout");
  return ok(undefined);
}

const BOOKING_STATUSES = ["confermata", "rifiutata", "annullata"] as const;

export async function updateBookingStatus(
  bookingId: string,
  status: "confermata" | "rifiutata" | "annullata"
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return err("Non autenticato.");

  // Difesa contro chiamate raw che bypassano il tipo TS.
  if (!BOOKING_STATUSES.includes(status)) {
    return err("Stato non valido.");
  }

  const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
  if (!booking) return err("Prenotazione non trovata.");

  const isOwnerCoach = user.role === "coach" && booking.coachId === user.id;
  const isOwnerPlayer = user.role === "player" && booking.playerId === user.id;
  if (!isOwnerCoach && !isOwnerPlayer) {
    return err("Non autorizzato a modificare questa prenotazione.");
  }

  // Transizioni consentite:
  // - coach:    richiesta → confermata | rifiutata
  // - giocatore: richiesta → annullata, confermata → annullata
  const allowed = isOwnerCoach
    ? booking.status === "richiesta" && (status === "confermata" || status === "rifiutata")
    : (booking.status === "richiesta" || booking.status === "confermata") && status === "annullata";
  if (!allowed) {
    return err("Questo cambio di stato non è consentito.");
  }

  if (status === "confermata" && booking.date < toLocalDateString(new Date())) {
    return err("Non puoi confermare una prenotazione con data già passata.");
  }

  if (status === "annullata") {
    const [player, coach] = await Promise.all([
      db.query.users.findFirst({ where: eq(users.id, booking.playerId) }),
      db.query.users.findFirst({ where: eq(users.id, booking.coachId) }),
    ]);
    const createdAt = new Date().toISOString();
    const actorName = isOwnerPlayer ? player?.name ?? "Il giocatore" : coach?.name ?? "Il coach";

    await db.transaction(async (tx) => {
      await tx.update(bookings).set({ status }).where(eq(bookings.id, bookingId));
      await tx.insert(notifications).values([
        {
          id: randomUUID(),
          userId: booking.playerId,
          bookingId,
          type: "booking_cancelled",
          title: "Lezione annullata",
          message: `La lezione del ${booking.date} alle ${booking.startTime} è stata annullata da ${actorName}.`,
          href: "/prenotazioni",
          createdAt,
        },
        {
          id: randomUUID(),
          userId: booking.coachId,
          bookingId,
          type: "booking_cancelled",
          title: "Lezione annullata",
          message: `La lezione con ${player?.name ?? "il giocatore"} del ${booking.date} alle ${booking.startTime} è stata annullata.`,
          href: "/coach-admin/richieste",
          createdAt,
        },
      ]);
    });
  } else {
    await db.update(bookings).set({ status }).where(eq(bookings.id, bookingId));
  }

  revalidatePath("/prenotazioni");
  revalidatePath("/coach-admin/richieste");
  revalidatePath("/notifiche");
  revalidatePath("/", "layout");
  return ok(undefined);
}
