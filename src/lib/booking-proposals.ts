import "server-only";

import { randomUUID } from "node:crypto";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import {
  bookings,
  availabilitySlots,
  availabilityClosures,
  coachProfiles,
  notifications,
  users,
} from "@/lib/db/schema";
import {
  parseJsonArray,
  toLocalDateString,
  closureKey,
  isSlotClosed,
  computeLessonAvailability,
  proposableStarts,
  minutesFromTime,
  sameInterval,
  LESSON_DURATIONS,
  DEFAULT_GROUP_CAPACITY,
  MAX_COACH_MESSAGE_LENGTH,
  MIN_COACH_MESSAGE_LENGTH,
} from "@/lib/constants";
import type { BookedLesson, TrainingType } from "@/lib/constants";
import { type ActionResult, ok, err } from "@/lib/action-result";

/**
 * Proposte di orario: cuore transazionale. Modulo **server-only**, non un
 * insieme di Server Action, esattamente come `lib/queries.ts`: `import
 * "server-only"` impedisce che finisca in un bundle client.
 *
 * Le Server Action stanno in `lib/actions/booking-proposals.ts` e si limitano a
 * autenticare, chiamare queste funzioni e rivalidare le pagine. La separazione
 * serve a due cose: `"use server"` obbliga ogni export a essere un'azione
 * remota, e il test end-to-end (`npm run test:proposte`) deve poter esercitare
 * la logica vera - advisory lock compreso - senza una sessione Clerk né un
 * contesto di richiesta Next (`revalidatePath` fuori da una richiesta lancia).
 *
 * Modello: la proposta vive **sulla riga della prenotazione**
 * (`coach_message`, `proposed_date`, `proposed_start_time`,
 * `proposed_end_time`) più lo stato `controproposta`. Non è una seconda
 * prenotazione, è la stessa lezione in attesa di un orario. Vedi AGENTS.md,
 * sezione "Proposte di orario".
 */

const POSTGRES_UNIQUE_VIOLATION = "23505";
const POSTGRES_EXCLUSION_VIOLATION = "23P01";

type Tx = Parameters<Parameters<NodePgDatabase<typeof schema>["transaction"]>[0]>[0];

function isSlotTakenError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) return false;
  return (
    error.code === POSTGRES_UNIQUE_VIOLATION || error.code === POSTGRES_EXCLUSION_VIOLATION
  );
}

/**
 * Serializza gli scrittori sulla coppia giorno+campo, come `createBooking`.
 * Stessa chiave apposta: proposta accettata e nuova prenotazione competono
 * per lo stesso campo, quindi devono aspettarsi a vicenda.
 */
async function lockDay(tx: Tx, coachId: string, locationId: string, date: string) {
  const lockKey = `paideio:day:${coachId}|${locationId}|${date}`;
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`);
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function normalizeCoachMessage(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, MAX_COACH_MESSAGE_LENGTH);
}

function messageProblem(message: string): string | null {
  if (message.length < MIN_COACH_MESSAGE_LENGTH) {
    return `Spiega al giocatore perché: servono almeno ${MIN_COACH_MESSAGE_LENGTH} caratteri.`;
  }
  return null;
}

/**
 * Perché quella lezione non può stare in quell'intervallo, o `null` se ci sta.
 *
 * È la stessa catena di controlli di `createBooking` (finestra pubblicata →
 * chiusure → inizi ammessi → capienza), riusata sia quando il coach propone
 * sia quando il giocatore accetta. Nel secondo caso gira **dentro l'advisory
 * lock**: tra proposta e accettazione possono passare giorni, e nel frattempo
 * l'orario può essere stato preso, chiuso o tolto dalle disponibilità.
 */
async function lessonFitProblem(
  tx: Tx,
  input: {
    coachId: string;
    locationId: string;
    date: string;
    startTime: string;
    endTime: string;
    type: TrainingType;
    playerId: string;
    /** La lezione che si sta spostando: la sua fascia attuale non è occupata. */
    excludeBookingId: string;
  }
): Promise<string | null> {
  if (!DATE_PATTERN.test(input.date)) return "Data non valida.";
  if (input.date < toLocalDateString(new Date())) {
    return "Quella data è già passata: scegline una futura.";
  }

  const candidate = {
    start: minutesFromTime(input.startTime),
    end: minutesFromTime(input.endTime),
  };
  const duration = candidate.end - candidate.start;
  if (!(LESSON_DURATIONS as readonly number[]).includes(duration)) {
    return "Durata non valida: le lezioni sono da 60 o 90 minuti.";
  }

  const dayOfWeek = new Date(`${input.date}T00:00:00`).getDay();
  const windows = await tx.query.availabilitySlots.findMany({
    where: and(
      eq(availabilitySlots.coachId, input.coachId),
      eq(availabilitySlots.locationId, input.locationId),
      eq(availabilitySlots.dayOfWeek, dayOfWeek)
    ),
  });
  const window = windows.find(
    (w) =>
      minutesFromTime(w.startTime) <= candidate.start &&
      minutesFromTime(w.endTime) >= candidate.end
  );
  if (!window) {
    return "Quell'orario è fuori dalle tue disponibilità pubblicate per quel giorno.";
  }
  const windowInterval = {
    start: minutesFromTime(window.startTime),
    end: minutesFromTime(window.endTime),
  };

  const closures = await tx.query.availabilityClosures.findMany({
    where: and(
      eq(availabilityClosures.coachId, input.coachId),
      eq(availabilityClosures.date, input.date)
    ),
  });
  const closedKeys = new Set(closures.map((c) => closureKey(c.date, c.locationId, c.startTime)));
  if (isSlotClosed(closedKeys, input.date, input.locationId, window.startTime)) {
    return "Quella data è chiusa nel calendario: riaprila o scegli un altro giorno.";
  }

  const profile = await tx.query.coachProfiles.findFirst({
    where: eq(coachProfiles.userId, input.coachId),
  });
  if (!profile) return "Coach non trovato.";
  const coachTrainingTypes = parseJsonArray(profile.trainingTypes);
  const groupCapacity = profile.groupCapacity ?? DEFAULT_GROUP_CAPACITY;

  const active = await tx.query.bookings.findMany({
    where: and(
      eq(bookings.coachId, input.coachId),
      eq(bookings.date, input.date),
      eq(bookings.locationId, input.locationId),
      inArray(bookings.status, ["richiesta", "confermata"]),
      ne(bookings.id, input.excludeBookingId)
    ),
  });
  const busy: BookedLesson[] = active.map((b) => ({
    start: minutesFromTime(b.startTime),
    end: minutesFromTime(b.endTime),
    type: b.type,
    playerId: b.playerId,
  }));

  if (busy.some((b) => sameInterval(b, candidate) && b.playerId === input.playerId)) {
    return "Il giocatore ha già una lezione in quell'orario.";
  }

  if (
    !proposableStarts(
      windowInterval,
      busy,
      duration,
      input.type,
      groupCapacity,
      coachTrainingTypes
    ).includes(candidate.start)
  ) {
    // Messaggio preciso invece di un generico "non disponibile": la stessa
    // scala di motivi che usa `createBooking`.
    const availability = computeLessonAvailability(
      candidate,
      busy,
      groupCapacity,
      coachTrainingTypes
    );
    if (availability.blocked) {
      return "Quell'orario si sovrappone a un'altra lezione già prenotata.";
    }
    if (availability.bookedType === "singolo") {
      return "Quell'orario è già occupato da una lezione singola.";
    }
    if (availability.bookedType === "gruppo" && availability.full) {
      return "La lezione di gruppo di quell'orario è al completo.";
    }
    if (!coachTrainingTypes.includes(input.type)) {
      return "Non offri più questo tipo di allenamento.";
    }
    return "Quell'orario non è un inizio valido dentro la finestra: lascerebbe un buco troppo corto per un'altra lezione.";
  }

  return null;
}

/** Il coach rifiuta la richiesta spiegando perché. */
export async function rejectBookingWithReason(input: {
  bookingId: string;
  coachId: string;
  reason: string;
}): Promise<ActionResult> {
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, input.bookingId),
  });
  if (!booking) return err("Prenotazione non trovata.");
  if (booking.coachId !== input.coachId) return err("Non autorizzato.");
  if (booking.status !== "richiesta" && booking.status !== "controproposta") {
    return err("Questa richiesta non è più in attesa di una risposta.");
  }

  const reason = normalizeCoachMessage(input.reason);
  const problem = messageProblem(reason);
  if (problem) return err(problem);

  const [player, coach] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, booking.playerId) }),
    db.query.users.findFirst({ where: eq(users.id, booking.coachId) }),
  ]);
  const createdAt = new Date().toISOString();

  await db.transaction(async (tx) => {
    await tx
      .update(bookings)
      .set({
        status: "rifiutata",
        coachMessage: reason,
        proposedDate: null,
        proposedStartTime: null,
        proposedEndTime: null,
      })
      .where(eq(bookings.id, booking.id));
    await tx.insert(notifications).values([
      {
        id: randomUUID(),
        userId: booking.playerId,
        bookingId: booking.id,
        type: "booking_rejected" as const,
        title: "Richiesta rifiutata",
        message: `${coach?.name ?? "Il coach"} non può tenere la lezione del ${booking.date} alle ${booking.startTime}: ${reason}`,
        href: "/prenotazioni",
        createdAt,
      },
      {
        id: randomUUID(),
        userId: booking.coachId,
        bookingId: booking.id,
        type: "booking_rejected" as const,
        title: "Richiesta rifiutata",
        message: `Hai rifiutato la richiesta di ${player?.name ?? "il giocatore"} del ${booking.date} alle ${booking.startTime}.`,
        href: "/coach-admin/richieste",
        createdAt,
      },
    ]);
  });

  return ok(undefined);
}

/**
 * Il coach propone un orario diverso, con motivazione.
 *
 * La prenotazione passa a `controproposta`: stato **non attivo**, quindi la
 * fascia originale torna subito libera per gli altri e quella proposta **non**
 * viene riservata. È deliberato: finché il giocatore non accetta non esiste
 * nessuna lezione da difendere, e bloccare un orario per una proposta che
 * potrebbe restare senza risposta toglierebbe disponibilità reale al coach.
 * Il prezzo è che l'orario può sparire prima dell'accettazione, ed è
 * esattamente ciò che `acceptBookingProposal` rivalida sotto lock.
 */
export async function proposeBookingTime(input: {
  bookingId: string;
  coachId: string;
  date: string;
  startTime: string;
  endTime: string;
  message: string;
}): Promise<ActionResult> {
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, input.bookingId),
  });
  if (!booking) return err("Prenotazione non trovata.");
  if (booking.coachId !== input.coachId) return err("Non autorizzato.");
  if (booking.status !== "richiesta") {
    return err("Puoi proporre un altro orario solo su una richiesta ancora in attesa.");
  }
  if (!booking.locationId) {
    return err("Il campo di questa lezione non esiste più: non puoi spostarla.");
  }
  if (
    booking.date === input.date &&
    booking.startTime === input.startTime &&
    booking.endTime === input.endTime
  ) {
    return err("Questo è già l'orario richiesto: conferma la lezione invece di proporlo.");
  }

  const message = normalizeCoachMessage(input.message);
  const problem = messageProblem(message);
  if (problem) return err(problem);

  const [player, coach] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, booking.playerId) }),
    db.query.users.findFirst({ where: eq(users.id, booking.coachId) }),
  ]);
  const createdAt = new Date().toISOString();
  const locationId = booking.locationId;

  const rejection = await db.transaction(async (tx): Promise<string | null> => {
    await lockDay(tx, booking.coachId, locationId, input.date);

    const fit = await lessonFitProblem(tx, {
      coachId: booking.coachId,
      locationId,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      type: booking.type,
      playerId: booking.playerId,
      excludeBookingId: booking.id,
    });
    if (fit) return fit;

    await tx
      .update(bookings)
      .set({
        status: "controproposta",
        coachMessage: message,
        proposedDate: input.date,
        proposedStartTime: input.startTime,
        proposedEndTime: input.endTime,
      })
      .where(eq(bookings.id, booking.id));

    await tx.insert(notifications).values([
      {
        id: randomUUID(),
        userId: booking.playerId,
        bookingId: booking.id,
        type: "booking_proposed" as const,
        title: "Il coach propone un altro orario",
        message: `${coach?.name ?? "Il coach"} propone ${input.date} alle ${input.startTime} al posto del ${booking.date} alle ${booking.startTime}: ${message}`,
        href: "/prenotazioni",
        createdAt,
      },
      {
        id: randomUUID(),
        userId: booking.coachId,
        bookingId: booking.id,
        type: "booking_proposed" as const,
        title: "Proposta inviata",
        message: `Hai proposto a ${player?.name ?? "il giocatore"} il ${input.date} alle ${input.startTime}. La lezione resta in attesa della sua risposta.`,
        href: "/coach-admin/richieste",
        createdAt,
      },
    ]);
    return null;
  });

  if (rejection) return err(rejection);
  return ok(undefined);
}

/**
 * Il giocatore accetta: la lezione si sposta sull'orario proposto e da quel
 * momento occupa il calendario come qualsiasi altra prenotazione confermata.
 *
 * Non serve una seconda conferma del coach: l'orario l'ha scelto lui.
 */
export async function acceptBookingProposal(input: {
  bookingId: string;
  playerId: string;
}): Promise<
  ActionResult<{ coachId: string; date: string; startTime: string; endTime: string }>
> {
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, input.bookingId),
  });
  if (!booking) return err("Prenotazione non trovata.");
  if (booking.playerId !== input.playerId) return err("Non autorizzato.");
  if (
    booking.status !== "controproposta" ||
    !booking.proposedDate ||
    !booking.proposedStartTime ||
    !booking.proposedEndTime
  ) {
    return err("Non c'è nessuna proposta da accettare su questa lezione.");
  }
  if (!booking.locationId) {
    return err("Il campo di questa lezione non esiste più.");
  }

  const proposed = {
    date: booking.proposedDate,
    startTime: booking.proposedStartTime,
    endTime: booking.proposedEndTime,
  };
  const [player, coach] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, booking.playerId) }),
    db.query.users.findFirst({ where: eq(users.id, booking.coachId) }),
  ]);
  const createdAt = new Date().toISOString();
  const locationId = booking.locationId;

  try {
    const rejection = await db.transaction(async (tx): Promise<string | null> => {
      // Tra la proposta e questo click possono essere passati giorni: qualcun
      // altro può aver preso l'orario, il coach può averlo chiuso o tolto dalle
      // disponibilità. Si rivalida tutto dentro il lock, così il giocatore
      // legge un messaggio comprensibile invece di un errore del database.
      await lockDay(tx, booking.coachId, locationId, proposed.date);

      const fresh = await tx.query.bookings.findFirst({ where: eq(bookings.id, booking.id) });
      if (!fresh || fresh.status !== "controproposta") {
        return "Questa proposta non è più valida.";
      }

      const fit = await lessonFitProblem(tx, {
        coachId: booking.coachId,
        locationId,
        date: proposed.date,
        startTime: proposed.startTime,
        endTime: proposed.endTime,
        type: booking.type,
        playerId: booking.playerId,
        excludeBookingId: booking.id,
      });
      if (fit) {
        return `L'orario proposto non è più disponibile. ${fit}`;
      }

      await tx
        .update(bookings)
        .set({
          date: proposed.date,
          startTime: proposed.startTime,
          endTime: proposed.endTime,
          status: "confermata",
          proposedDate: null,
          proposedStartTime: null,
          proposedEndTime: null,
        })
        .where(eq(bookings.id, booking.id));

      await tx.insert(notifications).values([
        {
          id: randomUUID(),
          userId: booking.playerId,
          bookingId: booking.id,
          type: "booking_proposal_accepted" as const,
          title: "Lezione confermata al nuovo orario",
          message: `Hai accettato ${proposed.date} alle ${proposed.startTime} con ${coach?.name ?? "il coach"}. La lezione è confermata.`,
          href: "/prenotazioni",
          createdAt,
        },
        {
          id: randomUUID(),
          userId: booking.coachId,
          bookingId: booking.id,
          type: "booking_proposal_accepted" as const,
          title: "Proposta accettata",
          message: `${player?.name ?? "Il giocatore"} ha accettato il ${proposed.date} alle ${proposed.startTime}: la lezione è confermata.`,
          href: "/coach-admin/richieste",
          createdAt,
        },
      ]);
      return null;
    });

    if (rejection) return err(rejection);
  } catch (error) {
    // Backstop al vincolo di esclusione GiST e agli indici parziali: se due
    // accettazioni arrivano insieme, la seconda deve leggere una frase, non
    // uno SQLSTATE.
    if (isSlotTakenError(error)) {
      return err("L'orario proposto è appena stato occupato: chiedi al coach un'altra fascia.");
    }
    throw error;
  }

  return ok({ coachId: booking.coachId, ...proposed });
}

/** Il giocatore rifiuta la proposta: la richiesta si chiude come rifiutata. */
export async function declineBookingProposal(input: {
  bookingId: string;
  playerId: string;
}): Promise<ActionResult> {
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, input.bookingId),
  });
  if (!booking) return err("Prenotazione non trovata.");
  if (booking.playerId !== input.playerId) return err("Non autorizzato.");
  if (booking.status !== "controproposta") {
    return err("Non c'è nessuna proposta da rifiutare su questa lezione.");
  }

  const player = await db.query.users.findFirst({ where: eq(users.id, booking.playerId) });
  const createdAt = new Date().toISOString();
  const proposedDate = booking.proposedDate ?? booking.date;
  const proposedStart = booking.proposedStartTime ?? booking.startTime;

  await db.transaction(async (tx) => {
    await tx
      .update(bookings)
      .set({
        // La richiesta iniziale il coach l'aveva già scartata: l'esito è un
        // rifiuto, non un annullamento del giocatore. La motivazione del coach
        // resta sulla riga, così il giocatore continua a leggere il perché.
        status: "rifiutata",
        proposedDate: null,
        proposedStartTime: null,
        proposedEndTime: null,
      })
      .where(eq(bookings.id, booking.id));
    await tx.insert(notifications).values([
      {
        id: randomUUID(),
        userId: booking.playerId,
        bookingId: booking.id,
        type: "booking_proposal_declined" as const,
        title: "Proposta rifiutata",
        message: `Hai rifiutato il ${proposedDate} alle ${proposedStart}. Puoi cercare un altro orario quando vuoi.`,
        href: "/prenotazioni",
        createdAt,
      },
      {
        id: randomUUID(),
        userId: booking.coachId,
        bookingId: booking.id,
        type: "booking_proposal_declined" as const,
        title: "Proposta rifiutata",
        message: `${player?.name ?? "Il giocatore"} ha rifiutato il ${proposedDate} alle ${proposedStart}.`,
        href: "/coach-admin/richieste",
        createdAt,
      },
    ]);
  });

  return ok(undefined);
}
