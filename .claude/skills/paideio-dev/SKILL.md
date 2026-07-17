---
name: paideio-dev
description: Avvia l'ambiente di sviluppo di Paideio (reset+seed del database, dev server) e riepiloga le convenzioni correnti del progetto. Usare all'inizio di una sessione di lavoro su Paideio, o quando serve un promemoria sulle scelte architetturali già prese.
---

# Paideio — dev workflow e convenzioni

Questa skill ha due scopi: (1) avviare rapidamente l'ambiente locale, (2) tenere le
sessioni di sviluppo coerenti con le decisioni già prese sul progetto. Le convenzioni
qui sotto sono uno specchio di `AGENTS.md` (root del repo, sempre caricato in
contesto) — se noti una discrepanza tra questa skill e `AGENTS.md`, **AGENTS.md
vince** ed è il file da correggere.

## Avvio rapido

```bash
npm run db:seed   # azzera e ripopola il database demo (Postgres/Neon, non più SQLite)
npm run dev        # avvia il dev server (porta 3000, o la prima libera)
```

**Attenzione**: sviluppo locale e produzione (https://paideio.vercel.app)
condividono lo stesso database Neon — `npm run db:seed` scrive anche in
quello che vedono gli utenti reali. Vedi AGENTS.md sezioni "Dati demo" e
"Deploy in produzione" prima di rilanciarlo.

Il seed crea solo coach demo pubblici (Elena Ferraro, Davide Conti, Giulia
Romano — non collegati a nessun account Clerk). Login/registrazione vera
tramite Clerk; usa "Diventa coach" (`/diventa-coach`) per passare dal ruolo
giocatore a coach dopo la registrazione.

## Stack e struttura

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 + shadcn/ui (style
  `base-nova`, primitive **Base UI**, non Radix).
- Drizzle ORM su **Postgres (Neon)**, driver `drizzle-orm/node-postgres` + `pg.Pool`
  a module scope in `src/lib/db/index.ts` (scelto per Vercel Fluid Compute, non
  neon-http/neon-serverless — vedi AGENTS.md sezione Stack per il perché).
- `src/lib/db/schema.ts` — schema Drizzle. `src/lib/db/seed.ts` — dati demo.
- `src/lib/action-result.ts` — tipo `ActionResult<T>` che tutte le Server Action
  ritornano invece di `throw`: in produzione Next.js oscura i messaggi di un throw
  non gestito da una Server Action, non i valori di ritorno normali. I client
  controllano `result.ok`, non try/catch.
- `src/lib/queries.ts` — letture lato server, marcato `"server-only"`: **mai
  importarlo da un client component**, trascinerebbe il driver `pg` nel bundle
  browser (è già successo con better-sqlite3 prima della migrazione, vedi commit
  di fix storico).
- `src/lib/constants.ts` — costanti/tipi condivisi tra server e client (`LEVELS`,
  `TRAINING_TYPES`, `dayName`, `parseJsonArray`, `toLocalDateString`): importare da
  qui nei client component, non da `queries.ts`.
- `src/lib/actions/` — Server Actions (`bookings.ts`, `coach-admin.ts`, `auth.ts`).
- `src/app/coach-admin/` — area riservata coach, layout con guard sul ruolo utente.
- `src/app/coach/[id]` — profilo pubblico coach, calendario e richiesta prenotazione.

## Design system "Agonistic Pulse" (dark-only, replica export Stitch)

Sito **dark-only per scelta**. `<html>` porta `class="dark"` in modo
permanente — niente `next-themes`, niente toggle. Dopo due tentativi propri
(scartati), il sistema attuale è un **porting il più fedele possibile
dell'export Google Stitch** (palette Material Design 3 + font Anybody
maiuscolo/corsivo + shell con sidebar fissa) — non un'interpretazione
libera. Font: `Anybody` (`--font-heading`, titoli `uppercase italic
font-black`), `Hanken Grotesk` (`--font-sans`, corpo), `Space Mono`
(`--font-mono`, etichette/prezzi/dati). Palette M3 esatta in `globals.css`
con nomi identici all'HTML sorgente di Stitch (`bg-primary-container`,
`text-on-surface-variant`, `bg-secondary-fixed`, ecc.) — non tradurre a
mano, i token sono già registrati come utility Tailwind. `--radius: 0.5rem`
(non zero: Stitch mescola angoli smussati e tagli `clip-path` netti).
Shell app con sidebar fissa desktop (`app-sidebar.tsx` + `sidebar-nav.tsx`),
topbar (`app-topbar.tsx`) e bottom-nav mobile (`app-bottom-nav.tsx`) — non
più un header semplice in cima. `coach-avatar.tsx` è tornato **circolare**
(Stitch usa cerchi ovunque). **Niente foto reali**: dove Stitch aveva
fotografie AI (hero, card coach) qui ci sono blocchi gradiente/texture
nello stesso spazio, perché gli URL delle immagini di Stitch sono asset
temporanei non riusabili in produzione. Logo/wordmark sempre "PAIDEIO"
maiuscolo — mai "Paideia" (parola greca del concept, non il nome del
prodotto). Pagine allineate 1:1 ai `code.html` di Stitch in questo giro:
home, `/cerca`, `/coach/[id]`, dashboard `/coach-admin` — le altre pagine
hanno i nuovi token ma non ancora le decorazioni specifiche. Dettagli
completi in `AGENTS.md`.

## Micro-interazioni e tono playful

Toast (`sonner`) + coriandoli (`src/lib/confetti.ts`) per ogni azione di
successo lato utente (prenotazione, conferma/rifiuto, salvataggi coach-admin),
copy a tema padel negli stati vuoti/di successo/errore (es. "Palla a rete!",
"Fuori campo!"). Animazioni `animate-ball-bounce`/`animate-ball-shadow` in
`globals.css`. `Toaster` passa `theme="dark"` hardcoded (sito dark-only).
Dettagli in `AGENTS.md`.

## Convenzioni da rispettare

- Testi UI sempre in italiano.
- Date "solo giorno" (`YYYY-MM-DD`): usare `toLocalDateString()` da
  `src/lib/constants.ts`, **mai** `date.toISOString().slice(0,10)` — sfasa di un
  giorno nei fusi orari UTC+ (bug reale già corretto una volta, non reintrodurlo).
- Bottoni che devono comportarsi da link:
  `<Button render={<Link href="..." />} nativeButton={false}>` — è la sintassi
  Base UI di questo progetto, non `asChild` (quello è Radix).
- Un booking corrisponde a uno slot settimanale intero del coach (non si spezzano
  in sotto-slot orari); il coach conferma/rifiuta manualmente dalla sua area.

## Stato del progetto e prossimi passi noti

Aggiorna questa sezione (e lo specchio in `AGENTS.md`) ogni volta che una di queste
voci cambia stato, così le sessioni future partono dal punto giusto.

- [x] Autenticazione reale con Clerk — vedi `AGENTS.md` per i dettagli
      (provisioning lazy dell'utente, `becomeCoach()`, proxy public-first)
- [x] Ricerca coach per posizione/geolocalizzazione — vedi `AGENTS.md` per i
      dettagli implementativi
- [x] Rifinitura design e responsività mobile — form di prenotazione
      riordinato su schermi piccoli, shell sidebar/topbar/bottom-nav
- [x] Redesign "Agonistic Pulse", replica export Stitch — vedi `AGENTS.md`
      sezione Design system; home/cerca/coach/dashboard allineate 1:1,
      resto del sito su token nuovi ma decorazioni non ancora riportate
- [x] Recensioni/voti coach, preferiti, traguardi giocatore, foto profilo
      coach (Vercel Blob, progetto già collegato — vedi `AGENTS.md` per i
      dettagli e il token già configurato)
- [x] Hardening backend (validazione prenotazioni, transizioni di stato,
      cancellazione campo sicura, transazioni atomiche) + ricchezza frontend
      (prezzo, statistiche coach, loading/error states, dashboard coach-admin,
      ordinamento ricerca) — vedi sezione "Round squadra di agenti" in
      `AGENTS.md` per l'elenco completo e cosa è stato deliberatamente
      rimandato
- [x] Migrazione a Postgres (Neon) + primo deploy in produzione
      (https://paideio.vercel.app) + refactor errori Server Action da
      `throw` a `ActionResult` strutturato — vedi `AGENTS.md` sezione
      "Deploy in produzione" per le limitazioni note (Clerk su chiavi dev,
      DB condiviso dev/prod, deploy manuale non collegato a Git)
- [ ] Decisione su integrazione pagamenti (al momento assente)
- [ ] PWA: manifest + icone + installabilità
- [ ] Branch Neon dedicato allo sviluppo, istanza Clerk di produzione
      (richiede dominio), collegamento Git→Vercel per deploy automatico

## Nota Base UI: prop `nativeButton`

Ogni componente polimorfico Base UI (`Button`, `SheetTrigger`, `SheetClose`, …) ha
un prop `nativeButton` (default `true`). Impostalo a `false` **solo** quando il
`render` punta a un elemento non-`<button>` (es. `<Link>`). Se il `render` è esso
stesso un `Button` senza `render` proprio (quindi renderizza un `<button>` vero),
**non** toccare `nativeButton` — altrimenti si genera il warning opposto. L'overlay
dev di Next.js segnala subito l'errore in console se sbagliato: controllarlo dopo
ogni componente nuovo che usa `render`.

## Istruzione permanente: mantenere questa skill aggiornata

Ogni volta che nel corso di una sessione prendi una decisione architetturale, aggiungi
un'area funzionale nuova, cambi una convenzione, o completi/aggiorni una voce della
lista "prossimi passi noti", aggiorna **sia questo file sia `AGENTS.md`** prima di
chiudere la sessione. Lo scopo è che nessuna sessione futura debba ri-scoprire da zero
scelte già fatte, e che il codice resti coerente con l'evoluzione del progetto anche
a distanza di settimane.
