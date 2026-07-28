/**
 * Ripristina un backup JSON prodotto da `scripts/db-dump.mts` nel database
 * indicato da DATABASE_URL.
 *
 *   DATABASE_URL='postgres://…' npx tsx --tsconfig tsconfig.scripts.json \
 *     scripts/db-restore.mts .backup/neon-us-east-1-<stamp>.json
 *
 * Lo schema deve già esistere (`npm run db:push`). Le tabelle sono inserite
 * nell'ordine delle dipendenze e ogni riga usa `onConflictDoNothing`, quindi
 * rilanciarlo è sicuro.
 *
 * Rifiuta di scrivere su un database che contiene già utenti, a meno di
 * passare --force: evita di sovrascrivere per errore un ambiente vivo.
 */
import { readFileSync } from "node:fs";
import { sql } from "drizzle-orm";
import { db } from "../src/lib/db/index.ts";

// Ordine di inserimento: una tabella non può precedere quelle che referenzia.
const ORDINE = [
  "users",
  "coach_profiles",
  "locations",
  "availability_slots",
  "bookings",
  "reviews",
  "favorites",
  "notifications",
  "product_feedback",
] as const;

const file = process.argv[2];
const force = process.argv.includes("--force");

if (!file) {
  console.error("Uso: db-restore.mts <file-backup.json> [--force]");
  process.exit(1);
}

const host = (process.env.DATABASE_URL ?? "").match(/@([^/:?]+)/)?.[1] ?? "?";
const dati = JSON.parse(readFileSync(file, "utf8")) as Record<
  string,
  Array<Record<string, unknown>>
>;

console.log(`Backup:      ${file}`);
console.log(`Destinazione: ${host}\n`);

const esistenti = await db.execute(sql`SELECT count(*)::int AS n FROM users`);
const utentiPresenti = Number((esistenti.rows[0] as { n: number }).n);
if (utentiPresenti > 0 && !force) {
  console.error(
    `RIFIUTO: la destinazione contiene già ${utentiPresenti} utenti.\n` +
      "Se è davvero quello che vuoi, rilancia con --force."
  );
  process.exit(1);
}

let totale = 0;
for (const tabella of ORDINE) {
  const righe = dati[tabella] ?? [];
  if (righe.length === 0) {
    console.log(`  ${tabella.padEnd(22)} —`);
    continue;
  }

  for (const riga of righe) {
    const colonne = Object.keys(riga);
    const identificatori = sql.join(
      colonne.map((c) => sql.identifier(c)),
      sql`, `
    );
    const valori = sql.join(
      colonne.map((c) => sql`${riga[c]}`),
      sql`, `
    );
    await db.execute(
      sql`INSERT INTO ${sql.identifier(tabella)} (${identificatori}) VALUES (${valori}) ON CONFLICT DO NOTHING`
    );
  }

  totale += righe.length;
  console.log(`  ${tabella.padEnd(22)} ${righe.length} righe`);
}

console.log(`\n${totale} righe ripristinate.`);
process.exit(0);
