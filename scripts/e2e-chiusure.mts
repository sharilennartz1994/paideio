/**
 * Test end-to-end delle chiusure calendario contro un database reale.
 *
 * Da lanciare SOLO contro un Postgres usa-e-getta. Setup completo:
 *
 *   docker run -d --name paideio-e2e -e POSTGRES_PASSWORD=paideio \
 *     -e POSTGRES_DB=paideio -p 55432:5432 postgres:17
 *   export DATABASE_URL='postgres://postgres:paideio@localhost:55432/paideio'
 *   npx drizzle-kit push --force
 *   npx tsx src/lib/db/seed.ts
 *   npm run test:chiusure
 *   docker rm -f paideio-e2e
 *
 * Rifiuta di partire se DATABASE_URL non è locale, per non scrivere mai
 * chiusure finte nel database Neon condiviso con la produzione.
 * Esce con codice 1 se una verifica fallisce.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../src/lib/db/index.ts";
import {
  users,
  locations,
  availabilitySlots,
  availabilityClosures,
  bookings,
} from "../src/lib/db/schema.ts";
import { getCoachCalendar, getCoachSchedule, getCoachClosedDays } from "../src/lib/queries.ts";
import { toLocalDateString, closureKey, isSlotClosed } from "../src/lib/constants.ts";

const url = process.env.DATABASE_URL ?? "";
if (!/localhost|127\.0\.0\.1/.test(url) || /neon\.tech/.test(url)) {
  console.error("RIFIUTO: DATABASE_URL deve puntare a un Postgres locale usa-e-getta.");
  console.error(`Ricevuto: ${url.replace(/:[^:@]*@/, ":***@")}`);
  process.exit(1);
}

let passed = 0;
async function check(name: string, fn: () => void | Promise<void>) {
  await fn();
  passed++;
  console.log(`  ok  ${name}`);
}

function futureDateForDay(dayOfWeek: number, skip = 0): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  let found = 0;
  for (let i = 1; i <= 40; i++) {
    const c = new Date(d);
    c.setDate(c.getDate() + i);
    if (c.getDay() !== dayOfWeek) continue;
    if (found++ < skip) continue;
    return toLocalDateString(c);
  }
  throw new Error("nessuna data futura trovata");
}

async function closureRow(coachId: string, date: string, locationId: string | null, startTime: string | null) {
  await db.insert(availabilityClosures).values({
    id: randomUUID(),
    coachId,
    date,
    locationId,
    startTime,
    endTime: startTime ? "23:59" : null,
    createdAt: new Date().toISOString(),
  });
}

async function main() {
  const coach = await db.query.users.findFirst({ where: eq(users.role, "coach") });
  assert.ok(coach, "serve almeno un coach nel seed");
  const slot = await db.query.availabilitySlots.findFirst({
    where: eq(availabilitySlots.coachId, coach.id),
  });
  assert.ok(slot, "il coach deve avere almeno uno slot ricorrente");
  const location = await db.query.locations.findFirst({ where: eq(locations.id, slot.locationId) });
  assert.ok(location, "lo slot deve avere un campo");

  // Pulizia: il test è ripetibile sullo stesso database usa-e-getta.
  await db.delete(availabilityClosures).where(eq(availabilityClosures.coachId, coach.id));

  console.log("\nRegola condivisa (constants.ts)");
  await check("una chiusura di giornata copre qualunque campo e orario", () => {
    const keys = new Set([closureKey("2026-09-07", null, null)]);
    assert.equal(isSlotClosed(keys, "2026-09-07", "campo-x", "18:00"), true);
    assert.equal(isSlotClosed(keys, "2026-09-14", "campo-x", "18:00"), false);
  });
  await check("una chiusura di slot non tocca gli altri turni dello stesso giorno", () => {
    const keys = new Set([closureKey("2026-09-07", "campo-x", "18:00")]);
    assert.equal(isSlotClosed(keys, "2026-09-07", "campo-x", "18:00"), true);
    assert.equal(isSlotClosed(keys, "2026-09-07", "campo-x", "20:00"), false);
    assert.equal(isSlotClosed(keys, "2026-09-07", "campo-y", "18:00"), false);
  });

  const dateA = futureDateForDay(slot.dayOfWeek, 0);
  const dateB = futureDateForDay(slot.dayOfWeek, 1);

  console.log("\nChiusura di un singolo turno");
  const beforeA = await getCoachCalendar(coach.id, 28);
  assert.ok(
    beforeA.some((s) => s.date === dateA && s.startTime === slot.startTime),
    "lo slot deve essere nel calendario prima della chiusura"
  );
  await closureRow(coach.id, dateA, slot.locationId, slot.startTime);

  await check("sparisce dal calendario pubblico solo per quella data", async () => {
    const cal = await getCoachCalendar(coach.id, 28);
    assert.equal(cal.some((s) => s.date === dateA && s.startTime === slot.startTime), false);
    assert.equal(cal.some((s) => s.date === dateB && s.startTime === slot.startTime), true);
  });

  await check("resta visibile al coach, marcato come chiuso", async () => {
    const sched = await getCoachSchedule(coach.id, 28);
    const entry = sched.find((s) => s.date === dateA && s.startTime === slot.startTime);
    assert.ok(entry, "il coach deve continuare a vedere lo slot chiuso");
    assert.equal(entry.closed, true);
    assert.equal(entry.closedWholeDay, false);
  });

  await check("il turno ricorrente non viene toccato", async () => {
    const still = await db.query.availabilitySlots.findFirst({ where: eq(availabilitySlots.id, slot.id) });
    assert.ok(still, "availability_slots non deve essere modificata da una chiusura");
  });

  console.log("\nChiusura dell'intera giornata");
  await closureRow(coach.id, dateB, null, null);
  await check("nessuno slot di quel giorno resta prenotabile", async () => {
    const cal = await getCoachCalendar(coach.id, 28);
    assert.equal(cal.some((s) => s.date === dateB), false);
  });
  await check("il coach vede la giornata chiusa con closedWholeDay", async () => {
    const sched = await getCoachSchedule(coach.id, 28);
    const entries = sched.filter((s) => s.date === dateB);
    assert.ok(entries.length > 0, "gli slot del giorno devono restare visibili al coach");
    assert.ok(entries.every((e) => e.closed && e.closedWholeDay));
  });
  await check("compare in getCoachClosedDays", async () => {
    const closed = await getCoachClosedDays(coach.id, 28);
    assert.ok(closed.includes(dateB), "la giornata chiusa deve essere elencata");
    assert.equal(closed.includes(dateA), false, "una chiusura di slot non è una giornata chiusa");
  });

  console.log("\nVincoli di unicità");
  await check("due chiusure identiche della stessa giornata sono rifiutate", async () => {
    await assert.rejects(() => closureRow(coach.id, dateB, null, null));
  });
  await check("due chiusure identiche dello stesso turno sono rifiutate", async () => {
    await assert.rejects(() => closureRow(coach.id, dateA, slot.locationId, slot.startTime));
  });

  console.log("\nRiapertura");
  await db
    .delete(availabilityClosures)
    .where(and(eq(availabilityClosures.coachId, coach.id), eq(availabilityClosures.date, dateA)));
  await check("riaprendo, lo slot torna prenotabile", async () => {
    const cal = await getCoachCalendar(coach.id, 28);
    assert.equal(cal.some((s) => s.date === dateA && s.startTime === slot.startTime), true);
  });

  console.log("\nConteggio prenotazioni attive esposto al coach");
  const player = await db.query.users.findFirst({ where: eq(users.role, "player") });
  assert.ok(player, "serve almeno un giocatore nel seed");
  const bookingId = randomUUID();
  await db.insert(bookings).values({
    id: bookingId,
    playerId: player.id,
    coachId: coach.id,
    locationId: slot.locationId,
    date: dateA,
    startTime: slot.startTime,
    endTime: slot.endTime,
    type: "gruppo",
    level: "intermedio",
    status: "richiesta",
    notes: "",
    createdAt: new Date().toISOString(),
  });
  await check("activeBookings riflette le prenotazioni ancora attive", async () => {
    const sched = await getCoachSchedule(coach.id, 28);
    const entry = sched.find((s) => s.date === dateA && s.startTime === slot.startTime);
    assert.ok(entry);
    assert.equal(entry.activeBookings, 1);
  });
  await db.delete(bookings).where(inArray(bookings.id, [bookingId]));
  await db.delete(availabilityClosures).where(eq(availabilityClosures.coachId, coach.id));

  console.log(`\n${passed} verifiche superate.`);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error("\nFALLITO:", e);
    process.exit(1);
  }
);
