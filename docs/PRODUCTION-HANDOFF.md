# Paideio — production handoff

Ultimo aggiornamento: 26 luglio 2026.

## Stato del rilascio

- URL principale: <https://playpaideio.com>
- Alias Vercel: <https://paideio.vercel.app>
- Hosting: Vercel, progetto `sharilennartz1994s-projects/paideio`
- Database: Postgres Neon
- Autenticazione: Clerk production su `playpaideio.com`
- Dati demo: rimossi dal database condiviso il 26 luglio 2026

Il database contiene un solo account Clerk reale e nessun utente demo,
booking, recensione, preferito, notifica o feedback di test al momento
dell’handoff.

## Architettura operativa

- Next.js 16 App Router su Vercel Fluid Compute.
- `pg.Pool` a module scope e `attachDatabasePool()` in
  `src/lib/db/index.ts`.
- Drizzle schema in `src/lib/db/schema.ts`.
- Clerk crea la riga locale al primo accesso tramite provisioning lazy.
- Le route pubbliche sono consultabili senza autenticazione; dashboard coach
  e prenotazioni hanno guard server-side.
- Le Server Action restituiscono `ActionResult`, evitando `throw` per gli
  errori attesi che Next oscurerebbe in produzione.

## Variabili d’ambiente

Non inserire valori nei file Markdown o nel repository. Gli ambienti
richiedono almeno:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `BLOB_READ_WRITE_TOKEN`

Feedback email opzionale:

- `RESEND_API_KEY`
- `FEEDBACK_RECIPIENT_EMAIL`

Vedi `docs/EMAIL-SETUP.md`. Usare indirizzi istituzionali
`@playpaideio.com`.

## Procedura di rilascio

```bash
npm install
npx tsc --noEmit
npm run lint
npm run build
git push
vercel --prod
```

Dopo il deploy verificare:

1. `/`, `/cerca`, `/chi-siamo`, `/academy`, `/prossime-release`;
2. login e registrazione Clerk;
3. ricerca coach e profilo;
4. richiesta e annullamento prenotazione;
5. notifiche player/coach;
6. dashboard coach, campi, orari e richieste;
7. modalità giorno/notte e viewport 320 px;
8. console del browser senza errori applicativi.

## Database e dati demo

**Locale e produzione condividono ancora lo stesso database Neon.**

`npm run db:seed` elimina e ricrea gli utenti con `clerk_id IS NULL`, ma
pubblica quei dati anche in produzione. Non eseguirlo durante verifiche
ordinarie. La priorità infrastrutturale è creare un branch Neon dedicato a
sviluppo e preview.

La pulizia sicura dei dati demo usa esclusivamente:

```sql
DELETE FROM users WHERE clerk_id IS NULL;
```

Le foreign key rimuovono in cascade i dati demo collegati. Non eseguire mai
una cancellazione globale della tabella `users`.

## Rollback

Codice:

1. individuare il deployment precedente nella dashboard Vercel;
2. promuoverlo nuovamente oppure eseguire un deploy del commit stabile;
3. verificare Clerk e connessione Neon.

Database:

- non correggere incidenti con cancellazioni manuali improvvisate;
- usare il restore point-in-time/branch di Neon;
- validare il ripristino prima di riportarlo in produzione.

## Limitazioni note e priorità

1. Separare Neon sviluppo/preview dalla produzione.
2. Collegare definitivamente GitHub a Vercel per deploy automatici.
3. Definire pagamenti, rimborsi e policy di cancellazione.
4. Completare configurazione email istituzionale e notifiche evolute.
5. Implementare PWA e installabilità.
6. Aggiungere magic-byte validation e pulizia del blob avatar precedente.
7. Aggiungere constraint DB (`rating`, giorni, intervalli orari).

## Schema: capienza lezioni di gruppo

Applicata a Neon il 26 luglio 2026 con `npm run db:push`, a database vuoto
(1 account Clerk reale, 0 prenotazioni, 0 profili coach). Verificata dopo
l'esecuzione:

- `coach_profiles.group_capacity` — integer, `NOT NULL`, default `4`;
- `bookings_active_slot_idx` eliminato, sostituito da
  `bookings_active_single_slot_idx` (una sola lezione singola attiva per slot)
  e `bookings_active_player_slot_idx` (un giocatore, un posto per lezione).

La capienza di gruppo non è imposta da un indice: la serializza
`pg_advisory_xact_lock` dentro `createBooking`. Vedi AGENTS.md, sezione
"Capienza slot e prenotabilità".

Controllo di integrità riutilizzabile, in sola lettura:

```bash
npx dotenv -e .env.local -- npx tsx --tsconfig tsconfig.scripts.json \
  scripts/check-integrita-slot.mts
```

## Warning infrastrutturale noto

`pg-connection-string` segnala che in una futura major release i valori
`sslmode=prefer`, `require` e `verify-ca` seguiranno la semantica libpq.
Prima di aggiornare a `pg` 9 / `pg-connection-string` 3, impostare
esplicitamente `sslmode=verify-full` nella connection string Neon se si vuole
mantenere la verifica TLS attuale. Oggi è un warning preventivo e non un
errore di connessione.

## Regole di manutenzione

- Testi UI in italiano.
- Date giorno con `toLocalDateString()`, mai tramite slicing ISO.
- Componenti Base UI polimorfici: `render={<Link />}` e
  `nativeButton={false}`, non `asChild`.
- Token `game-*` solo su superfici fisse (chrome e sezioni arena); su
  `carta`/`carta-alta`/`carta-bassa` usare `accent-*-ink` anche per bordi,
  indicatori e riempimenti. Verificare ogni nuova pagina in entrambi i temi.
- Ogni voce aggiunta alla sidebar desktop va aggiunta anche allo sheet
  "Altro" della bottom nav mobile.
- Non importare `src/lib/queries.ts` nei Client Component.
- Aggiornare insieme `AGENTS.md`,
  `.claude/skills/paideio-dev/SKILL.md` e questo documento quando cambia
  un’area architetturale o operativa.
