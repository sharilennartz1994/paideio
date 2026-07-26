"use server";

import { randomUUID } from "node:crypto";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { productFeedback } from "@/lib/db/schema";
import { type ActionResult, err, ok } from "@/lib/action-result";

const MAX_MESSAGE_LENGTH = 1500;
const MAX_DAILY_SUBMISSIONS = 5;
const CATEGORIES = ["nuova_feature", "miglioramento", "bug", "altro"] as const;

type FeedbackCategory = (typeof CATEGORIES)[number];

async function notifyTeam(input: {
  id: string;
  name: string;
  email: string;
  category: FeedbackCategory;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.FEEDBACK_RECIPIENT_EMAIL;
  if (!apiKey || !recipient) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `product-feedback-${input.id}`,
      },
      body: JSON.stringify({
        from: "Paideio <feedback@playpaideio.com>",
        to: [recipient],
        reply_to: input.email,
        subject: `[Paideio] ${input.category.replaceAll("_", " ")} da ${input.name}`,
        text: [
          `Categoria: ${input.category}`,
          `Nome: ${input.name}`,
          `Email: ${input.email}`,
          "",
          input.message,
        ].join("\n"),
      }),
    });
  } catch {
    // Il feedback è già persistito: un errore email non deve far credere
    // all’utente che il contributo sia andato perso.
  }
}

export async function submitProductFeedback(
  _previousState: ActionResult<{ submissionId: string }> | null,
  formData: FormData
): Promise<ActionResult<{ submissionId: string }>> {
  const honeypot = String(formData.get("company") ?? "");
  if (honeypot) return ok({ submissionId: randomUUID() });

  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 160);
  const category = String(formData.get("category") ?? "") as FeedbackCategory;
  const message = String(formData.get("message") ?? "").trim().slice(0, MAX_MESSAGE_LENGTH);

  if (name.length < 2) return err("Inserisci il tuo nome.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err("Inserisci un indirizzo email valido.");
  if (!CATEGORIES.includes(category)) return err("Scegli il tipo di richiesta.");
  if (message.length < 15) return err("Raccontaci la richiesta con almeno 15 caratteri.");

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const recent = await db.query.productFeedback.findMany({
    where: and(eq(productFeedback.email, email), gte(productFeedback.createdAt, since.toISOString())),
    columns: { id: true },
  });
  if (recent.length >= MAX_DAILY_SUBMISSIONS) {
    return err("Hai già inviato diverse richieste oggi. Riprova domani.");
  }

  const id = randomUUID();
  const record = {
    id,
    name,
    email,
    category,
    message,
    status: "nuovo" as const,
    createdAt: new Date().toISOString(),
  };
  await db.insert(productFeedback).values(record);
  await notifyTeam({ id, name, email, category, message });

  return ok({ submissionId: id });
}
