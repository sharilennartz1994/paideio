"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import {
  rejectBookingWithReason as rejectCore,
  proposeBookingTime as proposeCore,
  acceptBookingProposal as acceptCore,
  declineBookingProposal as declineCore,
} from "@/lib/booking-proposals";
import { type ActionResult, err } from "@/lib/action-result";

/**
 * Server Action delle proposte di orario.
 *
 * File separato da `actions/bookings.ts` di proposito: quel file è la
 * prenotazione (creazione e cambi di stato secchi), questo è la trattativa fra
 * coach e giocatore. La logica vera sta in `lib/booking-proposals.ts`, che il
 * test end-to-end può chiamare senza sessione Clerk.
 */

/** Le stesse superfici che tocca una prenotazione: stato e notifiche cambiano. */
function revalidateBookingSurfaces() {
  revalidatePath("/prenotazioni");
  revalidatePath("/coach-admin");
  revalidatePath("/coach-admin/richieste");
  revalidatePath("/notifiche");
  revalidatePath("/", "layout");
}

export async function rejectBookingRequest(input: {
  bookingId: string;
  reason: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "coach") return err("Devi accedere come coach.");

  const result = await rejectCore({
    bookingId: input.bookingId,
    coachId: user.id,
    reason: input.reason,
  });
  if (result.ok) revalidateBookingSurfaces();
  return result;
}

export async function proposeBookingTime(input: {
  bookingId: string;
  date: string;
  startTime: string;
  endTime: string;
  message: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "coach") return err("Devi accedere come coach.");

  const result = await proposeCore({ ...input, coachId: user.id });
  if (result.ok) revalidateBookingSurfaces();
  return result;
}

export async function acceptBookingProposal(
  bookingId: string
): Promise<ActionResult<{ coachId: string; date: string; startTime: string; endTime: string }>> {
  const user = await getCurrentUser();
  if (!user || user.role !== "player") return err("Devi accedere come giocatore.");

  const result = await acceptCore({ bookingId, playerId: user.id });
  if (result.ok) {
    revalidateBookingSurfaces();
    // La lezione ora occupa davvero il campo: il calendario pubblico del coach
    // deve smettere di offrire quell'orario.
    revalidatePath(`/coach/${result.data.coachId}`);
    revalidatePath("/coach-admin/orari");
  }
  return result;
}

export async function declineBookingProposal(bookingId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "player") return err("Devi accedere come giocatore.");

  const result = await declineCore({ bookingId, playerId: user.id });
  if (result.ok) revalidateBookingSurfaces();
  return result;
}
