"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, coachProfiles } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { type ActionResult, err } from "@/lib/action-result";

export async function becomeCoach(_prevState: ActionResult | null): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return err("Devi accedere per diventare coach.");

  if (user.role !== "coach") {
    // Ruolo + profilo insieme in transazione. onConflictDoNothing rende
    // l'operazione ripetibile se un tentativo precedente fosse fallito a
    // metà lasciando il profilo già creato.
    await db.transaction(async (tx) => {
      await tx.update(users).set({ role: "coach" }).where(eq(users.id, user.id));
      await tx
        .insert(coachProfiles)
        .values({
          userId: user.id,
          bio: "",
          levels: "[]",
          trainingTypes: "[]",
        })
        .onConflictDoNothing();
    });
  }

  redirect("/coach-admin/profilo");
}
