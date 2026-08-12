/**
 * Controlli di integrità in SOLA LETTURA sul database configurato.
 * Utile prima di `npm run db:push` (verifica che i dati non violino i vincoli
 * che stanno per essere creati) e in qualunque momento dopo, come check.
 *
 *   npx dotenv -e .env.local -- npx tsx --tsconfig tsconfig.scripts.json \
 *     scripts/pre-migrazione-check.mts
 *
 * Non scrive nulla. Verifica che nessuno slot abbia più di una lezione singola
 * attiva e che nessun giocatore occupi due posti nella stessa lezione - le due
 * invarianti imposte dagli indici parziali su `bookings`.
 */
import { sql } from "drizzle-orm";
import { db } from "../src/lib/db/index.ts";

const host = (process.env.DATABASE_URL ?? "").match(/@([^/:?]+)/)?.[1] ?? "?";
console.log(`Database: ${host}\n`);

const conteggi = await db.execute(sql`
  SELECT
    (SELECT count(*) FROM users)               AS utenti,
    (SELECT count(*) FROM users WHERE clerk_id IS NULL) AS utenti_demo,
    (SELECT count(*) FROM bookings)            AS prenotazioni,
    (SELECT count(*) FROM bookings WHERE status IN ('richiesta','confermata')) AS prenotazioni_attive,
    (SELECT count(*) FROM coach_profiles)      AS profili_coach
`);
console.log("Stato attuale:");
console.table(conteggi.rows);

const singoleDoppie = await db.execute(sql`
  SELECT coach_id, location_id, date, start_time, count(*) AS quante
  FROM bookings
  WHERE status IN ('richiesta','confermata') AND type = 'singolo'
  GROUP BY 1,2,3,4 HAVING count(*) > 1
`);

const postiDoppi = await db.execute(sql`
  SELECT coach_id, location_id, date, start_time, player_id, count(*) AS quante
  FROM bookings
  WHERE status IN ('richiesta','confermata')
  GROUP BY 1,2,3,4,5 HAVING count(*) > 1
`);

const indici = await db.execute(sql`
  SELECT indexname FROM pg_indexes
  WHERE tablename IN ('bookings','coach_profiles') ORDER BY indexname
`);
console.log("\nIndici presenti ora:");
console.log(indici.rows.map((r) => `  ${r.indexname}`).join("\n"));

const colonna = await db.execute(sql`
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'coach_profiles' AND column_name = 'group_capacity'
`);
console.log(`\ngroup_capacity già presente: ${colonna.rows.length > 0 ? "sì" : "no"}`);

let bloccanti = 0;
if (singoleDoppie.rows.length > 0) {
  console.error("\nBLOCCANTE - slot con più di una lezione singola attiva:");
  console.table(singoleDoppie.rows);
  bloccanti++;
}
if (postiDoppi.rows.length > 0) {
  console.error("\nBLOCCANTE - stesso giocatore con due posti sullo stesso slot:");
  console.table(postiDoppi.rows);
  bloccanti++;
}

console.log(
  bloccanti === 0
    ? "\nNessun dato viola le invarianti sugli slot."
    : `\n${bloccanti} violazione/i da risolvere.`
);
process.exit(bloccanti === 0 ? 0 : 1);
