<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Paideio

Marketplace per trovare coach di padel e prenotare lezioni singole o di gruppo.
Due ruoli: giocatore (cerca e prenota) e coach (gestisce campi, orari, tipo di
allenamento, livelli, richieste).

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4
- shadcn/ui, style `base-nova`, primitive **Base UI** (non Radix): i bottoni
  polimorfici usano `render={<Link .../>}` + `nativeButton={false}`, non `asChild`
- Drizzle ORM su SQLite locale (`paideio.db`, gitignored) — da migrare a Postgres
  (Vercel Marketplace/Neon) prima del deploy in produzione
- Autenticazione: Clerk (`@clerk/nextjs`). `src/proxy.ts` protegge
  `/coach-admin(.*)` e `/prenotazioni(.*)`; le altre rotte sono pubbliche
  (pattern "public-first"). `getCurrentUser()` in `src/lib/session.ts` fa da
  ponte tra l'utente Clerk e la riga locale in `users` — al primo accesso la
  crea automaticamente con ruolo `player` (provisioning lazy, nessun
  webhook). `src/lib/actions/account.ts` (`becomeCoach()`) fa l'upgrade a
  coach e crea il `coachProfiles` vuoto. Tema shadcn + localizzazione
  italiana applicati su `ClerkProvider` in `src/app/layout.tsx`
  (`@clerk/ui/themes` + `@clerk/localizations`).

## Struttura

- `src/lib/db/schema.ts` — schema Drizzle (users, coachProfiles, locations,
  availabilitySlots, bookings)
- `src/lib/db/seed.ts` — dati demo (`npm run db:seed`)
- `src/lib/queries.ts` — query lato server, marcato `"server-only"`: **non
  importarlo da client component** (trascinerebbe `better-sqlite3` nel bundle
  browser)
- `src/lib/constants.ts` — costanti/tipi condivisi (`LEVELS`, `TRAINING_TYPES`,
  `dayName`, `parseJsonArray`, `toLocalDateString`) — usare questo import nei
  client component
- `src/lib/actions/` — Server Actions (`bookings.ts`, `coach-admin.ts`, `auth.ts`)
- `src/app/coach-admin/` — area riservata coach (layout con guard sul ruolo)
- `src/app/coach/[id]` — profilo pubblico coach + calendario/prenotazione

## Design system "Agonistic Pulse" (dark-only, replica esatta export Stitch)

Terzo giro di design, storia completa perché è rilevante per capire perché il
sistema è fatto così:
1. Tema chiaro/lime originale → giudicato "generico da SaaS".
2. Rifacimento dark "Agonistic Pulse" con font `Anybody` scoreboard
   (maiuscolo/`font-black`) + palette oklch inventata da me → l'utente ha
   detto di preferire di gran lunga l'export di **Google Stitch** (stesso
   brief, generato indipendentemente) e di **rifare il sito identico a
   quello**, screenshot alla mano (5 schermate: home, ricerca coach, profilo
   coach, dashboard coach, le mie prenotazioni — cartella
   `stitch_paideio_padel_coaching_marketplace/*/code.html` fuori dal repo,
   in `~/Downloads`, tenuta come riferimento durante l'implementazione).
3. **Stato attuale**: porting 1:1 dei token colore/tipografia esatti letti
   dai `code.html` di Stitch, poi ricostruiti con i componenti reali
   (non è più un'interpretazione libera — i valori sotto sono quelli
   dell'export, non vanno "migliorati" senza che l'utente lo chieda di
   nuovo). Un dettaglio del tentativo 2 **è tornato utile** ed è stato
   riusato: il font `Anybody` corsivo/maiuscolo per i titoli — Stitch lo
   usa a sua volta, quindi coincide.

- **Dark-only per scelta**, non variante di un tema chiaro/scuro. `<html>`
  porta la classe `dark` in modo permanente (`layout.tsx`); **non esiste più
  `next-themes`/`ThemeProvider`**. `ui/sonner.tsx` passa `theme="dark"`
  hardcoded (unica modifica accettata a un file vendored shadcn).
- **Font**, esattamente come nell'export Stitch (`next/font/google` in
  `layout.tsx`, nomi letterali in `@theme inline` — mai `var()` diretto,
  stesso pattern del bug Geist):
  - `Anybody` → `--font-heading`. Titoli **maiuscoli e/o corsivi**
    (`uppercase italic`), pesante (`font-black`/800-900) per i momenti
    "scoreboard" (hero, nomi coach, "Bentornato Coach"). Il logo/wordmark è
    sempre "PAIDEIO" — mai "Paideia" (quello è il termine greco del
    concept, errore di naming trovato nell'export originale di Stitch, non
    ripeterlo).
  - `Hanken Grotesk` → `--font-sans`, corpo del testo.
  - `Space Mono` → `--font-mono`, etichette maiuscole tracciate
    (`text-label-caps uppercase`), prezzi, orari, dati.
  - Scala tipografica registrata **con gli stessi nomi di Stitch** in
    `@theme inline` (sintassi compound Tailwind v4, `--text-<nome>` +
    `--text-<nome>--line-height/letter-spacing/font-weight`):
    `display-hero` (80px/900, hero desktop), `headline-lg` (48px/800),
    `headline-lg-mobile` (32px/800, hero mobile e fallback headline-lg),
    `headline-md` (24px/700), `label-caps` (12px/700/tracked, sempre
    uppercase), `body-lg` (18px), `body-md` (16px) — usarle come
    `text-headline-lg` ecc., non reinventare dimensioni ad-hoc per i titoli.
- **Palette M3 esatta** (Material Design 3 color roles, nomi e valori hex
  presi identici dai `code.html` di Stitch, registrati in `globals.css` sia
  come token raw (`--primary-container`, `--surface-container-high`, ecc.)
  sia come utility Tailwind via `@theme inline` — si può scrivere
  `bg-primary-container`, `text-on-surface-variant`, `border-outline-variant`
  ecc. **esattamente come nell'HTML di Stitch**, non tradurre a mano):
  - `background`/`surface` `#111316` → base più scura; `surface-container-*`
    (lowest → highest, 5 livelli) per superfici via via più chiare salendo
    di elevazione (card, sidebar, pannelli).
  - `on-surface` `#e2e2e6` (testo principale), `on-surface-variant`
    `#c3c5d9` (testo secondario), `outline`/`outline-variant` per bordi.
  - `primary` `#b6c4ff` (blu periwinkle chiaro — testo/icone/bottoni
    "normali", è il valore di `--primary` shadcn) vs `primary-container`
    `#0057ff` (blu acceso pieno — blocchi CTA ad alto impatto, es. sezione
    "Sei un Coach?" in home, bottone sidebar). **Sono due token diversi con
    ruoli diversi, non intercambiabili.**
  - `secondary-container`/`secondary-fixed` `#d2f000` (giallo neon pallina)
    → alias `--ball`/`--ball-foreground` per compatibilità con il codice
    esistente che già usava `bg-ball`. Stesso ruolo di sempre: CTA ad alto
    impatto e stato selezionato/attivo, con parsimonia.
  - `tertiary`/`tertiary-container` (corallo/rosso `#ffb4a2`/`#c72e00`) →
    usato per accenti "urgenza" (bordo statistica "nuove richieste",
    indicatore lampo su avatar in `/cerca`).
  - `--court`/`--court-foreground` → alias di `surface-container-lowest`
    (la superficie più scura), per fasce hero decorative.
  - `error`/`error-container` → `--destructive` shadcn.
  - Badge di livello: `levelBadgeClass()` in `constants.ts`, invariati.
- `--radius: 0.5rem` (non più zero) — Stitch usa arrotondamenti moderati
  (`rounded-lg`/`rounded-full`) mescolati a tagli `clip-path` netti per gli
  elementi ad alto impatto. Non tornare a zero-radius globale.
- Utility decorative in `globals.css` (`@layer utilities`), nomi presi da
  Stitch — riusare, non reinventare varianti:
  - `.hex-texture` (alias `.hex-tex`) → texture a puntini per sfondi scuri
    (sostituisce l'asset esterno `transparenttextures.com` che Stitch usava
    in una pagina: stesso effetto, self-hosted via `radial-gradient`).
  - `.card-clip` → taglio diagonale angolo alto-destro (card coach, card
    prenotazione/richiesta).
  - `.badge-polygon` → esagono per i badge traguardo.
  - `.slanted-chip` → chip inclinata per i toggle tipo lezione nei filtri.
  - `.neon-glow-primary` / `.neon-glow-secondary` → box-shadow glow blu/giallo.
  - `.neo-shadow` → ombra hard-edge `4px 4px 0 #0057ff` (CTA "Prenota ora").
  - `.slanted-divider` + `.un-skew` → fascia inclinata full-bleed con
    contenuto raddrizzato dentro (sezione "Perché Paideio" in home, footer).
  - `.animate-active-ring` → rotazione continua (ring intorno all'avatar nel
    profilo coach).
  - `.cut-cta` / `.cut-corner` → **legacy**, dal tentativo 2. Rimasti solo
    per le pagine non ancora riportate 1:1 su Stitch in questo giro
    (`prenotazioni`, `preferiti`, `chi-siamo`, `diventa-coach`, i form in
    `coach-admin/campi|orari|profilo`, `not-found`/`error`) — ereditano
    comunque palette/font nuovi perché sono token globali, solo le
    decorazioni più specifiche di Stitch (card-clip, date-stamp, ecc.) non
    sono ancora state applicate lì. Se le riporti su Stitch, migra a
    `.card-clip`/niente e rimuovi l'uso locale, non aggiungerne di nuovi.
- **Shell dell'app cambiata**: non più header in cima soltanto. Ora
  `src/components/app-topbar.tsx` (barra fissa in alto, solo logo + notifica
  + profilo) + `src/components/app-sidebar.tsx` (sidebar fissa a sinistra,
  desktop, `w-64`, nav + CTA in fondo — usa `src/components/sidebar-nav.tsx`,
  client, per lo stato attivo via `usePathname`) + `src/components/
  app-bottom-nav.tsx` (barra fissa in basso, mobile, 4 icone). `layout.tsx`
  applica `md:pl-64 pt-16 pb-24 md:pb-0` al `<main>` per lo spazio della
  sidebar/barre fisse. `site-header.tsx` e `mobile-nav.tsx` **rimossi**,
  sostituiti da questi tre. `site-footer.tsx` ha la fascia inclinata
  `-skew-y-1` con `md:pl-64` per allinearsi alla sidebar.
- `src/components/coach-avatar.tsx` → **tornato circolare** (`rounded-full`,
  non più parallelogramma): Stitch usa cerchi ovunque per gli avatar
  (profilo, card ricerca, richieste dashboard). Palette gradient in
  `PALETTE` allineata ai toni M3 (`primary-container`, `tertiary-container`,
  `secondary-fixed-dim`).
- **Niente fotografie reali**: l'export di Stitch usa foto AI-generate
  ospitate su URL temporanei Google (`lh3.googleusercontent.com/aida-public/
  ...`) — non riusabili in produzione (non stabili, probabilmente non
  licenziate per embedding permanente). Ovunque Stitch aveva una foto (hero,
  card coach, sfondo profilo) qui c'è un blocco gradiente/texture al suo
  posto (stesso spazio/proporzioni, stesso mood cromatico). Se in futuro
  arrivano foto vere (coach reali via `avatarUrl` esistente, o asset del
  brand), vanno agganciate in quegli stessi punti — non è un placeholder da
  "completare con altro stile", è la stessa griglia in attesa dell'immagine.
- Bottoni "ball" invariati:
  `className="bg-secondary-fixed font-mono text-label-caps text-on-secondary-fixed uppercase"`
  (o l'alias `bg-ball`/`text-ball-foreground`, stesso colore) — nessuna
  variant dedicata in `button.tsx`, per non toccare il file vendored shadcn.

## Micro-interazioni e tono "vissuto" (playful pass)

- Animazioni keyframe in `globals.css`: `animate-ball-bounce` (rimbalzo con
  squash/stretch), `animate-ball-shadow` (ombra sincronizzata, stesso
  timing), `animate-pop-in`. Tutte disabilitate sotto
  `prefers-reduced-motion: reduce`.
- `Button` (`components/ui/button.tsx`) ha un leggero "schiacciamento" al
  click (`active:scale-[0.97]`) oltre al `translate-y-px` originale di
  shadcn — voluto, non rimuovere.
- Toast (`sonner`, componente `ui/sonner.tsx`) + coriandoli
  (`src/lib/confetti.ts`, `canvas-confetti`) sostituiscono gli `Alert`
  statici per il feedback di successo su: prenotazione richiesta
  (`booking-calendar.tsx`), conferma/rifiuto prenotazione
  (`booking-request-actions.tsx`), annullamento (`cancel-booking-button.tsx`),
  aggiunta campo/orario e salvataggio profilo coach. `Toaster` passa
  `theme="dark"` hardcoded (sito dark-only, vedi sezione Design system) —
  niente più `next-themes`.
- Copy a tema padel nei messaggi di feedback e negli stati vuoti (es. "Palla
  a rete!" quando la ricerca non trova risultati, "Fuori campo!" nella 404
  in `not-found.tsx`, messaggi di successo prenotazione randomizzati in
  `SUCCESS_MESSAGES` in `booking-calendar.tsx`) — mantenere questo tono
  quando si aggiungono nuovi stati vuoti/di successo, non tornare a un tono
  neutro "di sistema".

## Convenzioni

- Tutti i testi UI in italiano.
- Date "solo giorno" (`YYYY-MM-DD`): usare `toLocalDateString()` in
  `constants.ts`, mai `date.toISOString().slice(0,10)` (sfasa di un giorno nei
  fusi UTC+, bug reale già corretto una volta).
- Un booking = uno slot settimanale intero del coach (no sotto-slot orari); il
  coach conferma/rifiuta manualmente.

## Comandi

- `npm run dev` — dev server
- `npm run db:seed` — resetta e ripopola il database demo
- `npm run db:push` — applica lo schema Drizzle al DB locale
- `npm run build` — build di produzione

## Dati demo

Il seed crea solo tre coach pubblici, navigabili senza autenticazione:
Elena Ferraro (Milano), Davide Conti (Milano), Giulia Romano (Torino). Non
sono collegati a nessun account Clerk (`clerkId` null) — servono solo come
annunci di esempio nella ricerca. Per provare il flusso giocatore/coach vero,
registrati con Clerk (bottone "Registrati") e usa "Diventa coach" da
`/diventa-coach` per passare al ruolo coach.

`npm run db:seed` è **sicuro da rilanciare**: cancella solo gli utenti con
`clerkId` nullo (i coach demo), mai gli account Clerk reali collegati
durante i test. In passato faceva `db.delete(users)` su tutta la tabella —
corretto perché avrebbe cancellato anche gli utenti reali ad ogni reseed. Se
tocchi `seed.ts`, mantieni il filtro `isNull(users.clerkId)`.

## Stato e prossimi passi noti

- [x] Autenticazione reale con Clerk — vedi sezione Stack. Login/registrazione
      demo (`/accedi`, cookie stub) rimossi definitivamente. Nota: `proxy.ts`
      usa `createRouteMatcher`, che Clerk segnala come deprecato a favore di
      controlli a livello di singola pagina/route — qui è comunque affiancato
      da controlli di ruolo espliciti in `coach-admin/layout.tsx` e
      `prenotazioni/page.tsx`, ma se Clerk rimuove l'API andrà migrato (vedi
      https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrate-from-create-route-matcher)
- [x] Ricerca coach per posizione/geolocalizzazione — `haversineDistanceKm()` in
      `constants.ts`, filtro `near` in `searchCoaches()`, bottone
      `UseMyLocationButton`. `locations.lat/lng` nullable: i coach le impostano
      da `coach-admin/campi` rilevando la posizione del dispositivo (nessuna
      chiave di geocoding usata). Location senza coordinate non compaiono nella
      ricerca "vicino a me" ma restano cercabili per città.
- [x] Rifinitura design e responsività mobile — header con nav collassata in
      `Sheet` (`MobileNav`) sotto `sm`, pannello prenotazione riordinato sopra
      il calendario su mobile e `sticky` su desktop (`booking-calendar.tsx`)
- [ ] Migrazione da SQLite locale a Postgres prima del deploy
- [ ] Decisione su integrazione pagamenti (al momento assente)
- [x] Pagina concept (`/chi-siamo`) — perché il nome "Paideio" (dal greco
      antico παιδεία), collegata da footer (`site-footer.tsx`, nuovo, presente
      su ogni pagina via `layout.tsx`) e da una sezione teaser in home
- [x] Recensioni e voti coach (tabella `reviews`, `actions/reviews.ts`,
      `star-rating.tsx`) — un giocatore può recensire solo prenotazioni
      `confermata` con data passata, una recensione per prenotazione. Media
      calcolata in JS su tutte le review del coach (dataset piccolo, non serve
      SQL aggregate). Il prompt "Lascia una recensione" appare in
      `/prenotazioni` (`getBookingsForPlayer` calcola `canReview`/`isReviewed`)
- [x] Coach preferiti (tabella `favorites`, unique su `(playerId, coachId)`,
      `actions/favorites.ts`, `favorite-button.tsx`) — nuova pagina protetta
      `/preferiti`, aggiunta a `proxy.ts`
- [x] Traguardi giocatore (`getPlayerAchievements` in `queries.ts`,
      `achievements-panel.tsx`, mostrato in cima a `/prenotazioni`) — calcolati
      al volo dalle prenotazioni confermate passate, nessuna tabella dedicata:
      soglie di lezioni completate, "fedelissimo" (3+ con lo stesso coach),
      streak di settimane consecutive con almeno una lezione
- [x] Foto profilo coach reali (`coachProfiles.avatarUrl`, `@vercel/blob`,
      `avatar-upload.tsx`, action `updateCoachAvatar`). Progetto collegato a
      Vercel (`sharilennartz1994s-projects/paideio`) con Blob store pubblico
      `paideio-avatars` — `BLOB_READ_WRITE_TOKEN` già in `.env.local` (girato
      con `vercel blob create-store ... --access public`, non serve rifarlo).
      `CoachAvatar` accetta `src` opzionale e mostra la foto reale se
      presente, altrimenti iniziali colorate come prima. Dominio
      `**.public.blob.vercel-storage.com` whitelistato in `next.config.ts`
      per `next/image`.
- [x] Redesign "Agonistic Pulse" — vedi sezione Design system per la storia
      completa (3 tentativi) e i dettagli tecnici. Stato finale: replica il
      più fedelmente possibile l'export di Google Stitch (palette M3, font
      Anybody/Hanken Grotesk/Space Mono, shell con sidebar fissa) sulle
      pagine esplicitamente indicate dall'utente — home, `/cerca`,
      `/coach/[id]` (+ `booking-calendar.tsx`), dashboard `/coach-admin`.
      Le altre pagine (`prenotazioni`, `preferiti`, `chi-siamo`,
      `diventa-coach`, i form in `coach-admin/campi|orari|profilo`,
      `not-found`/`error`) ereditano i nuovi token globali (palette, font,
      radius) ma non hanno ancora le decorazioni specifiche di Stitch
      (`card-clip`, date-stamp, ecc.) — prossimo passo naturale se richiesto.
- [ ] PWA: manifest + icone + installabilità (non ancora affrontato)

## Round "squadra di agenti" (audit sicurezza + backend + frontend/design)

Un giro di lavoro orchestrato come una mini-squadra (PM/coordinatore + Security
Lead + Backend Engineer + Design/Frontend Lead + Delivery Manager, agenti
separati) ha prodotto tre audit indipendenti seguiti da due fasi di
implementazione (backend poi frontend, sequenziali apposta perché il frontend
dipende dai nuovi contratti dati). Risultato consegnato e verificato (tsc +
build + giro nel browser):

- **`createBooking`** ora valida che lo slot richiesto corrisponda a una vera
  riga `availabilitySlots`, la data sia in formato valido e non passata, tipo
  e livello siano tra quelli offerti dal coach; note troncate a 500 caratteri;
  max 10 richieste `richiesta` aperte per giocatore; indice unico parziale
  `bookings_active_slot_idx` su `(coachId, locationId, date, startTime) WHERE
  status IN ('richiesta','confermata')` come backstop anti race-condition.
- **`updateBookingStatus`** valida lo status a runtime e applica una matrice
  di transizioni consentite (coach: `richiesta→confermata|rifiutata`;
  giocatore: `richiesta|confermata→annullata`); non si può più confermare una
  prenotazione con data passata.
- **`removeLocation`** non cancella più in silenzio le prenotazioni future
  via cascade FK: le annulla esplicitamente (transazione) prima di eliminare
  il campo. `bookings.locationId` è ora nullable con `onDelete: "set null"`
  (deviazione dal piano originale — il cascade avrebbe comunque cancellato le
  righe appena annullate).
- **`becomeCoach`** e il provisioning lazy in `session.ts` sono ora atomici
  (`db.transaction` sincrona, pattern better-sqlite3) con
  `onConflictDoNothing` per essere ripetibili in caso di fallimento parziale
  o richieste concorrenti.
- **`updateCoachProfile`** filtra `levels`/`trainingTypes` contro le costanti
  canoniche; accetta `pricePerLesson` (euro interi, nullable).
- **Nuovo**: `coachProfiles.pricePerLesson`, mostrato su card ricerca/preferiti
  e nel pannello di prenotazione; `searchCoaches` accetta `sort:
  "rating"|"distance"|"price"`, selettore "Ordina per" in `/cerca`.
- **Nuovo**: striscia statistiche nell'hero del profilo coach (lezioni svolte,
  "Coach dal {anno}", numero recensioni) via `getCoachDetail`.
- **Nuovo**: `loading.tsx` per `/cerca`, `/coach/[id]`, `/prenotazioni`,
  `/preferiti`; `error.tsx` radice in tono padel ("Siamo finiti in rete!").
- **Nuovo**: `/coach-admin` non fa più un redirect nudo — è una vera dashboard
  (richieste in attesa, lezioni confermate questa settimana, valutazione
  media), con badge sul tab "Richieste" quando ci sono richieste in sospeso, e
  header `bg-court`+`CourtLines` come il resto del brand.

**Deliberatamente rimandato** (deciso dal Delivery Manager per tenere lo scope
gestibile in una sessione, non dimenticato):
- Refactor di tutte le action da `throw` a `{ok:false, error}` — i messaggi
  d'errore italiani vengono oscurati da Next.js in produzione (Server Actions
  redigono i messaggi di errore lanciati); refactor cross-cutting troppo
  grande per questo giro, tocca ogni action + ogni chiamante client.
- Validazione magic-byte sull'upload avatar (oggi si fida del `Content-Type`
  del client) + cancellazione del blob precedente al re-upload.
- Vincoli `CHECK` a livello schema (rating 1-5, day_of_week 0-6,
  start<end); indice unico su slot di disponibilità duplicati.
- Booking flow più guidato (selettore giorni a strip), tab In arrivo/Passate
  su `/prenotazioni`, contrasto colore delle stelle piene (~1.4:1, sotto la
  soglia WCAG AA 3:1 per elementi non testuali), `role="radiogroup"` +
  focus-visible su `StarRatingInput`, stati vuoti ancora "grezzi" (bio
  location/orari coach), pannello traguardi sempre visibile (oggi sparisce se
  zero badge guadagnati). Il toggle dark mode non è più in roadmap: il sito
  è dark-only per scelta di design (vedi sezione Design system).
- N+1 query pattern in `queries.ts` — non un problema reale su SQLite
  in-process a questa scala, da affrontare insieme alla migrazione Postgres.

## Note Base UI da non dimenticare

- Ogni componente Base UI polimorfico (`Button`, `SheetTrigger`, `SheetClose`, …)
  ha un prop `nativeButton` (default `true`). Va messo a `false` **solo** quando
  il `render` punta a un elemento che non è un `<button>` reale (es. `<Link>`).
  Se il `render` è a sua volta un `Button` (che di default renderizza un
  `<button>`), **non** impostare `nativeButton={false}` — causerebbe il warning
  opposto. Sbagliare questo genera un warning in console visibile nell'overlay
  dev di Next.js, controllabile subito durante lo sviluppo.

## Mantenere questo file aggiornato

Quando prendi una decisione architetturale, aggiungi un'area funzionale nuova, o
cambi una convenzione, aggiorna questa sezione **e**
`.claude/skills/paideio-dev/SKILL.md` prima di chiudere la sessione, così le
sessioni future restano coerenti con l'evoluzione del progetto.
