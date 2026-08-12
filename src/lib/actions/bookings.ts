"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  bookings,
  availabilitySlots,
  availabilityClosures,
  coachProfiles,
  notifications,
  users,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import {
  parseJsonArray,
  toLocalDateString,
  computeSlotOccupancy,
  closureKey,
  isSlotClosed,
  DEFAULT_GROUP_CAPACITY,
} from "@/lib/constants";
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

  // Data valida (YYYY-MM-DD) e non nel passato - le stringhe in questo formato
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

  const groupCapacity = profile.groupCapacity ?? DEFAULT_GROUP_CAPACITY;
  const coachTrainingTypes = parseJsonArray(profile.trainingTypes);

  try {
    const bookingId = randomUUID();
    const createdAt = new Date().toISOString();
    // La transazione ritorna il motivo del rifiuto (o null se ha inserito):
    // così il narrowing non dipende da una variabile assegnata in closure.
    const rejection = await db.transaction(async (tx): Promise<string | null> => {
      // La capienza di gruppo non è esprimibile come vincolo unico: due
      // richieste concorrenti leggerebbero entrambe "3 di 4" e inserirebbero,
      // arrivando a 5. L'advisory lock serializza tutti gli scrittori sullo
      // stesso slot per la durata della transazione; si rilascia da solo al
      // commit o al rollback.
      const lockKey = `paideio:slot:${input.coachId}|${input.locationId}|${input.date}|${input.startTime}`;
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`);

      // Il turno ricorrente esiste, ma il coach può aver chiuso questa data
      // precisa (o l'intera giornata). Controllo dentro il lock, come per la
      // capienza: la UI può essere stantia.
      const closures = await tx.query.availabilityClosures.findMany({
        where: and(
          eq(availabilityClosures.coachId, input.coachId),
          eq(availabilityClosures.date, input.date)
        ),
      });
      const closedKeys = new Set(closures.map((c) => closureKey(c.date, c.locationId, c.startTime)));
      if (isSlotClosed(closedKeys, input.date, input.locationId, input.startTime)) {
        return "Il coach ha chiuso questa data: scegli un altro orario.";
      }

      const active = await tx.query.bookings.findMany({
        where: and(
          eq(bookings.coachId, input.coachId),
          eq(bookings.date, input.date),
          eq(bookings.locationId, input.locationId),
          eq(bookings.startTime, input.startTime),
          inArray(bookings.status, ["richiesta", "confermata"])
        ),
      });

      if (active.some((b) => b.playerId === user.id)) {
        return "Hai già una prenotazione per questo orario.";
      }

      const occupancy = computeSlotOccupancy(
        active.map((b) => b.type),
        groupCapacity,
        coachTrainingTypes
      );
      if (!occupancy.availableTypes.includes(input.type)) {
        if (occupancy.bookedType === "singolo") {
          return "Questo orario è già occupato da una lezione singola.";
        }
        if (occupancy.full) {
          return "La lezione di gruppo di questo orario è al completo.";
        }
        if (occupancy.bookedType === "gruppo") {
          return "Su questo orario è già aperta una lezione di gruppo: puoi unirti a quella.";
        }
        return "Questo orario non è più disponibile.";
      }

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
      return null;
    });

    if (rejection) return err(rejection);
  } catch (error) {
    // Backstop agli indici parziali: una singola già attiva sullo slot o lo
    // stesso giocatore due volte sulla stessa lezione.
    if (isUniqueViolation(error)) {
      return err("Questo orario non è più disponibile.");
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
