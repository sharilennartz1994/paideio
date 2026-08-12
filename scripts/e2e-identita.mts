/**
 * Test end-to-end del collegamento fra identità Clerk e riga locale.
 *
 * Copre il bug per cui un utente con email già presente nella tabella ma
 * `clerk_id` diverso risultava autenticato su Clerk e inesistente per l'app.
 *
 * Da lanciare SOLO contro un Postgres locale usa-e-getta:
 *
 *   docker run -d --name paideio-e2e -e POSTGRES_PASSWORD=paideio \
 *     -e POSTGRES_DB=paideio -p 55432:5432 postgres:17
 *   export DATABASE_URL='postgres://postgres:paideio@localhost:55432/paideio'
 *   npx drizzle-kit push --force
 *   npm run test:identita
 *   docker rm -f paideio-e2e
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "../src/lib/db/index.ts";
import { users } from "../src/lib/db/schema.ts";
import { linkOrCreateLocalUser } from "../src/lib/session.ts";

const url = process.env.DATABASE_URL ?? "";
if (!/localhost|127\.0\.0\.1/.test(url) || /neon\.tech/.test(url)) {
  console.error("RIFIUTO: DATABASE_URL deve puntare a un Postgres locale usa-e-getta.");
  process.exit(1);
}

let passed = 0;
async function check(name: string, fn: () => Promise<void>) {
  await fn();
  passed++;
  console.log(`  ok  ${name}`);
}

const EMAIL = `identita-${randomUUID().slice(0, 8)}@example.com`;
const created: string[] = [];

async function main() {
  console.log("\n1. Primo accesso: la riga si crea");
  const first = await linkOrCreateLocalUser({
    clerkId: "user_AAA",
    email: EMAIL,
    emailVerified: true,
    name: "Tester",
  });
  await check("utente creato con ruolo player", async () => {
    assert.ok(first, "doveva creare la riga");
    assert.equal(first.role, "player");
    assert.equal(first.clerkId, "user_AAA");
    created.push(first.id);
  });

  await check("accesso ripetuto restituisce la stessa riga", async () => {
    const again = await linkOrCreateLocalUser({
      clerkId: "user_AAA",
      email: EMAIL,
      emailVerified: true,
      name: "Tester",
    });
    assert.equal(again?.id, first!.id);
  });

  console.log("\n2. Stesso indirizzo, nuova identità Clerk (il bug)");
  const adopted = await linkOrCreateLocalUser({
    clerkId: "user_BBB",
    email: EMAIL,
    emailVerified: true,
    name: "Tester",
  });
  await check("la riga esistente viene ricollegata, non duplicata", async () => {
    assert.ok(adopted, "prima tornava null: utente invisibile all'app");
    assert.equal(adopted.id, first!.id, "deve essere la stessa riga, non una nuova");
    assert.equal(adopted.clerkId, "user_BBB");
  });
  await check("non nascono righe doppie con la stessa email", async () => {
    const rows = await db.query.users.findMany({ where: eq(users.email, EMAIL) });
    assert.equal(rows.length, 1);
  });
  await check("il ruolo e i dati preesistenti restano intatti", async () => {
    assert.equal(adopted!.role, first!.role);
    assert.equal(adopted!.createdAt, first!.createdAt);
  });

  console.log("\n3. Email non verificata: nessuna adozione");
  const intruder = await linkOrCreateLocalUser({
    clerkId: "user_CCC",
    email: EMAIL,
    emailVerified: false,
    name: "Malintenzionato",
  });
  await check("chi non ha verificato l'indirizzo non prende il posto", async () => {
    assert.equal(intruder, null);
    const row = await db.query.users.findFirst({ where: eq(users.email, EMAIL) });
    assert.equal(row?.clerkId, "user_BBB", "il collegamento non deve cambiare");
  });

  console.log("\n4. Riga senza identità (coach demo del seed)");
  const orphanEmail = `orfano-${randomUUID().slice(0, 8)}@example.com`;
  const orphanId = randomUUID();
  await db.insert(users).values({
    id: orphanId,
    clerkId: null,
    name: "Coach Demo",
    email: orphanEmail,
    role: "coach",
    createdAt: new Date().toISOString(),
  });
  created.push(orphanId);
  const claimed = await linkOrCreateLocalUser({
    clerkId: "user_DDD",
    email: orphanEmail,
    emailVerified: true,
    name: "Vero Coach",
  });
  await check("una riga mai collegata viene adottata mantenendo il ruolo coach", async () => {
    assert.equal(claimed?.id, orphanId);
    assert.equal(claimed?.role, "coach", "il ruolo non deve essere degradato a player");
  });

  console.log("\nPulizia...");
  await db.delete(users).where(inArray(users.id, created));
  console.log(`\n${passed} verifiche superate.`);
}

main().then(
  () => process.exit(0),
  async (e) => {
    console.error("\nFALLITO:", e);
    process.exit(1);
  }
);
