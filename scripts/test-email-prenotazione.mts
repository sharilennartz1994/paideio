/**
 * Verifica la notifica email al coach alla creazione di una prenotazione.
 *
 *   npm run test:email
 *
 * Non tocca il database e non manda posta vera: ispeziona il messaggio
 * costruito da `buildBookingRequestEmail()` e usa un trasporto finto per
 * controllare che senza `RESEND_API_KEY` non parta nulla.
 * Esce con codice 1 se una verifica fallisce.
 */
import assert from "node:assert/strict";
import { buildBookingRequestEmail } from "../src/lib/email/booking-request.ts";
import { sendEmail, emailSender, isEmailConfigured, absoluteUrl } from "../src/lib/email/index.ts";

let passed = 0;
async function check(name: string, fn: () => void | Promise<void>) {
  await fn();
  passed++;
  console.log(`  ok  ${name}`);
}

const base = {
  bookingId: "b-123",
  coachName: "Elena Ferraro",
  coachEmail: "elena@example.com",
  playerName: "Marco Rossi",
  date: "2026-08-17",
  startTime: "18:00",
  endTime: "19:00",
  type: "singolo" as const,
  level: "intermedio",
  notes: "",
  locationName: "Padel Club Navigli",
  locationAddress: "Via Roma 1",
  locationCity: "Milano",
};

console.log("Notifica email prenotazione");

await check("il messaggio contiene chi, quando, dove, tipo e livello", () => {
  const message = buildBookingRequestEmail(base);
  assert.deepEqual(message.to, ["elena@example.com"]);
  assert.match(message.subject, /Marco Rossi/);
  assert.match(message.text, /Elena Ferraro/);
  assert.match(message.text, /lunedì 17 agosto 2026, 18:00-19:00/);
  assert.match(message.text, /Padel Club Navigli, Via Roma 1, Milano/);
  assert.match(message.text, /Tipo: lezione singola/);
  assert.match(message.text, /Livello: intermedio/);
});

await check("il messaggio linka la pagina richieste in modo assoluto", () => {
  const message = buildBookingRequestEmail(base);
  assert.ok(message.text.includes(absoluteUrl("/coach-admin/richieste")));
  assert.match(message.text, /^https:\/\/.+\/coach-admin\/richieste$/m);
});

await check("le note del giocatore compaiono solo se ci sono", () => {
  assert.doesNotMatch(buildBookingRequestEmail(base).text, /Note del giocatore/);
  const conNote = buildBookingRequestEmail({ ...base, notes: "  Sono mancino  " });
  assert.match(conNote.text, /Note del giocatore: Sono mancino/);
});

await check("una lezione di gruppo è etichettata come tale", () => {
  assert.match(buildBookingRequestEmail({ ...base, type: "gruppo" }).text, /Tipo: lezione di gruppo/);
});

await check("un campo mancante non produce un buco nel testo", () => {
  const message = buildBookingRequestEmail({
    ...base,
    locationName: null,
    locationAddress: null,
    locationCity: null,
  });
  assert.match(message.text, /Dove: Campo da confermare/);
});

await check("la chiave di idempotenza è legata alla prenotazione", () => {
  assert.equal(buildBookingRequestEmail(base).idempotencyKey, "booking-request-b-123");
});

await check("senza RESEND_API_KEY l'invio è saltato, non fallito", async () => {
  const previous = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  try {
    assert.equal(isEmailConfigured(), false);
    assert.equal(await sendEmail(buildBookingRequestEmail(base)), "saltata");
  } finally {
    if (previous !== undefined) process.env.RESEND_API_KEY = previous;
  }
});

await check("con la chiave ma senza destinatario l'invio è saltato", async () => {
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "re_finta_per_test";
  try {
    assert.equal(await sendEmail({ ...buildBookingRequestEmail(base), to: ["  "] }), "saltata");
  } finally {
    if (previous === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous;
  }
});

await check("il mittente sta sul dominio del progetto", () => {
  const previous = process.env.EMAIL_FROM;
  delete process.env.EMAIL_FROM;
  try {
    assert.match(emailSender(), /@playpaideio\.com>$/);
  } finally {
    if (previous !== undefined) process.env.EMAIL_FROM = previous;
  }
});

console.log(`\n${passed} verifiche superate.`);
