/**
 * Test end-to-end delle proposte di orario contro un database reale.
 *
 * Copre il giro completo: il coach rifiuta con motivazione oppure propone un
 * altro orario, il giocatore accetta o rifiuta, e ciò che è stato accettato
 * occupa davvero il calendario.
 *
 * Chiama le funzioni di `src/lib/booking-proposals.ts`, non le Server Action:
 * sono le stesse identiche, ma senza il livello di autenticazione Clerk e
 * senza `revalidatePath`, che fuori da una richiesta Next lancerebbe.
 *
 * Da lanciare SOLO contro un Postgres usa-e-getta:
 *
 *   docker run -d --name paideio-e2e -e POSTGRES_PASSWORD=paideio \
 *     -e POSTGRES_DB=paideio -p 55432:5432 postgres:17
 *   export DATABASE_URL='postgres://postgres:paideio@localhost:55432/paideio'
 *   npx drizzle-kit push --force
 *   npx tsx --tsconfig tsconfig.scripts.json scripts/db-apply-overlap-constraint.mts
 *   npx tsx src/lib/db/seed.ts
 *   npm run test:proposte
 *   docker rm -f paideio-e2e
 *
 * Rifiuta di partire se DATABASE_URL non è locale.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../src/lib/db/index.ts";
import {
  users,
  coachProfiles,
  locations,
  availabilitySlots,
  availabilityClosures,
  bookings,
  notifications,
} from "../src/lib/db/schema.ts";
import {
  rejectBookingWithReason,
  proposeBookingTime,
  acceptBookingProposal,
  declineBookingProposal,
} from "../src/lib/booking-proposals.ts";
import {
  computeLessonAvailability,
  proposableStarts,
  minutesFromTime as M,
  timeFromMinutes as T,
  toLocalDateString,
} from "../src/lib/constants.ts";

const url = process.env.DATABASE_URL ?? "";
if (!/localhost|127\.0\.0\.1/.test(url) || /neon\.tech/.test(url)) {
  console.error("RIFIUTO: DATABASE_URL deve puntare a un Postgres locale usa-e-getta.");
  process.exit(1);
}

let passed = 0;
async function check(name: string, fn: () => void | Promise<void>) {
  await fn();
  passed++;
  console.log(`  ok  ${name}`);
}

const CAPACITY = 3;
const TYPES = ["singolo", "gruppo"];
const WINDOW = { start: M("09:00"), end: M("13:00") };
const MOTIVO = "Ho un torneo federale proprio in quella fascia, mi dispiace.";

async function main() {
  const coach = await db.query.users.findFirst({ where: eq(users.role, "coach") });
  assert.ok(coach, "serve un coach nel seed");
  await db
    .update(coachProfiles)
    .set({
      groupCapacity: CAPACITY,
      trainingTypes: JSON.stringify(TYPES),
      levels: JSON.stringify(["intermedio"]),
    })
    .where(eq(coachProfiles.userId, coach.id));

  const location = await db.query.locations.findFirst({ where: eq(locations.coachId, coach.id) });
  assert.ok(location, "serve un campo");

  // Una sola finestra pulita 09:00-13:00 su un giorno futuro.
  const target = new Date();
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + 4);
  const dateStr = toLocalDateString(target);
  const dayOfWeek = target.getDay();
  // Secondo giorno utile, per le proposte che spostano anche la data.
  const other = new Date(target);
  other.setDate(other.getDate() + 7);
  const otherDateStr = toLocalDateString(other);

  await db.delete(availabilitySlots).where(eq(availabilitySlots.coachId, coach.id));
  await db.insert(availabilitySlots).values({
    id: randomUUID(),
    coachId: coach.id,
    locationId: location.id,
    dayOfWeek,
    startTime: "09:00",
    endTime: "13:00",
  });
  await db.delete(availabilityClosures).where(eq(availabilityClosures.coachId, coach.id));
  const raceDatePrecleanup = new Date(target);
  raceDatePrecleanup.setDate(raceDatePrecleanup.getDate() + 14);
  await db
    .delete(bookings)
    .where(
      and(
        eq(bookings.coachId, coach.id),
        inArray(bookings.date, [
          dateStr,
          otherDateStr,
          toLocalDateString(raceDatePrecleanup),
        ])
      )
    );

  const playerIds: string[] = [];
  for (let i = 0; i < 3; i++) {
    const id = randomUUID();
    await db.insert(users).values({
      id,
      name: `Tester ${i + 1}`,
      email: `e2e-prop-${id.slice(0, 8)}@example.com`,
      role: "player",
      createdAt: new Date().toISOString(),
    });
    playerIds.push(id);
  }

  async function request(
    playerId: string,
    s: string,
    e: string,
    type = "singolo",
    date = dateStr
  ): Promise<string> {
    const id = randomUUID();
    await db.insert(bookings).values({
      id,
      playerId,
      coachId: coach!.id,
      locationId: location!.id,
      date,
      startTime: s,
      endTime: e,
      type: type as "singolo" | "gruppo",
      level: "intermedio",
      status: "richiesta",
      notes: "",
      createdAt: new Date().toISOString(),
    });
    return id;
  }
  const row = async (id: string) =>
    (await db.query.bookings.findFirst({ where: eq(bookings.id, id) }))!;
  async function busy(date = dateStr) {
    const rows = await db.query.bookings.findMany({
      where: and(
        eq(bookings.coachId, coach!.id),
        eq(bookings.date, date),
        inArray(bookings.status, ["richiesta", "confermata"])
      ),
    });
    return rows.map((b) => ({
      start: M(b.startTime),
      end: M(b.endTime),
      type: b.type,
      playerId: b.playerId,
    }));
  }
  const av = async (s: string, e: string, date = dateStr) =>
    computeLessonAvailability({ start: M(s), end: M(e) }, await busy(date), CAPACITY, TYPES);
  const notifs = async (bookingId: string) =>
    db.query.notifications.findMany({ where: eq(notifications.bookingId, bookingId) });

  console.log("\n1. Rifiuto con motivazione");
  const rejected = await request(playerIds[0], "10:00", "11:00");
  await check("una motivazione troppo corta non passa", async () => {
    const res = await rejectBookingWithReason({
      bookingId: rejected,
      coachId: coach.id,
      reason: "no",
    });
    assert.equal(res.ok, false);
    assert.equal((await row(rejected)).status, "richiesta");
  });
  await check("un altro coach non può rispondere a questa richiesta", async () => {
    const res = await rejectBookingWithReason({
      bookingId: rejected,
      coachId: playerIds[1],
      reason: MOTIVO,
    });
    assert.equal(res.ok, false);
  });
  await check("con la motivazione la richiesta si chiude e resta scritta", async () => {
    const res = await rejectBookingWithReason({
      bookingId: rejected,
      coachId: coach.id,
      reason: MOTIVO,
    });
    assert.equal(res.ok, true);
    const after = await row(rejected);
    assert.equal(after.status, "rifiutata");
    assert.equal(after.coachMessage, MOTIVO);
    const inbox = await notifs(rejected);
    assert.equal(inbox.length, 2, "una notifica per il giocatore e una per il coach");
    assert.ok(inbox.every((n) => n.type === "booking_rejected"));
    assert.ok(inbox.some((n) => n.userId === playerIds[0] && n.message.includes(MOTIVO)));
  });
  await check("un rifiuto libera subito la fascia", async () => {
    const freed = await av("10:00", "11:00");
    assert.equal(freed.blocked, false);
    assert.deepEqual(freed.availableTypes, TYPES);
  });

  console.log("\n2. Una proposta fuori finestra viene rifiutata");
  const moved = await request(playerIds[0], "10:00", "11:00", "gruppo");
  const propose = (date: string, s: string, e: string) =>
    proposeBookingTime({
      bookingId: moved,
      coachId: coach.id,
      date,
      startTime: s,
      endTime: e,
      message: MOTIVO,
    });
  await check("un orario oltre la fine della finestra non è proponibile", async () => {
    const res = await propose(dateStr, "14:00", "15:00");
    assert.equal(res.ok, false);
    assert.match(res.error, /disponibilit/i);
  });
  await check("un giorno senza turni pubblicati non è proponibile", async () => {
    const dayAfter = new Date(target);
    dayAfter.setDate(dayAfter.getDate() + 1);
    const res = await propose(toLocalDateString(dayAfter), "10:00", "11:00");
    assert.equal(res.ok, false);
  });
  await check("un inizio che spezza la finestra non è proponibile", async () => {
    // 09:15 non è fra gli inizi raggiungibili impacchettando 60 e 90 minuti.
    const res = await propose(dateStr, "09:15", "10:15");
    assert.equal(res.ok, false);
    assert.equal(proposableStarts(WINDOW, [], 60, "gruppo", CAPACITY, TYPES).includes(M("09:15")), false);
  });
  await check("una durata che non esiste non è proponibile", async () => {
    const res = await propose(dateStr, "09:00", "09:45");
    assert.equal(res.ok, false);
    assert.match(res.error, /60 o 90/);
  });
  await check("non si può proporre una data già passata", async () => {
    const past = new Date(target);
    past.setDate(past.getDate() - 30);
    const res = await propose(toLocalDateString(past), "09:00", "10:00");
    assert.equal(res.ok, false);
  });
  await check("non si può proporre l'orario che il giocatore ha già chiesto", async () => {
    const res = await propose(dateStr, "10:00", "11:00");
    assert.equal(res.ok, false);
  });
  await check("una data chiusa nel calendario non è proponibile", async () => {
    await db.insert(availabilityClosures).values({
      id: randomUUID(),
      coachId: coach.id,
      date: otherDateStr,
      locationId: null,
      startTime: null,
      endTime: null,
      createdAt: new Date().toISOString(),
    });
    const res = await propose(otherDateStr, "09:00", "10:00");
    assert.equal(res.ok, false);
    assert.match(res.error, /chiusa/i);
    await db
      .delete(availabilityClosures)
      .where(and(eq(availabilityClosures.coachId, coach.id), eq(availabilityClosures.date, otherDateStr)));
  });
  await check("dopo tutti i rifiuti la richiesta è ancora in attesa", async () => {
    assert.equal((await row(moved)).status, "richiesta");
  });

  console.log("\n3. Una proposta valida non prenota niente");
  await check("la proposta passa e la lezione entra in trattativa", async () => {
    const res = await propose(dateStr, "11:00", "12:00");
    assert.equal(res.ok, true);
    const after = await row(moved);
    assert.equal(after.status, "controproposta");
    assert.equal(after.proposedDate, dateStr);
    assert.equal(after.proposedStartTime, "11:00");
    assert.equal(after.coachMessage, MOTIVO);
    // La riga NON si è mossa: l'orario cambia solo se il giocatore accetta.
    assert.equal(after.startTime, "10:00");
    const inbox = await notifs(moved);
    assert.equal(inbox.length, 2);
    assert.ok(inbox.every((n) => n.type === "booking_proposed"));
  });
  await check("la fascia richiesta all'inizio torna libera per gli altri", async () => {
    const freed = await av("10:00", "11:00");
    assert.equal(freed.blocked, false);
    assert.deepEqual(freed.availableTypes, TYPES);
  });
  await check("la fascia proposta resta libera: una proposta non è una prenotazione", async () => {
    const proposedSlot = await av("11:00", "12:00");
    assert.equal(proposedSlot.blocked, false);
    assert.deepEqual(proposedSlot.availableTypes, TYPES);
  });

  console.log("\n4. Il giocatore accetta: la lezione si sposta e occupa il campo");
  await check("solo il giocatore della lezione può accettare", async () => {
    const res = await acceptBookingProposal({ bookingId: moved, playerId: playerIds[1] });
    assert.equal(res.ok, false);
  });
  await check("accettando, la lezione si sposta ed è confermata", async () => {
    const res = await acceptBookingProposal({ bookingId: moved, playerId: playerIds[0] });
    assert.equal(res.ok, true);
    const after = await row(moved);
    assert.equal(after.status, "confermata");
    assert.equal(after.startTime, "11:00");
    assert.equal(after.endTime, "12:00");
    assert.equal(after.proposedStartTime, null, "la proposta è consumata");
    assert.equal(after.proposedDate, null);
    assert.ok((await notifs(moved)).some((n) => n.type === "booking_proposal_accepted"));
  });
  await check("l'orario accettato non è più prenotabile da una lezione singola", async () => {
    const taken = await av("11:00", "12:00");
    assert.deepEqual(taken.availableTypes, ["gruppo"], "sopra un gruppo non entra una singola");
    assert.equal(taken.seatsTaken, 1);
    // Una fascia che si accavalla non regge nemmeno a livello di database.
    await assert.rejects(
      () => request(playerIds[1], "11:30", "12:30", "singolo"),
      "il vincolo GiST deve respingere la sovrapposizione"
    );
  });
  await check("ma resta condivisibile: un altro giocatore entra nel gruppo", async () => {
    const joined = await request(playerIds[1], "11:00", "12:00", "gruppo");
    const shared = await av("11:00", "12:00");
    assert.equal(shared.seatsTaken, 2);
    assert.equal(shared.capacity, CAPACITY);
    assert.deepEqual(shared.availableTypes, ["gruppo"]);
    await db.delete(bookings).where(eq(bookings.id, joined));
  });
  await check("una proposta già consumata non si accetta due volte", async () => {
    const res = await acceptBookingProposal({ bookingId: moved, playerId: playerIds[0] });
    assert.equal(res.ok, false);
  });

  console.log("\n5. Lo slot rubato fra la proposta e l'accettazione");
  const contested = await request(playerIds[2], "09:00", "10:00", "singolo", otherDateStr);
  await check("il coach propone una fascia libera sull'altra data", async () => {
    const res = await proposeBookingTime({
      bookingId: contested,
      coachId: coach.id,
      date: otherDateStr,
      startTime: "11:00",
      endTime: "12:00",
      message: MOTIVO,
    });
    assert.equal(res.ok, true);
  });
  await check("nel frattempo qualcun altro se la prende", async () => {
    await request(playerIds[1], "11:00", "12:00", "singolo", otherDateStr);
    const taken = await av("11:00", "12:00", otherDateStr);
    assert.equal(taken.bookedType, "singolo");
  });
  await check("l'accettazione fallisce con una frase, non con un errore SQL", async () => {
    const res = await acceptBookingProposal({ bookingId: contested, playerId: playerIds[2] });
    assert.equal(res.ok, false);
    assert.match(res.error, /non è più disponibile/);
    assert.match(res.error, /singola/, "deve dire anche perché");
    const after = await row(contested);
    assert.equal(after.status, "controproposta", "la proposta resta lì: il coach può rifarla");
    assert.equal(after.proposedStartTime, "11:00");
  });

  console.log("\n6. Il giocatore rifiuta la proposta");
  await check("rifiutando, la richiesta si chiude e la proposta sparisce", async () => {
    const res = await declineBookingProposal({ bookingId: contested, playerId: playerIds[2] });
    assert.equal(res.ok, true);
    const after = await row(contested);
    assert.equal(after.status, "rifiutata");
    assert.equal(after.proposedStartTime, null);
    assert.equal(after.coachMessage, MOTIVO, "il perché resta leggibile");
    assert.ok((await notifs(contested)).some((n) => n.type === "booking_proposal_declined"));
  });
  await check("la fascia della richiesta iniziale è di nuovo libera", async () => {
    const freed = await av("09:00", "10:00", otherDateStr);
    assert.equal(freed.blocked, false);
    assert.deepEqual(freed.availableTypes, TYPES);
  });

  console.log("\n7. Due accettazioni sulla stessa fascia, nello stesso istante");
  const third = new Date(target);
  third.setDate(third.getDate() + 14);
  const raceDate = toLocalDateString(third);
  const raceA = await request(playerIds[0], "09:00", "10:00", "singolo", raceDate);
  const raceB = await request(playerIds[1], "10:00", "11:00", "singolo", raceDate);
  await check("il coach può proporre la stessa fascia a due giocatori", async () => {
    // Legittimo proprio perché una proposta non riserva niente: il coach non
    // sa quale dei due risponderà.
    for (const id of [raceA, raceB]) {
      const res = await proposeBookingTime({
        bookingId: id,
        coachId: coach.id,
        date: raceDate,
        startTime: "11:00",
        endTime: "12:00",
        message: MOTIVO,
      });
      assert.equal(res.ok, true);
    }
  });
  await check("solo una delle due accettazioni concorrenti passa", async () => {
    const [resA, resB] = await Promise.all([
      acceptBookingProposal({ bookingId: raceA, playerId: playerIds[0] }),
      acceptBookingProposal({ bookingId: raceB, playerId: playerIds[1] }),
    ]);
    const winners = [resA, resB].filter((r) => r.ok);
    const losers = [resA, resB].filter((r) => !r.ok);
    assert.equal(winners.length, 1, "l'advisory lock deve serializzare le due accettazioni");
    assert.equal(losers.length, 1);
    assert.match(losers[0].ok ? "" : losers[0].error, /non è più disponibile/);
    const confirmed = await db.query.bookings.findMany({
      where: and(
        eq(bookings.coachId, coach.id),
        eq(bookings.date, raceDate),
        inArray(bookings.status, ["richiesta", "confermata"])
      ),
    });
    assert.equal(confirmed.length, 1, "una sola lezione attiva su quella fascia");
    assert.equal(confirmed[0].startTime, "11:00");
  });

  console.log("\nPulizia...");
  await db
    .delete(bookings)
    .where(
      and(eq(bookings.coachId, coach.id), inArray(bookings.date, [dateStr, otherDateStr, raceDate]))
    );
  await db.delete(users).where(inArray(users.id, playerIds));

  console.log(`\n${passed} verifiche superate.`);
  console.log(`(inizi proponibili da 60 minuti nella finestra: ${proposableStarts(WINDOW, [], 60, "gruppo", CAPACITY, TYPES).map(T).join(", ")})`);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error("\nFALLITO:", e);
    process.exit(1);
  }
);
