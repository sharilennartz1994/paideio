"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, reviews } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { toLocalDateString } from "@/lib/constants";

export async function createReview(input: { bookingId: string; rating: number; comment?: string }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "player") throw new Error("Devi accedere come giocatore.");

  const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, input.bookingId) });
  if (!booking || booking.playerId !== user.id) throw new Error("Prenotazione non trovata.");
  if (booking.status !== "confermata") throw new Error("Puoi recensire solo lezioni confermate.");

  const today = toLocalDateString(new Date());
  if (booking.date > today) throw new Error("Potrai lasciare una recensione dopo la lezione.");

  const existing = await db.query.reviews.findFirst({ where: eq(reviews.bookingId, input.bookingId) });
  if (existing) throw new Error("Hai già recensito questa lezione.");

  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    throw new Error("Voto non valido.");
  }

  await db.insert(reviews).values({
    id: randomUUID(),
    bookingId: input.bookingId,
    playerId: user.id,
    coachId: booking.coachId,
    rating: input.rating,
    comment: input.comment?.trim() ?? "",
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/prenotazioni");
  revalidatePath(`/coach/${booking.coachId}`);
  revalidatePath("/cerca");
}
