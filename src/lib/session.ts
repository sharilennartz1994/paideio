import "server-only";
import { randomUUID } from "node:crypto";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, coachProfiles } from "./db/schema";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (existing) return existing;

  // Primo accesso di questo utente Clerk: creiamo il record locale (ruolo di
  // default "player"). Vedi becomeCoach() in actions/account.ts per l'upgrade.
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.primaryEmailAddress?.emailAddress ?? `${userId}@paideio.local`;
  const name = clerkUser.fullName?.trim() || clerkUser.username || email.split("@")[0];

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
      clerkId: userId,
      name,
      email,
      role: "player" as const,
      createdAt: new Date().toISOString(),
    })
    .onConflictDoNothing();
  return (await db.query.users.findFirst({ where: eq(users.clerkId, userId) })) ?? null;
}

export async function getCurrentCoach() {
  const user = await getCurrentUser();
  if (!user || user.role !== "coach") return null;

  const profile = await db.query.coachProfiles.findFirst({
    where: eq(coachProfiles.userId, user.id),
  });
  return { user, profile };
}
