/**
 * Test end-to-end di capienza e sovrapposizioni contro un database reale.
 *
 * Riscritto quando le lezioni sono passate da "slot = unità prenotabile" a
 * "finestra ampia + ritaglio da 60 o 90 minuti": le invarianti sono le stesse,
 * ma ora si esprimono su intervalli, non su un inizio uguale.
 *
 * Da lanciare SOLO contro un Postgres usa-e-getta:
 *
 *   docker run -d --name paideio-e2e -e POSTGRES_PASSWORD=paideio \
 *     -e POSTGRES_DB=paideio -p 55432:5432 postgres:17
 *   export DATABASE_URL='postgres://postgres:paideio@localhost:55432/paideio'
 *   npx drizzle-kit push --force
 *   npx tsx --tsconfig tsconfig.scripts.json scripts/db-apply-overlap-constraint.mts
 *   npx tsx src/lib/db/seed.ts
 *   npm run test:capienza
 *   docker rm -f paideio-e2e
 *
 * Rifiuta di partire se DATABASE_URL non è locale.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../src/lib/db/index.ts";
import { users, coachProfiles, locations, availabilitySlots, bookings } from "../src/lib/db/schema.ts";
import { getCoachCalendar } from "../src/lib/queries.ts";
import {
  allowedStarts,
  computeLessonAvailability,
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
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

const CAPACITY = 3;
const TYPES = ["singolo", "gruppo"];
const WINDOW = { start: M("09:00"), end: M("13:00") };

async function main() {
  const coach = await db.query.users.findFirst({ where: eq(users.role, "coach") });
  assert.ok(coach, "serve un coach nel seed");
  await db
    .update(coachProfiles)
    .set({ groupCapacity: CAPACITY, trainingTypes: JSON.stringify(TYPES) })
    .where(eq(coachProfiles.userId, coach.id));

  const location = await db.query.locations.findFirst({ where: eq(locations.coachId, coach.id) });
  assert.ok(location, "serve un campo");

  // Finestra pulita: un solo turno 09:00-13:00 su un giorno preciso.
  const target = new Date();
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + 3);
  const dateStr = toLocalDateString(target);
  const dayOfWeek = target.getDay();

  await db.delete(availabilitySlots).where(eq(availabilitySlots.coachId, coach.id));
  await db.insert(availabilitySlots).values({
    id: randomUUID(),
    coachId: coach.id,
    locationId: location.id,
    dayOfWeek,
    startTime: "09:00",
    endTime: "13:00",
  });
  await db.delete(bookings).where(and(eq(bookings.coachId, coach.id), eq(bookings.date, dateStr)));

  const playerIds: string[] = [];
  for (let i = 0; i < CAPACITY + 1; i++) {
    const id = randomUUID();
    await db.insert(users).values({
      id,
      name: `Tester ${i + 1}`,
      email: `e2e-${id.slice(0, 8)}@example.com`,
      role: "player",
      createdAt: new Date().toISOString(),
    });
    playerIds.push(id);
  }

  async function book(playerId: string, s: string, e: string, type: string, status = "richiesta") {
    await db.insert(bookings).values({
      id: randomUUID(),
      playerId,
      coachId: coach!.id,
      locationId: location!.id,
      date: dateStr,
      startTime: s,
      endTime: e,
      type: type as "singolo" | "gruppo",
      level: "intermedio",
      status: status as "richiesta",
      notes: "",
      createdAt: new Date().toISOString(),
    });
  }
  async function busy() {
    const rows = await db.query.bookings.findMany({
      where: and(
        eq(bookings.coachId, coach!.id),
        eq(bookings.date, dateStr),
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
  const av = async (s: string, e: string) =>
    computeLessonAvailability({ start: M(s), end: M(e) }, await busy(), CAPACITY, TYPES);

  console.log("\n1. La finestra genera ritagli, non è essa stessa prenotabile");
  const starts60 = allowedStarts(WINDOW, [], 60).map(T);
  const starts90 = allowedStarts(WINDOW, [], 90).map(T);
  check("09:00-13:00 offre più inizi da 60 minuti", () => {
    // 11:30 escluso di proposito: 11:30+60=12:30 lascerebbe 30 minuti
    // invendibili prima delle 13:00.
    assert.deepEqual(starts60, ["09:00", "10:00", "10:30", "11:00", "12:00"]);
  });
  check("e inizi diversi per la durata da 90", () => {
    assert.deepEqual(starts90, ["09:00", "10:00", "10:30", "11:30"]);
  });
  check("nessun inizio lascia un buco più corto di un'ora", () => {
    for (const s of starts90) {
      const rest = WINDOW.end - (M(s) + 90);
      assert.ok(rest === 0 || rest >= 60, `${s} lascerebbe ${rest} minuti invendibili`);
    }
  });

  console.log("\n2. Lezione SINGOLA: esclusiva sul suo intervallo");
  await book(playerIds[0], "10:00", "11:00", "singolo");
  const overlap = await av("10:30", "11:30");
  check("10:30-11:30 su 10:00-11:00 -> blocked", () => {
    assert.equal(overlap.blocked, true);
    assert.deepEqual(overlap.availableTypes, []);
  });
  const identical = await av("10:00", "11:00");
  check("stesso intervallo -> occupato dalla singola", () => {
    assert.equal(identical.bookedType, "singolo");
    assert.deepEqual(identical.availableTypes, []);
  });
  const adjacent = await av("11:00", "12:00");
  check("11:00-12:00 adiacente -> ancora libero", () => {
    assert.equal(adjacent.blocked, false);
    assert.deepEqual(adjacent.availableTypes, TYPES);
  });
  const afterSingle = allowedStarts(WINDOW, await busy(), 60).map(T);
  check("09:00 e 11:00 restano, 10:30 sparisce", () => {
    assert.ok(afterSingle.includes("09:00"));
    assert.ok(afterSingle.includes("11:00"));
    assert.ok(!afterSingle.includes("10:30"));
  });

  console.log("\n3. Lezione di GRUPPO: stesso intervallo, posti condivisi");
  await db.delete(bookings).where(and(eq(bookings.coachId, coach.id), eq(bookings.date, dateStr)));
  await book(playerIds[0], "09:00", "10:00", "gruppo");
  const g1 = await av("09:00", "10:00");
  check(`1 di ${CAPACITY}: ancora prenotabile, solo come gruppo`, () => {
    assert.deepEqual(g1.availableTypes, ["gruppo"]);
    assert.equal(g1.seatsTaken, 1);
    assert.equal(g1.capacity, CAPACITY);
  });
  await book(playerIds[1], "09:00", "10:00", "gruppo");
  await book(playerIds[2], "09:00", "10:00", "gruppo");
  const gFull = await av("09:00", "10:00");
  check(`${CAPACITY} di ${CAPACITY}: al completo`, () => {
    assert.equal(gFull.full, true);
    assert.deepEqual(gFull.availableTypes, []);
  });
  const otherDuration = await av("09:00", "10:30");
  check("una durata diversa sullo stesso inizio è un conflitto", () => {
    assert.equal(otherDuration.blocked, true);
  });

  console.log("\n4. Il database rifiuta ciò che l'applicazione non deve produrre");
  await assert.rejects(
    () => book(playerIds[3], "09:30", "10:30", "singolo"),
    "una lezione che si accavalla deve essere respinta dal vincolo di esclusione"
  );
  passed++;
  console.log("  ok  sovrapposizione respinta dal vincolo GiST");
  await assert.rejects(
    () => book(playerIds[0], "09:00", "10:00", "gruppo"),
    "lo stesso giocatore non può prendere due posti nella stessa lezione"
  );
  passed++;
  console.log("  ok  doppio posto allo stesso giocatore respinto");

  console.log("\n5. Annullare libera davvero");
  await db
    .update(bookings)
    .set({ status: "annullata" })
    .where(and(eq(bookings.coachId, coach.id), eq(bookings.date, dateStr)));
  const freed = await av("09:00", "10:00");
  check("dopo l'annullamento il ritaglio torna libero", () => {
    assert.equal(freed.blocked, false);
    assert.deepEqual(freed.availableTypes, TYPES);
  });

  console.log("\n6. Il calendario pubblico espone la finestra, non i ritagli");
  const calendar = await getCoachCalendar(coach.id, 21);
  const entry = calendar.find((w) => w.date === dateStr);
  check("la finestra compare una volta sola, con gli estremi pubblicati", () => {
    assert.ok(entry, "la finestra deve essere nel calendario");
    assert.equal(entry.startTime, "09:00");
    assert.equal(entry.endTime, "13:00");
    assert.equal(entry.full, false);
  });

  console.log("\nPulizia...");
  await db.delete(bookings).where(and(eq(bookings.coachId, coach.id), eq(bookings.date, dateStr)));
  await db.delete(users).where(inArray(users.id, playerIds));

  console.log(`\n${passed} verifiche superate.`);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error("\nFALLITO:", e);
    process.exit(1);
  }
);
