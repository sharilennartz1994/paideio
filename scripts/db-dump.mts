/**
 * Esporta tutte le tabelle del database indicato da DATABASE_URL in un JSON,
 * ripristinabile con `scripts/db-restore.mts`.
 *
 *   npx dotenv -e .env.local -- npx tsx --tsconfig tsconfig.scripts.json \
 *     scripts/db-dump.mts > .backup/neon-$(date +%Y%m%d-%H%M).json
 *
 * `.backup/` è escluso dal repo: i dump contengono dati personali reali.
 */
import { sql } from "drizzle-orm";
import { db } from "../src/lib/db/index.ts";

const TABELLE = [
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

const out: Record<string, unknown[]> = {};
for (const tabella of TABELLE) {
  const r = await db.execute(sql`SELECT * FROM ${sql.identifier(tabella)}`);
  out[tabella] = r.rows;
}

// Su stdout, così si reindirizza su file; i log diagnostici vanno su stderr.
console.log(JSON.stringify(out, null, 2));
console.error(
  Object.entries(out)
    .map(([k, v]) => `  ${k.padEnd(22)} ${v.length}`)
    .join("\n")
);
process.exit(0);
