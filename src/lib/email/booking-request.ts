import "server-only";

import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { locations, users } from "@/lib/db/schema";
import {
  absoluteUrl,
  isEmailConfigured,
  sendEmail,
  type EmailDeliveryOutcome,
  type EmailMessage,
  type EmailTransport,
} from "@/lib/email";

/**
 * Email al coach quando un giocatore invia una richiesta di lezione.
 *
 * Sta qui e non in `actions/bookings.ts` apposta: la prenotazione è già
 * committata quando questo modulo entra in gioco, e nessun errore di posta può
 * risalire fino alla transazione. Vedi `notifyCoachOfBookingRequest()`.
 */

export type BookingRequestEmailData = {
  bookingId: string;
  coachName: string;
  coachEmail: string;
  playerName: string;
  /** "YYYY-MM-DD" */
  date: string;
  startTime: string;
  endTime: string;
  type: "singolo" | "gruppo";
  level: string;
  notes: string;
  locationName: string | null;
  locationAddress: string | null;
  locationCity: string | null;
};

const TYPE_LABEL: Record<BookingRequestEmailData["type"], string> = {
  singolo: "lezione singola",
  gruppo: "lezione di gruppo",
};

/** "lunedì 17 agosto 2026". Ricade sulla stringa grezza se la data è illeggibile. */
function longDateLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function placeLabel(data: BookingRequestEmailData): string {
  const parts = [data.locationName, data.locationAddress, data.locationCity].filter(
    (part): part is string => Boolean(part && part.trim())
  );
  return parts.length > 0 ? parts.join(", ") : "Campo da confermare";
}

/**
 * Costruisce il messaggio senza toccare rete o database: è la funzione che i
 * test ispezionano per sapere *cosa* verrebbe inviato.
 */
export function buildBookingRequestEmail(data: BookingRequestEmailData): EmailMessage {
  const when = `${longDateLabel(data.date)}, ${data.startTime}-${data.endTime}`;
  const link = absoluteUrl("/coach-admin/richieste");

  const lines = [
    `Ciao ${data.coachName},`,
    "",
    `${data.playerName} ti ha chiesto una lezione su Paideio.`,
    "",
    `Quando: ${when}`,
    `Dove: ${placeLabel(data)}`,
    `Tipo: ${TYPE_LABEL[data.type]}`,
    `Livello: ${data.level}`,
  ];

  if (data.notes.trim()) {
    lines.push(`Note del giocatore: ${data.notes.trim()}`);
  }

  lines.push(
    "",
    "La richiesta resta in attesa finché non la accetti o la rifiuti:",
    link,
    "",
    "Nessun pagamento è stato effettuato: la lezione è confermata solo dopo la tua risposta.",
    "",
    "Paideio"
  );

  return {
    to: [data.coachEmail],
    subject: `Nuova richiesta di lezione da ${data.playerName} (${longDateLabel(data.date)}, ${data.startTime})`,
    text: lines.join("\n"),
    // Una sola email per prenotazione, anche se l'azione viene rieseguita.
    idempotencyKey: `booking-request-${data.bookingId}`,
  };
}

export type BookingRequestNotificationInput = {
  bookingId: string;
  coachId: string;
  locationId: string;
  playerName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "singolo" | "gruppo";
  level: string;
  notes: string;
};

/**
 * Legge coach e campo, compone e consegna. Esportata (e con trasporto
 * iniettabile) perché un test possa aspettarne l'esito senza mandare posta
 * vera; il codice di produzione passa da `notifyCoachOfBookingRequest()`.
 */
export async function deliverBookingRequestEmail(
  input: BookingRequestNotificationInput,
  transport: EmailTransport = sendEmail
): Promise<EmailDeliveryOutcome> {
  if (!isEmailConfigured()) return "saltata";

  const [coach, location] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, input.coachId) }),
    db.query.locations.findFirst({ where: eq(locations.id, input.locationId) }),
  ]);

  if (!coach?.email) return "saltata";

  return transport(
    buildBookingRequestEmail({
      bookingId: input.bookingId,
      coachName: coach.name,
      coachEmail: coach.email,
      playerName: input.playerName,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      type: input.type,
      level: input.level,
      notes: input.notes,
      locationName: location?.name ?? null,
      locationAddress: location?.address ?? null,
      locationCity: location?.city ?? null,
    })
  );
}

/**
 * Punto d'ingresso per le Server Action: non ritorna una promessa e non lancia
 * mai. Il lavoro viene affidato a `waitUntil()`, così la risposta al giocatore
 * parte subito e il runtime Fluid Compute resta vivo il tempo dell'invio.
 * Fuori da Vercel `waitUntil` è un no-op e la promessa gira comunque in
 * background: in entrambi i casi la prenotazione è già salvata.
 */
export function notifyCoachOfBookingRequest(input: BookingRequestNotificationInput): void {
  if (!isEmailConfigured()) return;

  const task = deliverBookingRequestEmail(input).catch((error) => {
    console.error("[email] notifica richiesta prenotazione fallita", {
      bookingId: input.bookingId,
      error,
    });
    return "fallita" as const;
  });

  waitUntil(task);
}
