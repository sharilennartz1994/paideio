import "server-only";

/**
 * Trasporto email condiviso del prodotto.
 *
 * Regole non negoziabili, valide per ogni chiamante:
 * - l'invio è **best-effort**: `sendEmail()` non lancia mai, ritorna un esito.
 *   Nessun flusso applicativo deve fallire perché la posta non è partita;
 * - senza `RESEND_API_KEY` l'app funziona esattamente come prima e l'esito è
 *   `"saltata"` (nessun errore, nessun log allarmistico);
 * - ogni fallimento reale finisce in `console.error`, così resta nei log della
 *   funzione Vercel.
 *
 * Il provider è Resend, chiamato via `fetch` sull'API HTTP (nessun SDK): è lo
 * stesso approccio già usato dal form feedback di `/prossime-release`.
 */

export type EmailMessage = {
  to: string[];
  subject: string;
  text: string;
  replyTo?: string;
  /** Evita duplicati se la stessa azione viene rieseguita (retry, doppio submit). */
  idempotencyKey?: string;
};

export type EmailDeliveryOutcome = "inviata" | "saltata" | "fallita";

/** Firma iniettabile: i test passano un finto trasporto e ispezionano il messaggio. */
export type EmailTransport = (message: EmailMessage) => Promise<EmailDeliveryOutcome>;

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Paideio <notifiche@playpaideio.com>";
const DEFAULT_SITE_URL = "https://playpaideio.com";

/**
 * L'invio vive dentro una Server Action su Fluid Compute: un provider lento non
 * deve tenere in ostaggio l'invocazione. Oltre questa soglia si abbandona.
 */
const SEND_TIMEOUT_MS = 5_000;

/** Mittente. Il dominio deve essere verificato su Resend (vedi docs/EMAIL-SETUP.md). */
export function emailSender(): string {
  return process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** URL assoluto verso il sito, per i link dentro alle email. */
export function absoluteUrl(path: string): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const base = explicit
    ? explicit.replace(/\/+$/, "")
    : vercel
      ? `https://${vercel.replace(/\/+$/, "")}`
      : DEFAULT_SITE_URL;
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

export async function sendEmail(message: EmailMessage): Promise<EmailDeliveryOutcome> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const recipients = message.to.map((address) => address.trim()).filter(Boolean);

  // Configurazione assente o nessun destinatario: non è un errore, è un canale
  // spento. L'app deve comportarsi come se l'email non esistesse.
  if (!apiKey || recipients.length === 0) return "saltata";

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(message.idempotencyKey ? { "Idempotency-Key": message.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: emailSender(),
        to: recipients,
        subject: message.subject,
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[email] invio rifiutato dal provider", {
        status: response.status,
        subject: message.subject,
        detail: detail.slice(0, 500),
      });
      return "fallita";
    }

    return "inviata";
  } catch (error) {
    console.error("[email] invio fallito", { subject: message.subject, error });
    return "fallita";
  }
}
