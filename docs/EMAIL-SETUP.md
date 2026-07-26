# Email istituzionale Paideio

Il dominio posseduto dal progetto è `playpaideio.com`; l’indirizzo corretto è
quindi `info@playpaideio.com`. `paideio.com` non è disponibile e non va usato
nelle interfacce o nelle configurazioni.

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
