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
    .onConflictDoNothing({ target: users.clerkId });
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
