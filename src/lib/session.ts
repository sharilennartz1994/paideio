import "server-only";
import { randomUUID } from "node:crypto";
import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq, ne, or, isNull } from "drizzle-orm";
import { db } from "./db";
import { users, coachProfiles } from "./db/schema";

export type ClerkIdentity = {
  clerkId: string;
  email: string;
  /** Clerk ha verificato che l'indirizzo appartiene davvero a chi accede. */
  emailVerified: boolean;
  name: string;
};

/**
 * Trova la riga locale di un'identità Clerk, creandola al primo accesso.
 *
 * Estratta da `getCurrentUser()` per poterla provare senza Clerk: la logica di
 * collegamento è delicata e ha già prodotto un bug silenzioso (vedi sotto).
 * Test: `npm run test:identita`.
 */
export async function linkOrCreateLocalUser(identity: ClerkIdentity) {
  const byClerkId = await db.query.users.findFirst({
    where: eq(users.clerkId, identity.clerkId),
  });
  if (byClerkId) return byClerkId;

  // onConflictDoNothing + ri-select: se due richieste concorrenti provano a
  // creare lo stesso utente, una sola inserisce e entrambe rileggono la riga.
  // Senza `target` di proposito: le due richieste generano `id` diversi ma la
  // stessa email, quindi il conflitto arriva su `users_email_unique` e non su
  // `clerk_id`. Con un target mirato il secondo insert diventava un 500 al
  // primo accesso di ogni nuovo utente.
  await db
    .insert(users)
    .values({
      id: randomUUID(),
      clerkId: identity.clerkId,
      name: identity.name,
      email: identity.email,
      role: "player" as const,
      createdAt: new Date().toISOString(),
    })
    .onConflictDoNothing();

  const created = await db.query.users.findFirst({
    where: eq(users.clerkId, identity.clerkId),
  });
  if (created) return created;

  // Siamo qui perché l'insert è andato in conflitto su `users_email_unique`:
  // esiste già una riga con questa email, legata a un `clerk_id` diverso o a
  // nessuno. Prima questo caso finiva in silenzio — `onConflictDoNothing()`
  // ingoiava il conflitto e la ri-select per `clerk_id` tornava `null`, quindi
  // l'utente risultava autenticato su Clerk ma inesistente per l'app, con le
  // rotte protette che lo rimbalzavano in home senza spiegazioni. Capita a chi
  // ricrea l'account Clerk, e capitava sempre accedendo in locale con la riga
  // creata dall'istanza di produzione.
  //
  // La riga si adotta **solo se Clerk ha verificato l'indirizzo**: senza quel
  // controllo basterebbe registrarsi con l'email di qualcun altro per
  // prenderne il posto. Verificare l'indirizzo richiede accesso alla casella,
  // che è la stessa condizione necessaria per un recupero password: non apre
  // una strada nuova.
  if (!identity.emailVerified) {
    console.warn(
      `[session] email ${identity.email} già presente ma non verificata su Clerk: nessun collegamento.`
    );
    return null;
  }

  const [adopted] = await db
    .update(users)
    .set({ clerkId: identity.clerkId })
    .where(
      and(
        eq(users.email, identity.email),
        // Idempotente e sicuro rispetto alle richieste concorrenti.
        or(isNull(users.clerkId), ne(users.clerkId, identity.clerkId))
      )
    )
    .returning();

  if (adopted) {
    console.warn(
      `[session] riga ${adopted.id} ricollegata a ${identity.clerkId} tramite email verificata.`
    );
    return adopted;
  }

  // Una richiesta concorrente può averla adottata nel frattempo.
  return (
    (await db.query.users.findFirst({ where: eq(users.clerkId, identity.clerkId) })) ?? null
  );
}

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (existing) return existing;

  // Primo accesso di questo utente Clerk: creiamo il record locale (ruolo di
  // default "player"). Vedi becomeCoach() in actions/account.ts per l'upgrade.
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primary = clerkUser.primaryEmailAddress;
  const email = primary?.emailAddress ?? `${userId}@paideio.local`;
  const name = clerkUser.fullName?.trim() || clerkUser.username || email.split("@")[0];

  return linkOrCreateLocalUser({
    clerkId: userId,
    email,
    emailVerified: primary?.verification?.status === "verified",
    name,
  });
}

export async function getCurrentCoach() {
  const user = await getCurrentUser();
  if (!user || user.role !== "coach") return null;

  const profile = await db.query.coachProfiles.findFirst({
    where: eq(coachProfiles.userId, user.id),
  });
  return { user, profile };
}
