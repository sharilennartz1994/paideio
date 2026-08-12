# Email istituzionale Paideio

Il dominio posseduto dal progetto è `playpaideio.com`; l’indirizzo corretto è
quindi `info@playpaideio.com`. `paideio.com` non è disponibile e non va usato
nelle interfacce o nelle configurazioni.

## Cosa manda email oggi

| Flusso | Destinatario | Mittente | Variabili richieste |
| --- | --- | --- | --- |
| Form proposte/bug di `/prossime-release` | `FEEDBACK_RECIPIENT_EMAIL` | `feedback@playpaideio.com` | `RESEND_API_KEY` + `FEEDBACK_RECIPIENT_EMAIL` |
| Nuova richiesta di lezione | il coach interessato (`users.email`) | `notifiche@playpaideio.com` | `RESEND_API_KEY` |

Entrambi passano dallo stesso trasporto, `src/lib/email/index.ts`: chiamata
`fetch` all’API HTTP di Resend, nessun SDK, timeout di 5 secondi, esito
`"inviata" | "saltata" | "fallita"` e mai un’eccezione verso il chiamante.
**Senza `RESEND_API_KEY` l’applicazione si comporta esattamente come prima**:
l’invio ritorna `"saltata"`, non viene loggato niente di allarmistico e
nessun flusso cambia comportamento.

## Notifica al coach di una nuova richiesta

`src/lib/email/booking-request.ts` compone il messaggio (chi ha prenotato,
quando, dove, tipo di lezione, livello, eventuali note) con il link diretto a
`/coach-admin/richieste`, dove il coach accetta o rifiuta.

- L’invio parte **dopo** il commit della prenotazione, fuori dalla transazione:
  un errore di posta non può annullare o lasciare a metà una prenotazione già
  salvata. Le notifiche in-app restano la fonte primaria.
- Non blocca la risposta: la promessa viene affidata a `waitUntil()` di
  `@vercel/functions`, che tiene vivo il runtime Fluid Compute il tempo
  dell’invio senza allungare il percorso della richiesta.
- Ogni fallimento finisce in `console.error` (log della funzione Vercel).
- L’`Idempotency-Key` è `booking-request-<bookingId>`: una sola email per
  prenotazione anche se l’azione viene rieseguita.

Test senza database e senza posta vera: `npm run test:email`.

### Variabili d’ambiente

| Variabile | Obbligatoria | Default | Note |
| --- | --- | --- | --- |
| `RESEND_API_KEY` | sì, per inviare | — | Assente ⇒ nessuna email, app invariata |
| `EMAIL_FROM` | no | `Paideio <notifiche@playpaideio.com>` | Il dominio deve essere verificato su Resend |
| `NEXT_PUBLIC_SITE_URL` | no | `https://playpaideio.com` | Usata per i link assoluti; su Vercel ricade su `VERCEL_PROJECT_PRODUCTION_URL` |
| `FEEDBACK_RECIPIENT_EMAIL` | solo per il form feedback | — | Vedi sotto |

In sviluppo locale **non impostare `RESEND_API_KEY`**, così nessuna email parte
davvero mentre si prova il flusso di prenotazione.

## Due servizi, due responsabilità

1. Un provider di posta deve creare la casella o l’alias
   `info@playpaideio.com` e ricevere la posta tramite record MX.
2. Resend invia dal form del sito una notifica al destinatario configurato.
   Non sostituisce necessariamente una casella email tradizionale.

## Configurazione consigliata

1. Scegliere il provider della casella e creare `info@playpaideio.com` come
   mailbox oppure alias verso un indirizzo esistente.
2. Aggiungere al DNS Vercel i record MX e di verifica forniti dal provider.
3. Installare Resend dal Marketplace Vercel:

   ```bash
   vercel integration add resend
   ```

4. Verificare `playpaideio.com` su Resend aggiungendo i record SPF/DKIM
   richiesti.
5. Impostare `FEEDBACK_RECIPIENT_EMAIL=info@playpaideio.com` negli ambienti
   Development e Production. `RESEND_API_KEY` viene normalmente creato
   dall’integrazione Marketplace.
6. Eseguire un invio di prova dal form `/prossime-release` e verificare
   consegna e Reply-To.

Il form è già resiliente: salva prima il feedback in `product_feedback` e
prova poi l’invio. Un problema temporaneo di posta non perde la richiesta.
