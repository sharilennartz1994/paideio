/**
 * Vincolo di non sovrapposizione tra lezioni.
 *
 * Da quando il coach pubblica una **finestra** ampia e il giocatore ci ritaglia
 * dentro una lezione da 60 o 90 minuti, gli indici unici su `start_time` non
 * bastano più: una singola 9:00-10:30 e una 9:30-11:00 hanno inizi diversi ma
 * si accavallano, e passerebbero entrambe.
 *
 * La forma giusta in Postgres è un vincolo di esclusione GiST su intervalli,
 * che `drizzle-kit push` non sa generare. Questo script è **idempotente**:
 * rilanciarlo dopo ogni `npm run db:push`.
 *
 *   npm run db:constraints
 *
 * Regola: due prenotazioni attive dello stesso coach, stesso campo e stessa
 * data confliggono se i loro intervalli si sovrappongono **e** non sono
 * esattamente lo stesso intervallo. Intervalli identici sono la stessa lezione:
 * è l'unico caso in cui più giocatori possono coesistere (lezione di gruppo),
 * e la capienza la impone `createBooking` sotto advisory lock.
 */
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const STEPS: [string, string][] = [
  [
    "estensione btree_gist",
    `CREATE EXTENSION IF NOT EXISTS btree_gist`,
  ],
  [
    "colonna generata start_minutes",
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS start_minutes integer
       GENERATED ALWAYS AS (
         substring(start_time from 1 for 2)::int * 60 + substring(start_time from 4 for 2)::int
       ) STORED`,
  ],
  [
    "colonna generata end_minutes",
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_minutes integer
       GENERATED ALWAYS AS (
         substring(end_time from 1 for 2)::int * 60 + substring(end_time from 4 for 2)::int
       ) STORED`,
  ],
  [
    "colonna generata lesson_key",
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS lesson_key text
       GENERATED ALWAYS AS (start_time || '-' || end_time) STORED`,
  ],
  [
    "vincolo bookings_no_overlap",
    `DO $$
     BEGIN
       IF NOT EXISTS (
         SELECT 1 FROM pg_constraint WHERE conname = 'bookings_no_overlap'
       ) THEN
         ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
           EXCLUDE USING gist (
             coach_id WITH =,
             location_id WITH =,
             date WITH =,
             int4range(start_minutes, end_minutes) WITH &&,
             lesson_key WITH <>
           )
           WHERE (status IN ('richiesta', 'confermata'));
       END IF;
     END $$`,
  ],
];

for (const [label, sql] of STEPS) {
  await pool.query(sql);
  console.log(`  ok  ${label}`);
}

const check = await pool.query(
  `select conname from pg_constraint where conname = 'bookings_no_overlap'`
);
console.log(
  check.rowCount ? "\nVincolo di non sovrapposizione attivo." : "\nATTENZIONE: vincolo assente."
);

await pool.end();
