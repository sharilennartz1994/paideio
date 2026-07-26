/**
 * Test end-to-end della capienza slot contro un database reale.
 *
 * Da lanciare SOLO contro un Postgres usa-e-getta. Setup completo:
 *
 *   docker run -d --name paideio-e2e -e POSTGRES_PASSWORD=paideio \
 *     -e POSTGRES_DB=paideio -p 55432:5432 postgres:17
 *   export DATABASE_URL='postgres://postgres:paideio@localhost:55432/paideio'
 *   npx drizzle-kit push --force
 *   npx tsx src/lib/db/seed.ts
 *   npm run test:capienza
 *   docker rm -f paideio-e2e
 *
 * Rifiuta di partire se DATABASE_URL non è locale, per non scrivere mai
 * prenotazioni finte nel database Neon condiviso con la produzione.
 * Esce con codice 1 se una verifica fallisce.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../src/lib/db/index.ts";
import { users, coachProfiles, locations, availabilitySlots, bookings } from "../src/lib/db/schema.ts";
import { getCoachCalendar } from "../src/lib/queries.ts";
import { toLocalDateString } from "../src/lib/constants.ts";

const url = process.env.DATABASE_URL ?? "";
if (!/localhost|127\.0\.0\.1/.test(url) || /neon\.tech/.test(url)) {
  console.error("RIFIUTO: DATABASE_URL deve puntare a un Postgres locale usa-e-getta.");
  console.error(`Ricevuto: ${url.replace(/:[^:@]*@/, ":***@")}`);
  process.exit(1);
}

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

/**
 * Prima data futura, nel giorno della settimana dello slot, su cui non esiste
 * già una prenotazione attiva. Serve perché il database di test può contenere
 * prenotazioni create a mano o dal browser: senza questo il test dipenderebbe
 * dall'ordine in cui è stato lanciato.
 */
async function firstFreeDateForDay(coachId: string, dayOfWeek: number, startTime: string): Promise<string> {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 1; i <= 20; i++) {
    const candidate = new Date(d);
    candidate.setDate(candidate.getDate() + i);
    if (candidate.getDay() !== dayOfWeek) continue;
    const dateStr = toLocalDateString(candidate);
    const busy = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.coachId, coachId),
        eq(bookings.date, dateStr),
        eq(bookings.startTime, startTime),
        inArray(bookings.status, ["richiesta", "confermata"])
      ),
    });
    if (!busy) return dateStr;
  }
  throw new Error(`nessuna data libera per il giorno ${dayOfWeek} alle ${startTime}`);
}

async function findSlot(coachId: string) {
  const slot = await db.query.availabilitySlots.findFirst({
    where: eq(availabilitySlots.coachId, coachId),
  });
  assert.ok(slot, "il coach deve avere almeno uno slot");
  return slot;
}

async function calendarEntry(coachId: string, date: string, startTime: string) {
  const calendar = await getCoachCalendar(coachId);
  const entry = calendar.find((s) => s.date === date && s.startTime === startTime);
  assert.ok(entry, `slot ${date} ${startTime} assente dal calendario`);
  return entry;
}

async function addBooking(opts: {
  playerId: string;
  coachId: string;
  locationId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "singolo" | "gruppo";
  status?: "richiesta" | "confermata" | "annullata";
}) {
  const id = randomUUID();
  await db.insert(bookings).values({
    id,
    playerId: opts.playerId,
    coachId: opts.coachId,
    locationId: opts.locationId,
    date: opts.date,
    startTime: opts.startTime,
    endTime: opts.endTime,
    type: opts.type,
    level: "intermedio",
    status: opts.status ?? "richiesta",
    notes: "",
    createdAt: new Date().toISOString(),
  });
  return id;
}

/** Giocatori finti extra, per simulare altri utenti che occupano i posti. */
async function makePlayers(n: number) {
  const ids: string[] = [];
  for (let i = 0; i < n; i++) {
    const id = randomUUID();
    await db.insert(users).values({
      id,
      name: `Tester ${i + 1}`,
      email: `e2e-tester-${i + 1}-${id.slice(0, 8)}@example.com`,
      role: "player",
      createdAt: new Date().toISOString(),
    });
    ids.push(id);
  }
  return ids;
}

async function main() {
  const createdBookingIds: string[] = [];
  const createdPlayerIds: string[] = [];
  // 1 = fallito, finché il percorso felice non arriva in fondo.
  let esito = 1;

  try {
    const elena = await db.query.users.findFirst({ where: eq(users.email, "elena@example.com") });
    const davide = await db.query.users.findFirst({ where: eq(users.email, "davide@example.com") });
    assert.ok(elena && davide, "servono i coach demo (lancia prima il seed)");

    const elenaProfile = await db.query.coachProfiles.findFirst({
      where: eq(coachProfiles.userId, elena.id),
    });
    const davideProfile = await db.query.coachProfiles.findFirst({
      where: eq(coachProfiles.userId, davide.id),
    });
    assert.equal(elenaProfile?.groupCapacity, 4, "Elena: capienza 4");
    assert.equal(davideProfile?.groupCapacity, 2, "Davide: capienza 2");

    const players = await makePlayers(4);
    createdPlayerIds.push(...players);

    // ---------------------------------------------------------------
    console.log("\n1. Lezione SINGOLA → slot in esclusiva");
    // ---------------------------------------------------------------
    const eSlot = await findSlot(elena.id);
    const eLoc = await db.query.locations.findFirst({ where: eq(locations.coachId, elena.id) });
    assert.ok(eLoc);
    const eDate = await firstFreeDateForDay(elena.id, eSlot.dayOfWeek, eSlot.startTime);

    let entry = await calendarEntry(elena.id, eDate, eSlot.startTime);
    check("prima: libero, entrambi i tipi prenotabili", () => {
      assert.equal(entry.booked, false);
      assert.deepEqual([...entry.availableTypes].sort(), ["gruppo", "singolo"]);
    });

    createdBookingIds.push(
      await addBooking({
        playerId: players[0],
        coachId: elena.id,
        locationId: eLoc.id,
        date: eDate,
        startTime: eSlot.startTime,
        endTime: eSlot.endTime,
        type: "singolo",
      })
    );

    entry = await calendarEntry(elena.id, eDate, eSlot.startTime);
    check("dopo una singola: slot chiuso a tutti", () => {
      assert.equal(entry.booked, true);
      assert.equal(entry.bookedType, "singolo");
      assert.deepEqual(entry.availableTypes, []);
    });

    let secondSingleRejected = false;
    try {
      await addBooking({
        playerId: players[1],
        coachId: elena.id,
        locationId: eLoc.id,
        date: eDate,
        startTime: eSlot.startTime,
        endTime: eSlot.endTime,
        type: "singolo",
      });
    } catch {
      secondSingleRejected = true;
    }
    check("una seconda singola viene respinta dal database", () => {
      assert.equal(secondSingleRejected, true);
    });

    // ---------------------------------------------------------------
    console.log("\n2. Lezione di GRUPPO → posti condivisi fino alla capienza");
    // ---------------------------------------------------------------
    const dSlot = await findSlot(davide.id);
    const dLoc = await db.query.locations.findFirst({ where: eq(locations.coachId, davide.id) });
    assert.ok(dLoc);
    const dDate = await firstFreeDateForDay(davide.id, dSlot.dayOfWeek, dSlot.startTime);

    // Fotografia degli slot già chiusi da dati preesistenti: il test verifica la
    // differenza, non il totale, così resta valido su un DB non vergine.
    const chiusiPrima = new Set(
      (await getCoachCalendar(davide.id))
        .filter((s) => s.booked)
        .map((s) => `${s.date}|${s.startTime}`)
    );

    entry = await calendarEntry(davide.id, dDate, dSlot.startTime);
    check("prima: libero, 0 posti occupati su 2", () => {
      assert.equal(entry.booked, false);
      assert.equal(entry.seatsTaken, 0);
      assert.equal(entry.capacity, 2);
    });

    createdBookingIds.push(
      await addBooking({
        playerId: players[0],
        coachId: davide.id,
        locationId: dLoc.id,
        date: dDate,
        startTime: dSlot.startTime,
        endTime: dSlot.endTime,
        type: "gruppo",
      })
    );

    entry = await calendarEntry(davide.id, dDate, dSlot.startTime);
    check("1 di 2: ancora prenotabile, ma solo come gruppo", () => {
      assert.equal(entry.booked, false);
      assert.equal(entry.seatsTaken, 1);
      assert.deepEqual(entry.availableTypes, ["gruppo"]);
    });

    createdBookingIds.push(
      await addBooking({
        playerId: players[1],
        coachId: davide.id,
        locationId: dLoc.id,
        date: dDate,
        startTime: dSlot.startTime,
        endTime: dSlot.endTime,
        type: "gruppo",
      })
    );

    entry = await calendarEntry(davide.id, dDate, dSlot.startTime);
    check("2 di 2: slot al completo, sparisce dalle disponibilità", () => {
      assert.equal(entry.booked, true);
      assert.equal(entry.seatsTaken, 2);
      assert.deepEqual(entry.availableTypes, []);
    });

    // ---------------------------------------------------------------
    console.log("\n3. Solo QUELLO slot si chiude, non l'intera giornata");
    // ---------------------------------------------------------------
    const calendar = await getCoachCalendar(davide.id);
    const chiusiDopo = new Set(
      calendar.filter((s) => s.booked).map((s) => `${s.date}|${s.startTime}`)
    );
    const nuoviChiusi = [...chiusiDopo].filter((k) => !chiusiPrima.has(k));
    check("si chiude solo lo slot riempito, nessun altro", () => {
      assert.deepEqual(nuoviChiusi, [`${dDate}|${dSlot.startTime}`]);
    });
    check("restano altri orari prenotabili", () => {
      assert.ok(calendar.some((s) => !s.booked), "devono restare slot liberi");
    });

    // ---------------------------------------------------------------
    console.log("\n4. Annullare libera il posto");
    // ---------------------------------------------------------------
    await db
      .update(bookings)
      .set({ status: "annullata" })
      .where(eq(bookings.id, createdBookingIds[createdBookingIds.length - 1]));

    entry = await calendarEntry(davide.id, dDate, dSlot.startTime);
    check("dopo un annullamento: 1 di 2, di nuovo prenotabile", () => {
      assert.equal(entry.booked, false);
      assert.equal(entry.seatsTaken, 1);
      assert.deepEqual(entry.availableTypes, ["gruppo"]);
    });

    // ---------------------------------------------------------------
    console.log("\n5. Lo stesso giocatore non prende due posti");
    // ---------------------------------------------------------------
    let duplicateRejected = false;
    try {
      await addBooking({
        playerId: players[0],
        coachId: davide.id,
        locationId: dLoc.id,
        date: dDate,
        startTime: dSlot.startTime,
        endTime: dSlot.endTime,
        type: "gruppo",
      });
    } catch {
      duplicateRejected = true;
    }
    check("secondo posto allo stesso giocatore: respinto dal database", () => {
      assert.equal(duplicateRejected, true);
    });

    console.log(`\n${passed} verifiche superate\n`);
    esito = 0;
  } catch (error) {
    console.error("\nFALLITO:", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) console.error(error.stack.split("\n").slice(1, 4).join("\n"));
  } finally {
    console.log("\nPulizia dati di test...");
    if (createdPlayerIds.length > 0) {
      await db.delete(bookings).where(inArray(bookings.playerId, createdPlayerIds));
      await db.delete(users).where(inArray(users.id, createdPlayerIds));
    }
    const leftovers = await db.query.bookings.findMany({
      where: and(inArray(bookings.id, createdBookingIds.length ? createdBookingIds : ["-"])),
    });
    if (leftovers.length) {
      await db.delete(bookings).where(inArray(bookings.id, leftovers.map((b) => b.id)));
    }
    console.log(esito === 0 ? "Esito: OK" : "Esito: FALLITO");
    process.exit(esito);
  }
}

main();
