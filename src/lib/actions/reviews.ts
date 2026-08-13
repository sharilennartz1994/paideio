"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, reviews } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { toLocalDateString, canReviewBooking } from "@/lib/constants";
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
  const today = toLocalDateString(new Date());
  const existing = await db.query.reviews.findFirst({ where: eq(reviews.bookingId, input.bookingId) });

  // Stesso predicato che decide se mostrare il form in `/prenotazioni`
  // (`getBookingsForPlayer`): un solo cancello, messaggio specifico sul motivo.
  if (!canReviewBooking(booking, today, Boolean(existing))) {
    if (booking.status !== "confermata") return err("Puoi recensire solo lezioni confermate.");
    if (booking.date > today) return err("Potrai lasciare una recensione dopo la lezione.");
    return err("Hai già recensito questa lezione.");
  }

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
