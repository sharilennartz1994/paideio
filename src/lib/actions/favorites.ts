"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { favorites } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";

export async function toggleFavorite(coachId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || user.role !== "player") throw new Error("Devi accedere come giocatore.");

  const existing = await db.query.favorites.findFirst({
    where: and(eq(favorites.playerId, user.id), eq(favorites.coachId, coachId)),
  });

  let isFavorite: boolean;
  if (existing) {
    await db.delete(favorites).where(eq(favorites.id, existing.id));
    isFavorite = false;
  } else {
    await db.insert(favorites).values({
      id: randomUUID(),
      playerId: user.id,
      coachId,
      createdAt: new Date().toISOString(),
    });
    isFavorite = true;
  }

  revalidatePath("/cerca");
  revalidatePath(`/coach/${coachId}`);
  revalidatePath("/preferiti");
  return isFavorite;
}
