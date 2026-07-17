"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, coachProfiles } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";

export async function becomeCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Devi accedere per diventare coach.");

  if (user.role !== "coach") {
    // Transazione sincrona (driver better-sqlite3): ruolo + profilo insieme.
    // onConflictDoNothing rende l'operazione ripetibile se un tentativo
    // precedente fosse fallito a metà lasciando il profilo già creato.
    db.transaction((tx) => {
      tx.update(users).set({ role: "coach" }).where(eq(users.id, user.id)).run();
      tx.insert(coachProfiles)
        .values({
          userId: user.id,
          bio: "",
          levels: "[]",
          trainingTypes: "[]",
        })
        .onConflictDoNothing()
        .run();
    });
  }

  redirect("/coach-admin/profilo");
}
