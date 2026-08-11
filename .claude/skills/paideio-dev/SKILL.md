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

**Attenzione**: sviluppo locale e produzione (https://playpaideio.com)
condividono lo stesso database Neon — `npm run db:seed` scrive anche in
quello che vedono gli utenti reali. Vedi AGENTS.md sezioni "Dati demo" e
"Deploy in produzione" prima di rilanciarlo.

Il progetto Neon è `paideio-eu`, regione `aws-eu-central-1` (Francoforte). La
regione di un progetto Neon non si può cambiare: spostarla richiede un
progetto nuovo e il travaso con `scripts/db-dump.mts` e
`scripts/db-restore.mts`. Procedura in `docs/PRODUCTION-HANDOFF.md`.

Il seed crea tre coach demo pubblici, due giocatori sintetici e scenari per
richiesta, conferma futura, lezione completata con recensione, annullamento e
preferito. Nessun dato demo è collegato a Clerk. Login/registrazione vera
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

## Design system "Game Arena" (tema giorno/notte)

Il tema giorno `Court Daylight` è predefinito; `.dark` attiva l’arena
notturna. La preferenza `paideio-theme` viene applicata prima del paint senza
`next-themes`. Oxanium è il font display/UI sportivo; Hanken Grotesk è il
font di lettura. Gli accenti sul tema giorno usano i token `accent-*-ink`
(`accent-cyan-ink`, `accent-ball-ink`, `accent-orange-ink`) — **non solo per il
testo ma anche per bordi, pallini, barre e riempimenti**. I token `game-*`
(ink, blue, cyan, ball, white) sono fissi e valgono soltanto dove la superficie
è a sua volta fissa: topbar, sidebar, bottom nav, sheet di navigazione, hero
`bg-game-ink`, sezioni `bg-game-blue`, `.net-texture`, `.malla-texture`. Su
`carta`/`carta-alta`/`carta-bassa` il giallo pallina puro dà 1,15:1 e il ciano
1,8:1: gli indicatori spariscono in modalità giorno. Focus sempre su `--vetro`.
Un componente che compare su entrambi i tipi di superficie (es. `GameBadge`)
deve avere fondo opaco.

Le illustrazioni comic/cel-shaded vivono in `public/design/game`, le icone
PNG proprietarie in `public/design/icons` e le primitive in
`src/components/design`. Logo e favicon sono raster in `public/brand` e
`src/app/icon.png`/`apple-icon.png`; non convertirli in SVG. La shell usa
sidebar desktop, topbar e bottom navigation mobile. La bottom nav
(`mobile-nav.tsx`, guscio server in `app-bottom-nav.tsx`) ha quattro schede più
uno sheet "Altro": nessuna rotta deve essere raggiungibile solo dalla sidebar
desktop, quindi ogni voce nuova va aggiunta in entrambi i posti.

La metafora del gioco non deve oscurare il servizio: l’hero esplicita sempre
ricerca del coach e prenotazione. Contrasto WCAG AA in entrambi i temi,
target minimi 44×44 px, focus visibile e fallback statico per
`prefers-reduced-motion`. Fonti normative: `DESIGN.md`,
`design/HANDOFF.md`, `design/SYSTEM.md` e `AGENTS.md`.

## Capienza slot

Uno slot-istanza è *giorno + campo + fascia oraria*. La regola sta in un solo
posto, `computeSlotOccupancy()` in `src/lib/constants.ts`, condivisa da
`getCoachCalendar()` e `createBooking()`: se divergono, il calendario offre
qualcosa che l'action rifiuta. Una lezione singola prende il campo in
esclusiva; le lezioni di gruppo condividono lo slot fino a
`coachProfiles.groupCapacity` (configurabile dal coach in
`/coach-admin/profilo`); raggiunta la capienza lo slot sparisce. Uno slot già
aperto come gruppo resta di gruppo. La capienza non è esprimibile come indice
unico: `createBooking()` usa `pg_advisory_xact_lock` per serializzare gli
scrittori sullo stesso slot — non sostituirlo con un `count(*)` nudo.

Test: `npm run test:capienza`, da lanciare **solo** contro un Postgres locale
usa-e-getta (lo script rifiuta URL non locali). Istruzioni complete
nell'intestazione di `scripts/e2e-capienza.mts`.

## Micro-interazioni e tono playful

Toast (`sonner`) + coriandoli (`src/lib/confetti.ts`) per ogni azione di
successo lato utente (prenotazione, conferma/rifiuto, salvataggi coach-admin),
copy a tema padel negli stati vuoti/di successo/errore (es. "Palla a rete!",
"Fuori campo!"). Animazioni `animate-ball-bounce`/`animate-ball-shadow` in
`globals.css`. `Toaster` segue il tema attivo.
Dettagli in `AGENTS.md`.

## Academy e circuito

Area editoriale disponibile su `/academy` (tecnica, strategia, regole 2026,
training, attrezzatura, storia/cultura) e `/circuito` (classifiche FIP,
calendario Premier Padel, guida Ranking vs Race). Fonti e date di verifica
sono obbligatorie per dati e normativa. Primitive comuni in
`src/components/editorial-layout.tsx`, tassonomia in
`src/lib/editorial-content.ts`; dettagli in `AGENTS.md`.

## Flussi operativi

La prenotazione in `booking-calendar.tsx` segue giorno/orario → dettagli →
riepilogo/invio, comunica esplicitamente che non c’è pagamento e che serve la
conferma del coach. L’area `/coach-admin` mostra una checklist reale di
pubblicazione basata su profilo, campi e turni; gli orari sono raggruppati per
giorno e le rimozioni richiedono conferma. Non ridurre nuovamente questi flussi
a form o liste prive di contesto.

Tre regole nate da un test con un coach reale che non riusciva a pubblicare gli
orari (agosto 2026): `coach-admin-nav.tsx` è una griglia a 5 colonne sotto `md`
perché la vecchia riga `overflow-x-auto` lasciava "Orari" e "Richieste" fuori
schermo sui telefoni; le mutazioni del coach usano
`revalidateCoachSurfaces(coachId)` in `actions/coach-admin.ts`, perché campi e
turni alimentano anche `/coach-admin`, `/coach/[id]` e `/cerca`; e
`/coach-admin/orari` senza campi rende inline il form di creazione campo invece
di rimandare a un'altra scheda. Dettagli in `AGENTS.md`.

Dallo stesso giro: un coach senza turni pubblicati **non compare in
`/cerca`** (`searchCoaches`), ma il suo profilo resta raggiungibile e lì la CTA
diventa "Salva tra i preferiti". I preferiti (`getFavoriteCoaches`) non
applicano quel filtro, e `FavoriteButton` prende `viewerRole` con varianti
`icon`/`cta`, aprendo Clerk per gli anonimi invece di sparire.

## Chiusure calendario

`availability_slots` è ricorrente settimanale; `availability_closures` è
l'eccezione su una data precisa — un singolo turno oppure l'intera giornata
(`location_id`/`start_time`/`end_time` a `null`). Non modifica mai la
ricorrenza. Regola condivisa in `closureKey()`/`isSlotClosed()`
(`constants.ts`), usata da `buildCoachSchedule()` e da `createBooking()` dentro
l'advisory lock. Chiudere annulla e notifica le prenotazioni attive sulla data.
Test: `npm run test:chiusure`. Dettagli in `AGENTS.md`.

## Conferme

Usare `ConfirmDialog` (`components/confirm-dialog.tsx`), mai `window.confirm()`
— nel codice non ne resta nessuno. `onConfirm` ritorna un booleano: `true`
chiude, `false` tiene aperto per far leggere l'errore. Il bottone di conferma è
**neutro** (`variant="default"`), mai rosso: il rosso è per gli errori, non per
un'azione scelta dall'utente. Il rischio sta nei riquadri `reassurance` (ciano,
come si torna indietro) e `warning` (arancio, cosa si perde). Titoli in seconda
persona: "Vuoi davvero chiudere questo slot?".

## Contrasto: superficie fissa ⇒ testo fisso

Se lo sfondo è un colore che **non** cambia con il tema (`--ottico`,
`--ruggine`, `--sabbia`, `--game-*`), anche il testo sopra deve essere fisso.
Accoppiarlo a `--carta`/`--calce`/`--vetro` produce componenti leggibili in una
sola modalità, e il difetto sfugge perché si sviluppa quasi sempre in modalità
notte. Gli `on-*` erano tutti sbagliati così (il bottone "Salva profilo" dava
1,01:1 di giorno); ora puntano a `--game-ink`. Per le CTA su arene scure fisse
usare `GameCta tone="arena"`, non `outline`. Dettagli, numeri e trappole degli
script di audit in `AGENTS.md`.

Da `/cerca` ogni risultato offre una CTA `Prenota` verso
`/coach/[id]#prenota`; il configuratore sul profilo è full-width e centrale,
mai in una sidebar. Gli anonimi vedono “Accedi e prenota”, i player “Invia
richiesta”. La sidebar desktop è una rail fissa da 80px con tooltip, senza
espansione hover.

Le pagine Academy sono moduli didattici, non raccolte di liste: usare
`src/components/academy/academy-ui.tsx` per obiettivo, principio, esercizio,
verifica, progressione e distinzione tra consiglio informativo e vero
avvertimento. Ciano = informazione, giallo = suggerimento, arancio/rosso solo
per errore, rischio o stop. Gli otto PNG didattici sono registrati in
`src/components/design/field-assets.tsx` sotto `/design/game/academy/`.

Il registry contiene tutti e soli i 26 PNG serviti da
`public/design/game/`; `/design-system` li mostra tutti. Le varianti obsolete
sono archiviate fuori da `public/` in
`design/assets-comic/_archive-unused-runtime/`. `GameDivider` è una linea di
campo modulare ripetuta (non un PNG overgrip); il grip è impiegato nella
lezione Academy sull’attrezzatura.

Ogni attesa di navigazione o di una mutazione utente usa
`FullScreenGameLoader`. I reveal di `ArenaMotionDirector` devono restare
route-safe: mai nascondere completamente contenuti in attesa
dell’`IntersectionObserver`.

Accessibilità: mantenere WCAG 2.2 AA in entrambe le modalità, focus visibile,
target minimi 44px e un solo landmark `<main>` fornito da `app/layout.tsx`.
`GameRouteStage` azzera lo scroll su pathname/query e conserva la navigazione
con hash. L’hero deve spiegare subito “trova un coach/prenota una lezione”;
la metafora Game Arena resta espressiva ma non sostituisce il servizio reale.
`/chi-siamo` usa un motion esplicativo one-shot con fallback statico completo
in `prefers-reduced-motion`.

Le prenotazioni e gli annullamenti generano due notifiche persistenti e
atomiche nella tabella `notifications`: una per il player e una per il coach.
La campanella punta a `/notifiche` e mostra i non letti. L’annullamento usa
sempre l’`AlertDialog` Base UI in `components/ui/alert-dialog.tsx`; non
richiamare direttamente l’action dal primo click.

Il riepilogo giocatore in `/prenotazioni` usa
`player-bookings-overview.tsx`: filtri per periodo, stato e formato, più tre
viste (`Lista`, `Calendario`, `Agenda`) sullo stesso dataset serializzabile
caricato dal Server Component. Conservare la Lista come vista gestionale, il
Calendario come orientamento mensile e l’Agenda come timeline per giorno.

La pagina pubblica `/prossime-release` raccoglie feedback persistenti in
`product_feedback`. L’invio Resend è opzionale e successivo alla persistenza:
richiede `RESEND_API_KEY` e `FEEDBACK_RECIPIENT_EMAIL`. Usare esclusivamente
indirizzi `@playpaideio.com`; dettagli in `docs/EMAIL-SETUP.md`.

Le icone dell’interfaccia sono proprietarie Paideio: 56 PNG trasparenti in
`public/design/icons`, generati da `scripts/generate-paideio-icons.mjs` e
montati come CSS mask da `src/components/icons/paideio-icons.tsx` per
ereditare `currentColor`. Nomi canonici in `paideio-icon-names.ts`, catalogo
in `/design-system`. `lucide-react` non fa più parte del progetto: per nuove
icone aggiornare generatore, PNG e alias semantici senza introdurre SVG.

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
- [x] Migrazione a Postgres (Neon), Clerk production e dominio
      (https://playpaideio.com) + refactor errori Server Action da
      `throw` a `ActionResult` strutturato — vedi `AGENTS.md` sezione
      "Deploy in produzione" e `docs/PRODUCTION-HANDOFF.md`
- [ ] Decisione su integrazione pagamenti (al momento assente)
- [ ] PWA: manifest + icone + installabilità
- [ ] Branch Neon dedicato allo sviluppo e collegamento Git→Vercel per
      deploy automatico

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
