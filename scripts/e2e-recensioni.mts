/**
 * Test end-to-end delle recensioni contro un database reale.
 *
 * Copre la regola ("recensibile solo una lezione confermata e già svolta, una
 * sola volta, e solo dal giocatore che l'ha prenotata") **e** la sua
 * raggiungibilità: il bug trovato non era nella regola ma nel filtro di
 * `/prenotazioni`, che mostra `date >= oggi` mentre la recensione vive su
 * `date <= oggi`. La verifica 6 è la guardia di regressione su quel punto.
 *
 * Da lanciare SOLO contro un Postgres usa-e-getta. Setup completo:
 *
 *   docker run -d --name paideio-e2e -e POSTGRES_PASSWORD=paideio \
 *     -e POSTGRES_DB=paideio -p 55432:5432 postgres:17
 *   export DATABASE_URL='postgres://postgres:paideio@localhost:55432/paideio'
 *   npx drizzle-kit push --force
 *   npx tsx src/lib/db/seed.ts
 *   npm run test:recensioni
 *   docker rm -f paideio-e2e
 *
 * Rifiuta di partire se DATABASE_URL non è locale, per non scrivere mai
 * recensioni finte nel database Neon condiviso con la produzione.
 * Esce con codice 1 se una verifica fallisce.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "../src/lib/db/index.ts";
import { users, locations, bookings, reviews } from "../src/lib/db/schema.ts";
import { getBookingsForPlayer, countReviewableBookingsWithCoach, getCoachReviews } from "../src/lib/queries.ts";
import { toLocalDateString, matchesBookingPeriod, BOOKING_PERIODS } from "../src/lib/constants.ts";

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

function shiftDays(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return toLocalDateString(d);
}

async function makePlayer(label: string) {
  const id = randomUUID();
  await db.insert(users).values({
    id,
    name: `Recensore ${label}`,
    email: `e2e-recensioni-${label}-${id.slice(0, 8)}@example.com`,
    role: "player",
    createdAt: new Date().toISOString(),
  });
  return id;
}

async function addBooking(opts: {
  playerId: string;
  coachId: string;
  locationId: string;
  date: string;
  startTime: string;
  status: "richiesta" | "confermata" | "rifiutata" | "annullata";
}) {
  const id = randomUUID();
  await db.insert(bookings).values({
    id,
    playerId: opts.playerId,
    coachId: opts.coachId,
    locationId: opts.locationId,
    date: opts.date,
    startTime: opts.startTime,
    endTime: "23:00",
    type: "singolo",
    level: "intermedio",
    status: opts.status,
    notes: "",
    createdAt: new Date().toISOString(),
  });
  return id;
}

/** Sommario come lo riceve `PlayerBookingsOverview` (client component). */
async function summaryFor(playerId: string) {
  const rows = await getBookingsForPlayer(playerId);
  return rows.map((r) => ({
    id: r.booking.id,
    date: r.booking.date,
    status: r.booking.status,
    canReview: r.canReview,
    isReviewed: r.isReviewed,
  }));
}

async function main() {
  const createdPlayerIds: string[] = [];
  const createdReviewIds: string[] = [];
  let esito = 1;

  try {
    const elena = await db.query.users.findFirst({ where: eq(users.email, "elena@example.com") });
    assert.ok(elena, "serve il coach demo Elena (lancia prima il seed)");
    const loc = await db.query.locations.findFirst({ where: eq(locations.coachId, elena.id) });
    assert.ok(loc, "Elena deve avere almeno un campo");

    const giocatore = await makePlayer("a");
    const estraneo = await makePlayer("b");
    createdPlayerIds.push(giocatore, estraneo);

    const today = toLocalDateString(new Date());
    const ieri = shiftDays(-3);
    const domani = shiftDays(3);

    // ---------------------------------------------------------------
    console.log("\n1. Recensibile solo una lezione CONFERMATA");
    // ---------------------------------------------------------------
    // Orari diversi per non incrociare gli indici unici parziali su slot.
    const confermataPassata = await addBooking({
      playerId: giocatore, coachId: elena.id, locationId: loc.id,
      date: ieri, startTime: "08:00", status: "confermata",
    });
    const richiestaPassata = await addBooking({
      playerId: giocatore, coachId: elena.id, locationId: loc.id,
      date: ieri, startTime: "09:00", status: "richiesta",
    });
    const annullataPassata = await addBooking({
      playerId: giocatore, coachId: elena.id, locationId: loc.id,
      date: ieri, startTime: "10:00", status: "annullata",
    });
    const rifiutataPassata = await addBooking({
      playerId: giocatore, coachId: elena.id, locationId: loc.id,
      date: ieri, startTime: "11:00", status: "rifiutata",
    });

    let sommario = await summaryFor(giocatore);
    const byId = (id: string) => sommario.find((s) => s.id === id)!;

    check("confermata e già svolta: recensibile", () => {
      assert.equal(byId(confermataPassata).canReview, true);
    });
    check("richiesta non ancora confermata: non recensibile", () => {
      assert.equal(byId(richiestaPassata).canReview, false);
    });
    check("annullata: non recensibile", () => {
      assert.equal(byId(annullataPassata).canReview, false);
    });
    check("rifiutata: non recensibile", () => {
      assert.equal(byId(rifiutataPassata).canReview, false);
    });

    // ---------------------------------------------------------------
    console.log("\n2. Recensibile solo una lezione GIÀ SVOLTA");
    // ---------------------------------------------------------------
    const confermataFutura = await addBooking({
      playerId: giocatore, coachId: elena.id, locationId: loc.id,
      date: domani, startTime: "08:00", status: "confermata",
    });
    const confermataOggi = await addBooking({
      playerId: giocatore, coachId: elena.id, locationId: loc.id,
      date: today, startTime: "12:00", status: "confermata",
    });

    sommario = await summaryFor(giocatore);
    check("lezione futura: non ancora recensibile", () => {
      assert.equal(byId(confermataFutura).canReview, false);
    });
    check("lezione di oggi: già recensibile", () => {
      assert.equal(byId(confermataOggi).canReview, true);
    });

    // ---------------------------------------------------------------
    console.log("\n3. Una sola recensione per prenotazione");
    // ---------------------------------------------------------------
    const reviewId = randomUUID();
    await db.insert(reviews).values({
      id: reviewId,
      bookingId: confermataPassata,
      playerId: giocatore,
      coachId: elena.id,
      rating: 5,
      comment: "Ottima lezione.",
      createdAt: new Date().toISOString(),
    });
    createdReviewIds.push(reviewId);

    sommario = await summaryFor(giocatore);
    check("dopo la recensione: non più recensibile, marcata come inviata", () => {
      assert.equal(byId(confermataPassata).canReview, false);
      assert.equal(byId(confermataPassata).isReviewed, true);
    });

    let doppioneRespinto = false;
    try {
      await db.insert(reviews).values({
        id: randomUUID(),
        bookingId: confermataPassata,
        playerId: giocatore,
        coachId: elena.id,
        rating: 1,
        comment: "Seconda recensione.",
        createdAt: new Date().toISOString(),
      });
    } catch {
      doppioneRespinto = true;
    }
    check("una seconda recensione sulla stessa lezione: respinta dal database", () => {
      assert.equal(doppioneRespinto, true);
    });

    const recensioniCoach = await getCoachReviews(elena.id);
    check("la recensione compare sul profilo pubblico del coach", () => {
      assert.equal(recensioniCoach.filter((r) => r.review.bookingId === confermataPassata).length, 1);
    });

    // ---------------------------------------------------------------
    console.log("\n4. Nessun altro può recensire quella lezione");
    // ---------------------------------------------------------------
    const sommarioEstraneo = await summaryFor(estraneo);
    check("la lezione altrui non compare tra le prenotazioni di un altro giocatore", () => {
      assert.equal(sommarioEstraneo.some((s) => s.id === confermataOggi), false);
      assert.equal(sommarioEstraneo.length, 0);
    });
    const recensibiliEstraneo = await countReviewableBookingsWithCoach(estraneo, elena.id);
    check("un giocatore senza lezioni non ha nulla da recensire", () => {
      assert.equal(sommarioEstraneo.filter((s) => s.canReview).length, 0);
      assert.equal(recensibiliEstraneo, 0);
    });

    // ---------------------------------------------------------------
    console.log("\n5. Il profilo del coach richiama solo chi ha davvero da recensire");
    // ---------------------------------------------------------------
    const recensibiliGiocatore = await countReviewableBookingsWithCoach(giocatore, elena.id);
    check("il giocatore con una lezione svolta vede il richiamo", () => {
      // Restano `confermataOggi` (la passata è già recensita).
      assert.equal(recensibiliGiocatore, 1);
    });

    // ---------------------------------------------------------------
    console.log("\n6. Il pulsante è RAGGIUNGIBILE (regressione del bug)");
    // ---------------------------------------------------------------
    // Una seconda lezione svolta e non ancora recensita: è esattamente il caso
    // che spariva dalla pagina il giorno dopo la lezione.
    await addBooking({
      playerId: giocatore, coachId: elena.id, locationId: loc.id,
      date: shiftDays(-7), startTime: "08:00", status: "confermata",
    });

    sommario = await summaryFor(giocatore);
    const recensibili = sommario.filter((s) => s.canReview);
    check("esiste almeno una lezione recensibile in questo scenario", () => {
      assert.ok(recensibili.length > 0);
      // Non basta che ce ne sia una "di oggi": il caso che si rompeva è quello
      // di una lezione svolta nei giorni scorsi.
      assert.ok(recensibili.some((s) => s.date < today), "serve una recensibile nel passato");
    });

    const perPeriodo = Object.fromEntries(
      BOOKING_PERIODS.map((p) => [p, sommario.filter((s) => matchesBookingPeriod(s, p, today)).filter((s) => s.canReview).length])
    ) as Record<(typeof BOOKING_PERIODS)[number], number>;

    check("il periodo 'da-recensire' mostra tutte e sole le lezioni recensibili", () => {
      assert.equal(perPeriodo["da-recensire"], recensibili.length);
    });
    check("il contatore che accende il richiamo in cima alla pagina è > 0", () => {
      // È il valore di `pendingReviews` in `PlayerBookingsOverview`: se è 0 il
      // richiamo non compare e il pulsante torna irraggiungibile.
      assert.ok(recensibili.length > 0);
    });
    check("il default 'prossime' da solo NON basta: da qui nasceva il bug", () => {
      // Documenta la causa: il filtro di default e la recensibilità si toccano
      // solo nel giorno stesso della lezione.
      assert.ok(perPeriodo.prossime < recensibili.length);
      const passateRecensibili = sommario.filter((s) => s.date < today && s.canReview);
      assert.ok(passateRecensibili.length > 0);
      assert.equal(
        passateRecensibili.every((s) => !matchesBookingPeriod(s, "prossime", today)),
        true
      );
    });

    console.log(`\n${passed} verifiche superate\n`);
    esito = 0;
  } catch (error) {
    console.error("\nFALLITO:", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) console.error(error.stack.split("\n").slice(1, 4).join("\n"));
  } finally {
    console.log("\nPulizia dati di test...");
    if (createdReviewIds.length > 0) {
      await db.delete(reviews).where(inArray(reviews.id, createdReviewIds));
    }
    if (createdPlayerIds.length > 0) {
      // Le prenotazioni hanno `onDelete: cascade` sul giocatore, ma le
      // cancelliamo esplicitamente per non dipendere dallo schema.
      await db.delete(bookings).where(inArray(bookings.playerId, createdPlayerIds));
      await db.delete(users).where(inArray(users.id, createdPlayerIds));
    }
    console.log(esito === 0 ? "Esito: OK" : "Esito: FALLITO");
    process.exit(esito);
  }
}

main();
