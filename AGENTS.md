<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Paideio

Marketplace per trovare coach di padel e prenotare lezioni singole o di gruppo.
Due ruoli: giocatore (cerca e prenota) e coach (gestisce campi, orari, tipo di
allenamento, livelli, richieste).

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4
- shadcn/ui, style `base-nova`, primitive **Base UI** (non Radix): i bottoni
  polimorfici usano `render={<Link .../>}` + `nativeButton={false}`, non `asChild`
- Drizzle ORM su **Postgres (Neon, via Vercel Marketplace)** - migrato da
  SQLite locale prima del primo deploy in produzione. Driver
  `drizzle-orm/node-postgres` + `pg.Pool` creato una volta a module scope in
  `src/lib/db/index.ts` (non `neon-http`/`neon-serverless`: Vercel gira su
  Fluid Compute, che tiene vivo il runtime tra le richieste, quindi un pool
  TCP riutilizzabile è la scelta giusta - vedi skill `neon-postgres`).
  `attachDatabasePool` da `@vercel/functions` lascia che il runtime dreni le
  connessioni prima che l'istanza vada in sospensione. Il progetto Neon è
  `paideio-eu`, regione **`aws-eu-central-1` (Francoforte)**: la regione di un
  progetto Neon non è modificabile dopo la creazione, quindi spostarla ha
  richiesto un progetto nuovo e il travaso dei dati (28 luglio 2026, vedi
  `docs/PRODUCTION-HANDOFF.md`). **Un solo database Neon condiviso tra
  sviluppo locale e produzione** (nessun branch dedicato ancora) - vedi
  "Stato e prossimi passi".
- Autenticazione: Clerk (`@clerk/nextjs`). `src/proxy.ts` protegge
  `/coach-admin(.*)` e `/prenotazioni(.*)`; le altre rotte sono pubbliche
  (pattern "public-first"). `getCurrentUser()` in `src/lib/session.ts` fa da
  ponte tra l'utente Clerk e la riga locale in `users` - al primo accesso la
  crea automaticamente con ruolo `player` (provisioning lazy, nessun
  webhook). `src/lib/actions/account.ts` (`becomeCoach()`) fa l'upgrade a
  coach e crea il `coachProfiles` vuoto. Tema shadcn + localizzazione
  italiana applicati su `ClerkProvider` in `src/app/layout.tsx`
  (`@clerk/ui/themes` + `@clerk/localizations`).

## Struttura

- `src/lib/db/schema.ts` - schema Drizzle (users, coachProfiles, locations,
  availabilitySlots, availabilityClosures, bookings, notifications,
  productFeedback)
- `src/lib/db/seed.ts` - dati demo (`npm run db:seed`)
- `src/lib/queries.ts` - query lato server, marcato `"server-only"`: **non
  importarlo da client component** (trascinerebbe il driver `pg` nel bundle
  browser)
- `src/lib/action-result.ts` - tipo `ActionResult<T>` (`{ok:true,data} |
  {ok:false,error}`) che tutte le Server Action in `lib/actions/*` ritornano
  invece di lanciare eccezioni per gli errori attesi (validazione, permessi,
  limiti). **Non tornare a `throw new Error(...)` per errori che l'utente
  deve vedere**: Next.js in produzione oscura il messaggio di un throw non
  gestito da una Server Action (mostra un generico "An error occurred"), ma
  non tocca un valore di ritorno normale - è per questo che il refactor è
  stato fatto. I client caller controllano `result.ok` invece di
  try/catch. Fa eccezione `becomeCoach()` in `actions/account.ts`: chiamata
  da un `<form action={...}>` diretto via `useActionState`
  (`components/become-coach-form.tsx`), stessa idea ma firma
  `(prevState, formData) => ActionResult` richiesta dall'hook.
- `src/lib/constants.ts` - costanti/tipi condivisi (`LEVELS`, `TRAINING_TYPES`,
  `dayName`, `parseJsonArray`, `toLocalDateString`) - usare questo import nei
  client component
- `src/lib/actions/` - Server Actions (`bookings.ts`, `coach-admin.ts`, `auth.ts`)
- `src/app/coach-admin/` - area riservata coach (layout con guard sul ruolo)
- `src/app/coach/[id]` - profilo pubblico coach + calendario/prenotazione

## Design system attuale "Game Arena" (dal 26 luglio 2026)

L’intero prodotto adotta l’interfaccia di un moderno gioco online di padel:
energico e divertente, ma senza punti, livelli o progressi finti. La
prenotazione reale è il loop principale (`trova → configura → invia → gioca`).
Il registro illustrativo corrente è comic/cel-shaded, con master in
`design/assets-comic/`, copie runtime in `public/design/game/` e registry
tipizzato in `src/components/design/field-assets.tsx`. Le illustrazioni sono
momenti editoriali controllati: massimo un asset dominante per viewport;
icone funzionali e navigazione usano il set PNG proprietario Paideio.
`GameAsset`, `GameDivider` e
`GameEmptyState` sono le primitive asset canoniche; CTA, loader, badge,
pannelli, statistiche e skeleton sono in
`src/components/design/game-ui.tsx`, esportati da
`src/components/design/index.ts`. Il catalogo visuale è disponibile su
`/design-system` e la documentazione in
`design/GAME-MODE-COMPONENTS.md`. I PNG
`architecture/court-topdown.png` e `architecture/court-isometric.png` sono
esplicitamente esclusi dal runtime finché non vengono ricostruiti a partire
da una pianta FIP 20×10 m verificata.

Tutti i 26 PNG runtime sono registrati in `GAME_ASSETS` e mostrati nel
catalogo `/design-system`; le varianti superate restano archiviate in
`design/assets-comic/_archive-unused-runtime/`, non in `public/`. Il divider
non usa più l’overgrip: `GameDivider` è una marcatura di campo modulare
ripetuta in CSS, mentre il grip compare come contenuto nella pagina Academy
sull’attrezzatura.

Il sistema "Agonistic Pulse"/Stitch documentato sotto è archiviato. La fonte
normativa attuale è `design/SYSTEM.md`, con istruzioni d'implementazione in
`design/IMPLEMENTATION-BRIEF.md`.

- Tema giorno/notte: `Court Daylight` è il default; `.dark` abilita l’arena
  notturna. I token semantici cambiano insieme e devono rispettare AA in
  entrambe le modalità.
- Font: `Oxanium` per display, CTA, navigazione e label HUD; Hanken Grotesk
  per corpo e dati con `tabular-nums`. Niente serif o corsivi decorativi.
- Colori guida: `--vetro` ciano per focus/azioni, `--ottico` giallo-pallina
  per la CTA decisiva, `--sabbia` blu elettrico per pannelli ad alto impatto.
  Angoli tagliati e bordi netti sostituiscono pill e card SaaS.
- Asset canonici in `design/assets`; copie runtime ottimizzate in
  `public/design`. Le primitive condivise sono in
  `src/components/design/field-assets.tsx`.
- Marchio Paideio: wordmark raster PNG trasparente minimalista
  `public/brand/paideio-wordmark-2026.png`. La `P` blu ha un taglio interno che
  richiama la `O` finale neon, costruendo una relazione inizio/percorso/esito
  senza illustrazioni letterali. `public/brand/paideio-mark-2026.png` isola la
  `P` per sidebar chiusa e favicon (`src/app/icon.png`,
  `src/app/apple-icon.png`). Non convertirli in SVG e non sostituirli con
  `PadelBallMark`.
- Motion rapida e causale: press, hover, ingresso route e loader-pallina;
  niente attese teatrali o loop ornamentali. Tutto si disattiva con
  `prefers-reduced-motion`. I reveal non possono mai portare il contenuto a
  `opacity: 0`: `ArenaMotionDirector` si riallinea a ogni pathname. Le route
  `loading.tsx` e le attese delle azioni interattive usano
  `FullScreenGameLoader`. La ricerca mobile usa uno Sheet Base UI accessibile.
- Accessibilità WCAG 2.2 AA anche in modalità giorno: testo normale ≥4.5:1,
  testo grande e contorni UI ≥3:1, focus sempre visibile e target interattivi
  minimi 44px. `GameRouteStage` riporta le navigazioni normali al top ma
  preserva gli hash; il layout contiene l’unico landmark `<main>`. L’hero
  dichiara senza metafore la ricerca e prenotazione di coach; `/chi-siamo`
  racconta paideia, metodo e servizio in tre atti con un solo motion
  esplicativo e fallback statico reduced-motion.

### Regola token: accenti su superfici che cambiano con il tema

I token `--game-ink`, `--game-blue`, `--game-cyan`, `--game-ball`, `--game-white`
sono **fissi**: non cambiano tra giorno e notte. Vanno usati **solo dove la
superficie è a sua volta fissa** (topbar, sidebar, bottom nav, sheet di
navigazione, hero `bg-game-ink`, sezioni `bg-game-blue`, `.net-texture`).

Su qualunque superficie tematizzata (`carta`, `carta-alta`, `carta-bassa`) usare
gli accenti *theme-aware* `accent-cyan-ink` / `accent-ball-ink` /
`accent-orange-ink`, **anche per bordi, pallini, barre e riempimenti**, non solo
per il testo. In modalità giorno il giallo pallina puro su fondo chiaro dà
1,15:1 e il ciano 1,8:1: bordi e indicatori di stato spariscono. Per il focus
usare `--vetro` (`focus-visible:outline-vetro`), mai `game-cyan`.

Corollari già applicati:
- `.malla-texture` è pensata per stare sopra superfici arena scure, quindi usa
  `--game-ink`/`--game-cyan` e non i token di tema. Con `--carta-alta` stendeva
  un velo chiaro sull’hero scuro in modalità giorno e il testo scendeva a
  3,45:1.
- I componenti usati su **entrambi** i tipi di superficie devono avere un fondo
  opaco: `GameBadge` usa `bg-carta-alta`/`bg-carta-bassa` con bordo e testo
  negli accenti ink, così regge sia sulle card chiare sia sull’header
  `bg-game-ink` di `booking-calendar`.
- Un riempimento pieno `bg-game-ball` su fondo chiaro ha bisogno di un contorno
  proprio: `.game-cta` lo risolve con l’ombra netta, altrove serve
  `border-game-ink` esplicito.

### La regola inversa: superficie fissa ⇒ testo fisso

Sopra c’è la regola “su superficie tematizzata usa accenti theme-aware”. Vale
anche al contrario, ed è quella che si era rotta: **se lo sfondo è un colore
FISSO, il testo che ci sta sopra deve essere fisso.** I colori fissi sono
`--ottico`, `--ruggine`, `--sabbia` e tutti i `--game-*`; quelli che cambiano
con il tema sono `--carta`, `--carta-alta`, `--carta-bassa`, `--calce`,
`--nebbia`, `--vetro` e i tre `--accent-*-ink`. Accoppiarli fa funzionare il
componente in una modalità sola su due, e il difetto passa inosservato perché
chi sviluppa sta quasi sempre in modalità notte.

Casi trovati e corretti (12 agosto 2026, misurati in entrambi i temi):

- Tutti gli `on-*` in `@theme inline` erano `var(--carta)` su sfondi fissi.
  `text-ball-foreground` e `text-on-secondary-fixed` sul giallo davano
  **1,01:1 di giorno** - il bottone “Salva profilo” era un rettangolo giallo
  vuoto. Ora `--color-ball-foreground`, `--color-on-secondary*`,
  `--color-on-tertiary*` e `--color-on-error*` puntano a `var(--game-ink)`
  (15,01:1 sul giallo, 6,32:1 sull’arancio, uguali nei due temi). Con lo stesso
  bug erano illeggibili il bottone “Conferma” di `booking-request-actions`, i
  badge traguardo e il contatore richieste in `coach-admin-nav`.
- `--secondary-foreground` era `--carta` su `--sabbia` fisso: 4,26:1 di giorno e
  3,42:1 di notte, sotto AA in entrambi. Ora `--game-white`, 4,79:1 fisso.
  **Attenzione**: esistono due definizioni parallele, `--color-secondary-*` in
  `@theme inline` (sorgente delle utility Tailwind) e `--secondary-*` in
  `:root` (sorgente delle variabili shadcn). Vanno cambiate a coppie -
  modificarne una sola non ha effetto sulle utility.
- `GameCta tone="danger"` usava `text-ruggine`, fisso, su superficie
  tematizzata: 2,13:1 di giorno (bottone “Rifiuta”). Ora
  `text-accent-orange-ink`, che è theme-aware; il riempimento in hover resta
  ruggine pieno con `game-ink` sopra.
- `GameCta tone="outline"` usa `--vetro`, corretto sulle superfici
  tematizzate ma **non** sulle arene fisse: in modalità giorno `--vetro` è un
  verdeazzurro scuro e su `.net-texture` scendeva a 2,32:1. Per quei casi c’è
  ora **`tone="arena"`** (`--game-cyan`, 8,51:1 di giorno e 9,75:1 di notte),
  usato in `home/coach-path.tsx`, `chi-siamo` e nell’`EditorialHero` di
  `/academy`. Non sostituire `outline` con `arena` ovunque: su una card chiara
  il ciano fisso scende a ~1,9:1.

Per verificare, non fidarsi dell’occhio in modalità notte: aprire la pagina in
modalità giorno e misurare. Nota per chi scrive script di audit: molti colori
calcolati escono in `oklab()` e le texture (`.net-texture`, `.paper-grain`)
dipingono il fondo con `background-image`, non con `background-color` - un
parser ingenuo produce una valanga di falsi positivi. Risolvere i colori
passandoli a un canvas 1×1 e comporre anche il primo layer di
`background-image` quando è un gradiente piatto.

### Navigazione mobile

`app-bottom-nav.tsx` è solo il guscio server (ruolo + contatore notifiche);
l’interfaccia sta in `mobile-nav.tsx` (client). Quattro schede - Home, Cerca,
una terza che cambia con il ruolo (Lezioni / Coach / Academy per gli anonimi) e
**Altro**, che apre uno Sheet Base UI con il resto della navigazione (Academy,
Circuito, Preferiti, Notifiche, Diventa coach, Il concept, Prossime release).
La regola è che **nessuna rotta sia raggiungibile solo dalla sidebar desktop**:
quando aggiungi una voce alla sidebar, aggiungila anche allo sheet. Lo stato
attivo è calcolato con `usePathname` e comprende le sottorotte; la scheda
"Altro" si accende quando la pagina corrente vive dentro lo sheet. Le voci dello
sheet sono `SheetClose` con `render={<Link/>}` e `nativeButton={false}`, così la
navigazione chiude il pannello.

Lo spazio per la barra fissa lo libera il **footer**, non `<main>`: in
`layout.tsx` il `<SiteFooter />` sta fuori da `<main>`, quindi è lui l'ultimo
elemento del flusso. `site-footer.tsx` usa
`pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-12` (3rem visivi + i 5rem
della barra); `<main>` ha solo `pt-16 md:pl-20`. Metterlo su `<main>` lasciava
il footer coperto per ~30px e in più apriva un vuoto tra contenuto e footer.
Se un giorno il footer diventa condizionale, la spaziatura va spostata su
qualunque elemento chiuda il flusso.

La topbar desktop non ha più il pay-off "Trova · Prenota · Gioca": restano solo
il logo (mobile) e le azioni. Le azioni usano `ml-auto` perché su desktop il
logo è nascosto e `justify-between` da solo le manderebbe a sinistra.

## Sistema archiviato "Agonistic Pulse" (dark-only, replica esatta export Stitch)

Terzo giro di design, storia completa perché è rilevante per capire perché il
sistema è fatto così:
1. Tema chiaro/lime originale → giudicato "generico da SaaS".
2. Rifacimento dark "Agonistic Pulse" con font `Anybody` scoreboard
   (maiuscolo/`font-black`) + palette oklch inventata da me → l'utente ha
   detto di preferire di gran lunga l'export di **Google Stitch** (stesso
   brief, generato indipendentemente) e di **rifare il sito identico a
   quello**, screenshot alla mano (5 schermate: home, ricerca coach, profilo
   coach, dashboard coach, le mie prenotazioni - cartella
   `stitch_paideio_padel_coaching_marketplace/*/code.html` fuori dal repo,
   in `~/Downloads`, tenuta come riferimento durante l'implementazione).
3. **Stato attuale**: porting 1:1 dei token colore/tipografia esatti letti
   dai `code.html` di Stitch, poi ricostruiti con i componenti reali
   (non è più un'interpretazione libera - i valori sotto sono quelli
   dell'export, non vanno "migliorati" senza che l'utente lo chieda di
   nuovo). Un dettaglio del tentativo 2 **è tornato utile** ed è stato
   riusato: il font `Anybody` corsivo/maiuscolo per i titoli - Stitch lo
   usa a sua volta, quindi coincide.

- **Tema giorno/notte** senza dipendenze: il giorno è il default
  `Court Daylight` azzurro ghiaccio; `.dark` attiva l’arena notturna.
  `theme-toggle.tsx` salva la preferenza in `localStorage` e lo script inline
  in `layout.tsx` la applica prima del paint. `ui/sonner.tsx` segue il tema.
  Sul tema giorno, per testo e icone su superfici chiare usare
  `text-accent-cyan-ink`, `text-accent-ball-ink` e
  `text-accent-orange-ink`; i corrispondenti `text-game-*` brillanti sono
  riservati alle superfici scure.
- **Font**, esattamente come nell'export Stitch (`next/font/google` in
  `layout.tsx`, nomi letterali in `@theme inline` - mai `var()` diretto,
  stesso pattern del bug Geist):
  - `Anybody` → `--font-heading`. Titoli **maiuscoli e/o corsivi**
    (`uppercase italic`), pesante (`font-black`/800-900) per i momenti
    "scoreboard" (hero, nomi coach, "Bentornato Coach"). Il logo/wordmark è
    sempre "PAIDEIO" - mai "Paideia" (quello è il termine greco del
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
    uppercase), `body-lg` (18px), `body-md` (16px) - usarle come
    `text-headline-lg` ecc., non reinventare dimensioni ad-hoc per i titoli.
- **Palette M3 esatta** (Material Design 3 color roles, nomi e valori hex
  presi identici dai `code.html` di Stitch, registrati in `globals.css` sia
  come token raw (`--primary-container`, `--surface-container-high`, ecc.)
  sia come utility Tailwind via `@theme inline` - si può scrivere
  `bg-primary-container`, `text-on-surface-variant`, `border-outline-variant`
  ecc. **esattamente come nell'HTML di Stitch**, non tradurre a mano):
  - `background`/`surface` `#111316` → base più scura; `surface-container-*`
    (lowest → highest, 5 livelli) per superfici via via più chiare salendo
    di elevazione (card, sidebar, pannelli).
  - `on-surface` `#e2e2e6` (testo principale), `on-surface-variant`
    `#c3c5d9` (testo secondario), `outline`/`outline-variant` per bordi.
  - `primary` `#b6c4ff` (blu periwinkle chiaro - testo/icone/bottoni
    "normali", è il valore di `--primary` shadcn) vs `primary-container`
    `#0057ff` (blu acceso pieno - blocchi CTA ad alto impatto, es. sezione
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
- `--radius: 0.5rem` (non più zero) - Stitch usa arrotondamenti moderati
  (`rounded-lg`/`rounded-full`) mescolati a tagli `clip-path` netti per gli
  elementi ad alto impatto. Non tornare a zero-radius globale.
- Utility decorative in `globals.css` (`@layer utilities`), nomi presi da
  Stitch - riusare, non reinventare varianti:
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
  - `.cut-cta` / `.cut-corner` → **rimossi** (erano gli alias del tentativo
    2). Tutte le pagine sono state riportate 1:1 su Stitch (vedi "Round
    completamento design system" più sotto); non reintrodurli - per i
    bottoni CTA usare `.neo-shadow bg-secondary-fixed` (o `bg-ball`/alias),
    per i contenitori `.card-clip`.
- **Shell dell'app cambiata**: non più header in cima soltanto. Ora
  `src/components/app-topbar.tsx` (barra fissa in alto, solo logo + notifica
  + profilo) + `src/components/app-sidebar.tsx` (sidebar fissa a sinistra,
  desktop, `w-64`, nav + CTA in fondo - usa `src/components/sidebar-nav.tsx`,
  client, per lo stato attivo via `usePathname`) + `src/components/
  app-bottom-nav.tsx` (barra fissa in basso, mobile, 4 icone). `layout.tsx`
  applica `md:pl-64 pt-16 pb-24 md:pb-0` al `<main>` per lo spazio della
  sidebar/barre fisse. `site-header.tsx` e `mobile-nav.tsx` **rimossi**,
  sostituiti da questi tre. (Nota: `mobile-nav.tsx` esiste di nuovo oggi, ma è
  un file diverso - vedi "Navigazione mobile" nel design system corrente.)
  `site-footer.tsx` ha la fascia inclinata
  `-skew-y-1` con `md:pl-64` per allinearsi alla sidebar.
- `src/components/coach-avatar.tsx` → **tornato circolare** (`rounded-full`,
  non più parallelogramma): Stitch usa cerchi ovunque per gli avatar
  (profilo, card ricerca, richieste dashboard). Palette gradient in
  `PALETTE` allineata ai toni M3 (`primary-container`, `tertiary-container`,
  `secondary-fixed-dim`).
- **Niente fotografie reali**: l'export di Stitch usa foto AI-generate
  ospitate su URL temporanei Google (`lh3.googleusercontent.com/aida-public/
  ...`) - non riusabili in produzione (non stabili, probabilmente non
  licenziate per embedding permanente). Ovunque Stitch aveva una foto (hero,
  card coach, sfondo profilo) qui c'è un blocco gradiente/texture al suo
  posto (stesso spazio/proporzioni, stesso mood cromatico). Se in futuro
  arrivano foto vere (coach reali via `avatarUrl` esistente, o asset del
  brand), vanno agganciate in quegli stessi punti - non è un placeholder da
  "completare con altro stile", è la stessa griglia in attesa dell'immagine.
- Bottoni "ball" invariati:
  `className="bg-secondary-fixed font-mono text-label-caps text-on-secondary-fixed uppercase"`
  (o l'alias `bg-ball`/`text-ball-foreground`, stesso colore) - nessuna
  variant dedicata in `button.tsx`, per non toccare il file vendored shadcn.
- **Icone proprietarie Paideio**: Lucide è stato rimosso. Le 56 forme
  originali sono PNG trasparenti in `public/design/icons`, generate in modo
  deterministico da `scripts/generate-paideio-icons.mjs`. Il runtime
  `components/icons/paideio-icons.tsx` le applica come CSS mask, così
  ereditano `currentColor`, dimensioni e stati hover/focus senza introdurre
  SVG nel markup. I nomi canonici stanno in `paideio-icon-names.ts`; gli
  alias semantici compatibili con i componenti esistenti nel runtime. Non
  reintrodurre `lucide-react`: per una nuova icona aggiungere il glifo al
  generatore, rigenerare i PNG e registrare nome/alias. Catalogo completo in
  `/design-system`.

## Micro-interazioni e tono "vissuto" (playful pass)

- Animazioni keyframe in `globals.css`: `animate-ball-bounce` (rimbalzo con
  squash/stretch), `animate-ball-shadow` (ombra sincronizzata, stesso
  timing), `animate-pop-in`. Tutte disabilitate sotto
  `prefers-reduced-motion: reduce`.
- `Button` (`components/ui/button.tsx`) ha un leggero "schiacciamento" al
  click (`active:scale-[0.97]`) oltre al `translate-y-px` originale di
  shadcn - voluto, non rimuovere.
- Toast (`sonner`, componente `ui/sonner.tsx`) + coriandoli
  (`src/lib/confetti.ts`, `canvas-confetti`) sostituiscono gli `Alert`
  statici per il feedback di successo su: prenotazione richiesta
  (`booking-calendar.tsx`), conferma/rifiuto prenotazione
  (`booking-request-actions.tsx`), annullamento (`cancel-booking-button.tsx`),
  aggiunta campo/orario e salvataggio profilo coach. `Toaster` segue il tema
  attivo; il cambio giorno/notte è gestito senza `next-themes`.
- Copy a tema padel nei messaggi di feedback e negli stati vuoti (es. "Palla
  a rete!" quando la ricerca non trova risultati, "Fuori campo!" nella 404
  in `not-found.tsx`, messaggi di successo prenotazione randomizzati in
  `SUCCESS_MESSAGES` in `booking-calendar.tsx`) - mantenere questo tono
  quando si aggiungono nuovi stati vuoti/di successo, non tornare a un tono
  neutro "di sistema".

## Capienza slot e prenotabilità

Uno slot-istanza è la terna concreta *giorno + campo + fascia oraria*. La regola
che decide cosa è ancora prenotabile sta in **un solo posto**,
`computeSlotOccupancy()` in `src/lib/constants.ts`, usata sia da
`getCoachCalendar()` (per disegnare il calendario) sia da `createBooking()` (per
validare). Se le due divergono, il calendario mostra prenotabile qualcosa che
l'action poi rifiuta: tenerle sulla stessa funzione è il punto.

- Una lezione **singola** occupa il campo in esclusiva: nessun altro entra,
  nemmeno come gruppo.
- Le lezioni di **gruppo** condividono lo slot fino a
  `coachProfiles.groupCapacity` (configurato dal coach in
  `/coach-admin/profilo`, default 4, limiti `MIN_GROUP_CAPACITY`/
  `MAX_GROUP_CAPACITY`). Raggiunta la capienza lo slot sparisce dalle
  disponibilità.
- Uno slot già aperto come gruppo **resta** di gruppo: non ci si può mettere
  sopra una singola.
- Rifiutate e annullate non occupano posto: annullare libera immediatamente.

Difese, dal più esterno al più interno:
1. `booking-calendar.tsx` disabilita gli slot pieni e restringe il selettore
   "tipo di lezione" a `slot.availableTypes`;
2. `createBooking()` ricontrolla dentro una transazione - la UI può essere
   stantia;
3. due indici unici parziali su `bookings`: `bookings_active_single_slot_idx`
   (una sola singola attiva per slot) e `bookings_active_player_slot_idx` (un
   giocatore non prende due posti nella stessa lezione).

**La capienza di gruppo non è esprimibile come indice unico.** Due richieste
concorrenti leggerebbero entrambe "3 di 4" e inserirebbero, arrivando a 5. Per
questo `createBooking()` apre la transazione con
`pg_advisory_xact_lock(hashtextextended(<chiave slot>, 0))`: serializza tutti
gli scrittori su quello slot e si rilascia da solo a commit o rollback. Non
sostituirlo con un semplice `SELECT count(*)`: il lock è ciò che rende corretto
il conteggio.

## Chiusure del calendario (eccezioni alla ricorrenza)

I turni in `availability_slots` sono **ricorrenti settimanali**: "ogni lunedì
18-19". Serviva poter dire "questo lunedì no" senza smontare la ricorrenza, da
cui la tabella **`availability_closures`** (12 agosto 2026).

- `locationId`/`startTime`/`endTime` valorizzati → chiude quella singola
  istanza (giorno + campo + fascia).
- tutti e tre `null` → chiude l'**intera giornata**, compresi i turni
  pubblicati *dopo* la chiusura.
- Una chiusura **non tocca** `availability_slots`: la ricorrenza resta intatta
  e riaprire è una `DELETE`, non una ricostruzione.

Come per la capienza, la regola sta in **un solo posto**: `closureKey()` e
`isSlotClosed()` in `constants.ts`, usate sia dal calendario sia dall'action.
La chiave di una chiusura giornaliera è `<data>|*|*`, ed è per questo che copre
anche i turni futuri. Se le due strade divergono, il giocatore prenota una data
che il coach ha chiuso.

Difese, dal più esterno al più interno:
1. `buildCoachSchedule()` in `queries.ts` genera le istanze concrete annotate;
   `getCoachCalendar()` **scarta** le chiuse (il giocatore non le vede),
   `getCoachSchedule()` le **tiene** (il coach deve poterle riaprire). Stessa
   sorgente apposta.
2. `createBooking()` ricontrolla **dentro l'advisory lock**, insieme alla
   capienza: la UI può essere stantia.
3. Due indici unici parziali, `availability_closures_day_idx` (dove
   `location_id IS NULL`) e `availability_closures_slot_idx` (dove non lo è).
   Servono due indici separati perché in Postgres i NULL sono distinti tra
   loro: un indice unico solo su colonne nullable lascerebbe passare chiusure
   giornaliere duplicate.

**Chiudere una data annulla le prenotazioni attive che ci stanno sopra**, nella
stessa transazione, con notifica al giocatore e al coach. Bloccare la chiusura
sarebbe inutile proprio nel caso che serve (il coach sa già che non ci sarà), e
lasciare le prenotazioni in piedi creerebbe lezioni fantasma. `closeAvailability
Date()` ritorna quante ne ha annullate, e la UI lo dice nel `confirm()` prima di
procedere. La riapertura **non** le ripristina: sono già state comunicate come
annullate.

`getCoachClosedDays()` esiste per un caso preciso: una giornata chiusa in cui
non c'è nessun turno ricorrente non produrrebbe istanze, sparirebbe
dall'interfaccia e non sarebbe più riapribile.

Test: `npm run test:chiusure` (stesso Postgres usa-e-getta di
`test:capienza`, istruzioni in testa allo script).

## Notifiche prenotazioni

- `notifications` conserva notifiche in-app per giocatore e coach, collegate
  opzionalmente a una prenotazione. La campanella in `AppTopbar` mostra il
  contatore non letto e porta a `/notifiche`.
- `createBooking` crea atomicamente la prenotazione e due notifiche
  `booking_created`, una per ruolo. L’annullamento crea due notifiche
  `booking_cancelled` nella stessa transazione che aggiorna lo stato.
- L’annullamento dal lato giocatore passa sempre da un `AlertDialog` Base UI
  esplicito; nessuna cancellazione può partire dal primo click.
- Le mutazioni notifiche invalidano il root layout con
  `revalidatePath("/", "layout")`, così il contatore della campanella si
  aggiorna immediatamente.

### Conferme: `ConfirmDialog`, mai `window.confirm()`

`src/components/confirm-dialog.tsx` è la conferma canonica del prodotto,
costruita sull’`AlertDialog` Base UI già usato da `CancelBookingButton`. Il
dialog nativo del browser non rispetta il tema, non permette di evidenziare la
conseguenza distruttiva e su iOS mostra il dominio in cima: **non
reintrodurlo**. Al 12 agosto 2026 non resta nessun `window.confirm()` nel
codice - rimozione di turno, rimozione di campo e le due chiusure calendario
passano tutte da qui.

- `onConfirm` ritorna un booleano: `true` chiude il dialog, `false` lo lascia
  aperto perché l’utente legga l’errore nel toast. Le funzioni chiamate devono
  quindi ritornare l’esito, non limitarsi a lanciare un toast.
- `warning` è il riquadro per la conseguenza irreversibile (quante lezioni
  verranno annullate, che il cascade cancella anche i turni). Va usato per il
  danno collaterale, non per ripetere il titolo.
- **Il bottone di conferma è neutro, mai rosso.** Il rosso significa errore o
  allarme; qui l’utente sta facendo una cosa che ha scelto di fare, spesso
  reversibile. Usa `variant="default"` (`--vetro` su `--carta`: 5,45:1 di
  giorno, 9,82:1 di notte, i due token cambiano tema insieme). Da non
  confondere con `variant="destructive"` di shadcn, che oltre a essere rosso è
  un riempimento al 10-20% con testo `--destructive` e di notte dà 3,91:1.
  Stessa scelta in `CancelBookingButton`.
- Il rischio lo comunicano i **due riquadri**, non il colore del pulsante:
  `reassurance` (ciano, icona `History`) dice come si torna indietro,
  `warning` (arancio, icona `AlertTriangle`) dice cosa si perde. Le chiusure
  calendario hanno solo il primo, la rimozione di un campo solo il secondo, la
  rimozione di un turno il primo con il rimando alla chiusura. Affidare il
  segnale al solo colore è debole comunque: meglio dire *cosa* succede.
- I titoli sono in seconda persona e nominano l’oggetto - “Vuoi davvero
  chiudere questo slot?”, non “Chiudere…?”.
- Il `trigger` è un `Button` reale, quindi **non** va `nativeButton={false}`
  (vedi “Note Base UI”).

## Riepilogo prenotazioni giocatore

- `/prenotazioni` delega la parte interattiva a
  `src/components/player-bookings-overview.tsx`. I dati restano caricati nel
  Server Component e vengono passati al client come sommario serializzabile.
- Filtri disponibili: periodo (`prossime`, `passate`, `tutte`), stato e formato
  (`singolo`/`gruppo`). Le lezioni passate sono ordinate dalla più recente.
- Tre viste condividono lo stesso dataset filtrato: `Lista` per gestione,
  `Calendario` mensile per orientamento temporale e `Agenda` raggruppata per
  giorno. Annullamento e recensione restano disponibili nelle viste operative;
  il calendario è deliberatamente compatto e solo informativo.

## Roadmap e feedback prodotto

- `/prossime-release` presenta le evoluzioni previste senza date o promesse
  inventate e raccoglie proposte/bug tramite `ReleaseFeedbackForm`.
- `submitProductFeedback` valida, limita a 5 invii giornalieri per email,
  applica un honeypot e salva sempre in `product_feedback`.
- L’email è best-effort e parte solo con `RESEND_API_KEY` e
  `FEEDBACK_RECIPIENT_EMAIL`; il mittente previsto è
  `feedback@playpaideio.com`. La casella istituzionale corretta è
  `info@playpaideio.com` perché `paideio.com` non appartiene al progetto.
  Setup completo in `docs/EMAIL-SETUP.md`.

## Flussi operativi player e coach

- `src/components/booking-calendar.tsx` è un flusso guidato in tre momenti:
  giorno/orario, dettagli dell’allenamento, riepilogo e invio. Mostra soltanto
  disponibilità reali, chiarisce che non avviene alcun pagamento e che il coach
  deve confermare. Mantenere il riepilogo prima dell’azione finale, i controlli
  accessibili e il limite note a 500 caratteri.
- Le card di `/cerca` sono righe comparative con prezzo e CTA `Prenota` diretta
  a `/coach/[id]#prenota`. Sul profilo il booking è una sezione centrale
  full-width immediatamente dopo l’hero, non una sidebar. Il target hash usa
  `BookingHashScroll` perché il contenuto server può arrivare dopo il tentativo
  di scroll nativo. Per visitatori anonimi il passo finale apre Clerk con
  “Accedi e prenota”; per i player mostra “Invia richiesta”.
- `/coach-admin` è la control room del coach: calcola dal database la reale
  completezza di profilo, campi e disponibilità, propone il prossimo passo e
  consente di aprire il profilo pubblico. Le schermate di configurazione
  spiegano l’effetto delle modifiche, raggruppano gli orari per giorno e
  chiedono conferma prima di rimuovere campi o turni.
- La sidebar desktop resta una rail compatta da 80px e non si espande sopra i
  contenuti; le etichette appaiono come tooltip. I `devIndicators` Next sono
  disabilitati per non sovrapporre il pulsante dev alla rail durante i test.

### Le cinque schede coach devono stare tutte nello schermo

`coach-admin-nav.tsx` è una **griglia a 5 colonne** (icona sopra etichetta,
`text-[10px]`, `hyphens-auto`) sotto `md`, e torna alla riga di tab classica da
`md` in su. Prima era una sola riga `overflow-x-auto`: a 390px i tab misuravano
519px in 342px disponibili, quindi **"Orari" e "Richieste" restavano fuori
schermo** e su iOS, dove la scrollbar non si vede, erano di fatto
irraggiungibili. È il motivo per cui il primo coach reale ha compilato solo
Profilo e non ha mai pubblicato disponibilità. Se aggiungi una scheda, verifica
che tutte restino visibili a 320px e non introdurre di nuovo lo scroll
orizzontale senza affordance.

### `revalidateCoachSurfaces()`

Campi, turni e profilo alimentano **cinque superfici**: la checklist di
`/coach-admin`, `/coach-admin/campi`, `/coach-admin/orari`, il profilo pubblico
`/coach/[id]` e `/cerca`. Le action in `actions/coach-admin.ts` rivalidavano
solo la scheda da cui partiva la modifica, così un turno appena pubblicato non
compariva né nella checklist né lato giocatore. Usare l'helper
`revalidateCoachSurfaces(coachId)` per qualunque nuova mutazione del coach,
invece di un singolo `revalidatePath`.

### Nessun vicolo cieco su `/coach-admin/orari`

Un turno è sempre legato a un campo, ma la pagina Orari non può limitarsi a
dire "vai prima alla scheda Campi": quando `locations` è vuoto rende inline
`<LocationManager initialLocations={[]} />`, così il primo campo si crea senza
cambiare pagina e la rivalidazione riporta subito il form dei turni. Vale la
regola generale: uno stato vuoto che dipende da un altro passo deve offrire
quel passo, non solo nominarlo.

Nota: `locations` ha `onDelete: "cascade"` verso `availability_slots`, quindi
rimuovere un campo cancella anche i suoi turni - il `confirm()` in
`location-manager.tsx` lo dice esplicitamente.

### Un coach senza turni non compare in ricerca

`searchCoaches()` scarta i coach senza nessuna riga in `availability_slots`
(`loadCoachIdsWithAvailability()`, una query sola per tutta la ricerca).
Mostrarli portava il giocatore su un calendario vuoto dopo aver premuto
"Prenota". La soglia è **almeno un turno settimanale configurato**, non "almeno
uno slot libero": un coach tutto esaurito resta in ricerca, come dev'essere.

Le conseguenze, da tenere allineate se tocchi una di queste superfici:

- `/coach/[id]` resta pubblico e raggiungibile da link diretto e dai preferiti.
  Con `calendar.length === 0` la CTA dell'hero e lo stato vuoto del
  `BookingCalendar` diventano **"Salva tra i preferiti"**, e il titolo della
  sezione dice "Non ancora prenotabile" invece di promettere una prenotazione.
- `getFavoriteCoaches()` **non** applica il filtro: un preferito salvato prima
  che il coach aprisse il calendario deve restare consultabile - è l'unico modo
  per ritrovarlo. La card mostra "Non ha ancora pubblicato orari".
- `/coach-admin` avverte il coach che finché non pubblica un turno non compare
  in ricerca. Senza quell'avviso l'unico segnale sarebbe il silenzio.
- `FavoriteButton` prende `viewerRole` (non più `isPlayer`) e ha due varianti:
  `icon` (il cuoricino) e `cta` (bottone etichettato). Per i visitatori anonimi
  apre il modale Clerk `SignInButton` invece di sparire: prima il salvataggio
  era invisibile finché non avevi già un account, il che rendeva impossibile
  usarlo come CTA principale. Per i coach resta nascosto, perché
  `toggleFavorite()` accetta solo i player.

## Academy didattica e asset

- `/academy` e le sottopagine usano moduli didattici riutilizzabili da
  `src/components/academy/academy-ui.tsx`: obiettivo, principio, esercizio,
  verifica, progressione e CTA al passo successivo. Evitare pagine composte
  soltanto da liste.
- Semantica cromatica: ciano per informazione, giallo pallina per suggerimenti,
  arancio/rosso esclusivamente per errori, rischi o indicazioni di stop.
- La famiglia PNG RGBA `/public/design/game/academy/` comprende split step,
  cinesini, elastici, cambio di direzione, borraccia, lavagnetta tattica,
  forme delle racchette e posizioni in campo. Sono registrati in
  `src/components/design/field-assets.tsx`; sorgenti e prompt sono in
  `design/assets-comic/`.

## Academy e circuito editoriale

- `/academy` è l’hub “Read” del prodotto, con sezioni navigabili
  `/academy/tecnica`, `/strategia`, `/regole`, `/training`,
  `/attrezzatura`, `/storia-cultura`. I contenuti portano sempre dal capire
  al campo e poi alla ricerca coach, senza sembrare un blog separato.
- `/circuito` raccoglie `/classifiche`, `/calendario` e
  `/come-funziona-il-ranking`. La dicitura corretta è “Classifica mondiale
  FIP”: Premier Padel e CUPRA FIP Tour contribuiscono allo stesso ranking.
- Dati dinamici e normativa mostrano sempre fonte e data di verifica. Le
  regole base usano FIP 2026; i regolamenti FITP delle manifestazioni sono
  distinti. Le classifiche correnti sono snapshot editoriali, non feed live.
- Componenti condivisi in `src/components/editorial-layout.tsx`; tassonomia
  in `src/lib/editorial-content.ts`. Academy e Circuito sono presenti nella
  sidebar e lo stato attivo comprende le sottorotte.

## Convenzioni

- Tutti i testi UI in italiano.
- Date "solo giorno" (`YYYY-MM-DD`): usare `toLocalDateString()` in
  `constants.ts`, mai `date.toISOString().slice(0,10)` (sfasa di un giorno nei
  fusi UTC+, bug reale già corretto una volta).
- Un booking = uno slot settimanale intero del coach (no sotto-slot orari); il
  coach conferma/rifiuta manualmente.

## Comandi

- `npm run dev` - dev server
- `npm run db:seed` - resetta e ripopola il database demo (`dotenv -e
  .env.local --` davanti: né `tsx` né `drizzle-kit` caricano `.env.local` da
  soli, vedi skill `vercel-storage`)
- `npm run db:push` - applica lo schema Drizzle al database (stessa nota sul
  dotenv, già nello script)
- `npm run test:capienza` / `npm run test:chiusure` - test end-to-end contro un
  Postgres usa-e-getta (istruzioni in testa agli script in `scripts/`)
- `npm run build` - build di produzione

## Dati demo

Il seed crea tre coach pubblici (Elena Ferraro, Davide Conti, Giulia Romano),
due giocatori sintetici e scenari completi: richiesta pendente, confermata
futura, completata con recensione, annullata e preferito. Nessuno è collegato
a Clerk (`clerkId` null). Per provare il flusso giocatore/coach vero,
registrati con Clerk (bottone "Registrati") e usa "Diventa coach" da
`/diventa-coach` per passare al ruolo coach.

**Attenzione**: sviluppo locale e produzione condividono lo stesso database
Neon (vedi sezione Stack). Il seed scrive quindi anche in quello che gli
utenti reali vedono. La produzione è stata deliberatamente lanciata **vuota**
(nessun dato demo, vedi sezione "Deploy in produzione") - se rilanci il seed
per testare in locale, ricordati di ripulire prima di considerare la cosa di
nuovo "live" per davvero, oppure crea un branch Neon dedicato allo sviluppo
(vedi "Stato e prossimi passi").

`npm run db:seed` è **sicuro da rilanciare**: cancella solo gli utenti con
`clerkId` nullo (i coach demo), mai gli account Clerk reali collegati
durante i test. In passato faceva `db.delete(users)` su tutta la tabella -
corretto perché avrebbe cancellato anche gli utenti reali ad ogni reseed. Se
tocchi `seed.ts`, mantieni il filtro `isNull(users.clerkId)`.

**Stato produzione al 26 luglio 2026**: pulizia completata. Restano 0 utenti
demo (`clerkId` nullo), 1 account Clerk reale e 0 booking, recensioni,
preferiti, notifiche o feedback di test. Runbook:
`docs/PRODUCTION-HANDOFF.md`.

Nel reset QA del 26 luglio 2026 l’account coach Clerk corrente è stato
eliminato dalla sola tabella locale e riprovisionato automaticamente come
`player`; l’identità Clerk non è stata cancellata. Questo consente di ripetere
il percorso reale `/diventa-coach`.

## Deploy in produzione

Live su **https://playpaideio.com** (dominio proprio, registrato tramite
Vercel - `paideio.com` non era disponibile, da cui il nome scelto; alias
anche su `https://paideio.vercel.app`). Progetto Vercel
`sharilennartz1994s-projects/paideio`, deploy manuale via `vercel --prod` -
il collegamento Git per il deploy automatico su push a `main` non è ancora
attivo, vedi sotto. Database Postgres su Neon, provisionato tramite Vercel
Marketplace (`vercel integration add neon`, richiede accettazione termini
via browser la prima volta).

**Clerk è in produzione vera** (non più chiavi `pk_test_`/`sk_test_`):
istanza production creata dalla dashboard Clerk, dominio `playpaideio.com`
verificato via 5 record CNAME aggiunti su Vercel DNS (`vercel dns add`,
il DNS di `playpaideio.com` è gestito da Vercel quindi niente registrar
esterno da toccare):
- `clerk` → `frontend-api.clerk.services`
- `accounts` → `accounts.clerk.services`
- `clkmail` → `mail.<id>.clerk.services`
- `clk._domainkey` → `dkim1.<id>.clerk.services`
- `clk2._domainkey` → `dkim2.<id>.clerk.services`

Le chiavi `pk_live_`/`sk_live_` sono impostate **solo sull'ambiente
Production** di Vercel (`vercel env add ... production`) - Preview e
Development restano sulle chiavi dev, perché i deploy Preview girano su
sottodomini `*.vercel.app` che l'istanza production di Clerk non riconosce
come dominio verificato.

**Nota da non dimenticare se un deploy resta bloccato su "Building…" senza
log**: non è detto sia la build. `vercel --prod` legge i metadati
dell'autore dell'ultimo commit Git locale e Vercel **blocca silenziosamente
il deploy** (mostra "Deployment Blocked" solo nella dashboard web, non in
CLI) se quell'email non corrisponde a un account GitHub verificato - es. se
`git config user.email` non è mai stato impostato, git genera un'email
placeholder tipo `utente@hostname.local` che fa scattare il blocco. Prima
di sospettare un problema di build/codice, controlla la dashboard
(`https://vercel.com/<team>/<progetto>/deployments`, apri il deploy
bloccato) per un banner "Deployment Blocked" / "Fix Git Configuration".

**Limitazioni note ancora aperte**:
- Il driver emette un warning preventivo sulla futura semantica di
  `sslmode`; prima di `pg` 9 impostare esplicitamente
  `sslmode=verify-full` nella connection string Neon. Vedi
  `docs/PRODUCTION-HANDOFF.md`.
- **Un solo database Neon condiviso** tra sviluppo locale e produzione
  (nessun branch dedicato) - vedi "Dati demo" sopra per le implicazioni
  pratiche. Da separare con un branch Neon prima che ci siano utenti reali
  che contano.
- **Deploy manuale via CLI**, non collegato a GitHub: `vercel git connect`
  ha fallito con "Make sure ... you have access to the repository" perché
  la GitHub App di Vercel non ha ancora accesso al repo privato
  `sharilennartz1994s-projects/paideio` - va concesso dalla dashboard
  GitHub (Settings → Integrations → Vercel) o rifacendo `vercel git connect`
  dopo aver installato/autorizzato l'app sul repo. Una volta collegato, ogni
  push su `main` farà deploy automatico e questa nota va rimossa.
- **Pagamenti**: ancora assenti, nessuna decisione presa (vedi sotto).

## Stato e prossimi passi noti

- [x] Autenticazione reale con Clerk - vedi sezione Stack. Login/registrazione
      demo (`/accedi`, cookie stub) rimossi definitivamente. Nota: `proxy.ts`
      usa `createRouteMatcher`, che Clerk segnala come deprecato a favore di
      controlli a livello di singola pagina/route - qui è comunque affiancato
      da controlli di ruolo espliciti in `coach-admin/layout.tsx` e
      `prenotazioni/page.tsx`, ma se Clerk rimuove l'API andrà migrato (vedi
      https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrate-from-create-route-matcher)
- [x] Ricerca coach per posizione/geolocalizzazione - `haversineDistanceKm()` in
      `constants.ts`, filtro `near` in `searchCoaches()`, bottone
      `UseMyLocationButton`. `locations.lat/lng` nullable: i coach le impostano
      da `coach-admin/campi` rilevando la posizione del dispositivo (nessuna
      chiave di geocoding usata). Location senza coordinate non compaiono nella
      ricerca "vicino a me" ma restano cercabili per città.
- [x] Rifinitura design e responsività mobile - vedi sezione Design system
      per la shell attuale (sidebar/topbar/bottom-nav); pannello prenotazione
      riordinato sopra il calendario su mobile e `sticky` su desktop
- [x] Migrazione da SQLite locale a Postgres (Neon) + primo deploy in
      produzione - vedi sezione "Deploy in produzione" per URL e limitazioni
      note (Clerk ancora su chiavi dev, DB condiviso dev/prod, deploy manuale
      non ancora collegato a Git)
- [x] Refactor Server Action da `throw` a `ActionResult` strutturato
      (`src/lib/action-result.ts`) - senza questo, in produzione Next.js
      oscura tutti i messaggi di errore lanciati da una Server Action
      mostrando un generico "An error occurred"; ora i messaggi italiani di
      validazione/permessi/limiti arrivano intatti al client. Tocca tutte le
      action in `lib/actions/*` e i relativi client caller. `becomeCoach()`
      passato a `useActionState` (vedi `become-coach-form.tsx`) perché è
      legato a un `<form action={...}>` diretto.
- [ ] Decisione su integrazione pagamenti (al momento assente). Prerequisito:
      branch Neon dedicato (punto sotto), per non far transitare pagamenti
      reali sul DB condiviso con lo sviluppo locale.
- [ ] Branch Neon dedicato allo sviluppo locale, separato dalla produzione
      (oggi condividono lo stesso database - vedi "Dati demo" e "Deploy in
      produzione")
- [x] Database in Unione europea - progetto `paideio-eu` a Francoforte
      (`aws-eu-central-1`) dal 28 luglio 2026. La regione non è modificabile:
      è stato creato un progetto nuovo e i dati sono stati travasati con
      `scripts/db-dump.mts` / `scripts/db-restore.mts`. Il vecchio progetto
      `us-east-1` è stato eliminato.
- [x] Termini di servizio e informativa privacy (`/termini`, `/privacy`),
      collegati dal footer. Restano marcati come bozza non validata finché
      un legale non conferma tempi di conservazione e tenuta della manleva.
- [x] Capienza reale per le lezioni di gruppo - vedi la sezione "Capienza slot
      e prenotabilità". `coachProfiles.groupCapacity` configurabile dal
      coach, regola condivisa in `computeSlotOccupancy()`, indici parziali
      rifatti e advisory lock in `createBooking`. Test: `npm run test:capienza`.
- [x] Chiusure del calendario: il coach può togliere una data precisa (un
      turno o l'intera giornata) senza smontare la ricorrenza - vedi la
      sezione "Chiusure del calendario". Test: `npm run test:chiusure`.
- [ ] Policy di cancellazione: oggi un giocatore può annullare una
      prenotazione `confermata` in qualsiasi momento, senza finestra minima
      né conseguenze per il coach che ha bloccato lo slot.
- [ ] Collegare il repo GitHub a Vercel per il deploy automatico su push a
      `main` (oggi richiede `vercel --prod` manuale - vedi "Deploy in
      produzione" per il motivo)
- [x] Dominio personalizzato (`playpaideio.com`, comprato tramite Vercel -
      "paideio.com" non era libero) + istanza Clerk di produzione con DNS
      verificato - vedi "Deploy in produzione" per i dettagli
- [x] Pagina concept (`/chi-siamo`) - perché il nome "Paideio" (dal greco
      antico παιδεία), collegata da footer (`site-footer.tsx`, nuovo, presente
      su ogni pagina via `layout.tsx`) e da una sezione teaser in home
- [x] Recensioni e voti coach (tabella `reviews`, `actions/reviews.ts`,
      `star-rating.tsx`) - un giocatore può recensire solo prenotazioni
      `confermata` con data passata, una recensione per prenotazione. Media
      calcolata in JS su tutte le review del coach (dataset piccolo, non serve
      SQL aggregate). Il prompt "Lascia una recensione" appare in
      `/prenotazioni` (`getBookingsForPlayer` calcola `canReview`/`isReviewed`)
- [x] Coach preferiti (tabella `favorites`, unique su `(playerId, coachId)`,
      `actions/favorites.ts`, `favorite-button.tsx`) - nuova pagina protetta
      `/preferiti`, aggiunta a `proxy.ts`
- [x] Traguardi giocatore (`getPlayerAchievements` in `queries.ts`,
      `achievements-panel.tsx`, mostrato in cima a `/prenotazioni`) - calcolati
      al volo dalle prenotazioni confermate passate, nessuna tabella dedicata:
      soglie di lezioni completate, "fedelissimo" (3+ con lo stesso coach),
      streak di settimane consecutive con almeno una lezione
- [x] Foto profilo coach reali (`coachProfiles.avatarUrl`, `@vercel/blob`,
      `avatar-upload.tsx`, action `updateCoachAvatar`). Progetto collegato a
      Vercel (`sharilennartz1994s-projects/paideio`) con Blob store pubblico
      `paideio-avatars` - `BLOB_READ_WRITE_TOKEN` già in `.env.local` (girato
      con `vercel blob create-store ... --access public`, non serve rifarlo).
      `CoachAvatar` accetta `src` opzionale e mostra la foto reale se
      presente, altrimenti iniziali colorate come prima. Dominio
      `**.public.blob.vercel-storage.com` whitelistato in `next.config.ts`
      per `next/image`.
- [x] Redesign "Agonistic Pulse" - vedi sezione Design system per la storia
      completa (3 tentativi) e i dettagli tecnici. Replica il più
      fedelmente possibile l'export di Google Stitch (palette M3, font
      Anybody/Hanken Grotesk/Space Mono, shell con sidebar fissa). Portato
      su **tutte** le pagine, incluso il completamento successivo
      (`prenotazioni`, `preferiti`, `chi-siamo`, `diventa-coach`, i form in
      `coach-admin/campi|orari|profilo`, `coach-admin/richieste`,
      `not-found`/`error`) - nessuna pagina usa più `.cut-cta`/`.cut-corner`.
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
  (deviazione dal piano originale - il cascade avrebbe comunque cancellato le
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
- **Nuovo**: `/coach-admin` non fa più un redirect nudo - è una vera dashboard
  (richieste in attesa, lezioni confermate questa settimana, valutazione
  media), con badge sul tab "Richieste" quando ci sono richieste in sospeso, e
  header `bg-court`+`CourtLines` come il resto del brand.

**Deliberatamente rimandato** (deciso dal Delivery Manager per tenere lo scope
gestibile in una sessione, non dimenticato):
- Refactor di tutte le action da `throw` a `{ok:false, error}` - i messaggi
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
- N+1 query pattern in `queries.ts` - non un problema reale su SQLite
  in-process a questa scala, da affrontare insieme alla migrazione Postgres.

## Note Base UI da non dimenticare

- Ogni componente Base UI polimorfico (`Button`, `SheetTrigger`, `SheetClose`, …)
  ha un prop `nativeButton` (default `true`). Va messo a `false` **solo** quando
  il `render` punta a un elemento che non è un `<button>` reale (es. `<Link>`).
  Se il `render` è a sua volta un `Button` (che di default renderizza un
  `<button>`), **non** impostare `nativeButton={false}` - causerebbe il warning
  opposto. Sbagliare questo genera un warning in console visibile nell'overlay
  dev di Next.js, controllabile subito durante lo sviluppo.

## Mantenere questo file aggiornato

Quando prendi una decisione architetturale, aggiungi un'area funzionale nuova, o
cambi una convenzione, aggiorna questa sezione **e**
`.claude/skills/paideio-dev/SKILL.md` prima di chiudere la sessione, così le
sessioni future restano coerenti con l'evoluzione del progetto.
