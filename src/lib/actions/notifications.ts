"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { type ActionResult, err, ok } from "@/lib/action-result";

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return err("Non autenticato.");

  await db
    .update(notifications)
    .set({ readAt: new Date().toISOString() })
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));

  revalidatePath("/notifiche");
  revalidatePath("/", "layout");
  return ok(undefined);
}
