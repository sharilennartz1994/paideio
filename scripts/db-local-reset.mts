/**
 * Azzera lo schema del Postgres di sviluppo prima di ripubblicarlo.
 *
 * Serve perché `drizzle-kit push` su un database che ha già le tabelle apre un
 * **prompt interattivo** per decidere se una colonna nuova sia in realtà la
 * rinomina di una esistente. Senza TTY il comando fallisce, e dentro una catena
 * `&&` il fallimento passava inosservato: il seed partiva comunque e si
 * schiantava su una colonna mancante. Su uno schema vuoto non c'è niente da
 * disambiguare e `push --force` va liscio.
 *
 * Rifiuta di partire se `DATABASE_URL` non è locale: questo script cancella
 * tutto, e non deve mai poterlo fare su Neon.
 */
import { Pool } from "pg";

const url = process.env.DATABASE_URL ?? "";
if (!/localhost|127\.0\.0\.1/.test(url) || /neon\.tech/.test(url)) {
  console.error("RIFIUTO: db:local:reset cancella lo schema, DATABASE_URL deve essere locale.");
  console.error(`Ricevuto: ${url.replace(/:[^:@]*@/, ":***@")}`);
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
await pool.query("DROP SCHEMA public CASCADE");
await pool.query("CREATE SCHEMA public");
console.log("Schema azzerato.");
await pool.end();
