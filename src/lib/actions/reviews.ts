"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, reviews } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { toLocalDateString } from "@/lib/constants";
import { type ActionResult, ok, err } from "@/lib/action-result";

export async function createReview(input: {
  bookingId: string;
  rating: number;
  comment?: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "player") return err("Devi accedere come giocatore.");

  const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, input.bookingId) });
  if (!booking || booking.playerId !== user.id) return err("Prenotazione non trovata.");
  if (booking.status !== "confermata") return err("Puoi recensire solo lezioni confermate.");

  const today = toLocalDateString(new Date());
  if (booking.date > today) return err("Potrai lasciare una recensione dopo la lezione.");

  const existing = await db.query.reviews.findFirst({ where: eq(reviews.bookingId, input.bookingId) });
  if (existing) return err("Hai già recensito questa lezione.");

  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return err("Voto non valido.");
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
  return ok(undefined);
}
