# Paideio - Sistema visivo « Game Arena »

## Direzione normativa corrente - 26 luglio 2026

Paideio deve sembrare un moderno gioco online interamente dedicato al padel.
L’esperienza è energica e tattile, ma non inventa punteggi o progressi:
il loop di gioco coincide con l’azione reale `trova → configura → prenota →
gioca`.

- `Oxanium`: titoli, CTA, navigazione e micro-label HUD.
- `Hanken Grotesk`: corpo, descrizioni e contenuti lunghi.
- Arena `#0B1724`, HUD `#102A45`, fondale `#06101B`, ciano `#24D4D1`,
  giallo-pallina `#DDF23A`, blu elettrico `#185BFF`, arancio `#FF6338`.
- Pannelli e CTA usano tagli angolari, bordi netti e ombre hard-edge.
- Motion tra 150 e 220 ms per hover, press e ingresso route. Loader-pallina
  ammesso; tutto fermo sotto `prefers-reduced-motion`.
- Vietati gamification finta, serif editoriali, corsivi decorativi, card
  SaaS tonde e animazioni che rallentano la prenotazione.

Le sezioni storiche successive descrivono l’origine degli asset e restano
archivio; in caso di conflitto prevale questa direzione Game Arena.

## Registro illustrativo Game Mode - 26 luglio 2026

La libreria comic/cel-shaded in `design/assets-comic/` è il registro
illustrativo corrente del prodotto. Mantiene la struttura, la palette di
superficie e la tipografia di Campo Centrale, ma sostituisce le precedenti
tavole incise nei momenti narrativi.

- Master: `design/assets-comic/`.
- Copie runtime: `public/design/game/`.
- Registry e primitive: `src/components/design/field-assets.tsx`.
- Componenti operativi: `src/components/design/game-ui.tsx`; catalogo e
  regole d’uso in `design/GAME-MODE-COMPONENTS.md`.
- Showcase locale: `/design-system`.
- Un solo asset narrativo dominante per viewport; Lucide resta il linguaggio
  delle azioni e della navigazione.
- I PNG usano `object-contain`, non vengono tagliati e non ricevono glow o
  ombre decorative aggiuntive.
- `micro/ball-micro.png` è la sola pallina ammessa sotto i 64 px.
- `dividers/overgrip-divider.png` è il divisore canonico.
- `architecture/court-topdown.png` e `architecture/court-isometric.png` sono
  esclusi dal runtime finché non derivano dalla stessa pianta regolamentare
  verificata.
- Gli asset decorativi hanno alt vuoto; quelli che comunicano uno stato hanno
  titolo e descrizione HTML indipendenti dall’immagine.

Documento di riferimento della grammatica visiva. **Ogni asset generato deve essere ricostruibile a
partire da questo solo documento.** Se non è vero, la grammatica non è finita.

Stato: Fase 1 - grammatica, revisione 2, 25 luglio 2026. In attesa di validazione utente.

Sostituisce il sistema « Agonistic Pulse » (replica 1:1 dell'export Google Stitch). La decisione di
archiviarlo è dell'utente, 25 luglio 2026 - vedi `CHANGELOG.md`.

---

## 0. La direzione in una frase

> Il padel è **l'unico sport di racchetta che si gioca dentro una scatola di vetro**. La carta di
> questo sito è **la resina blu del campo vista dall'alto**: il contenuto non sta *davanti* al
> campo, sta *sopra* il campo.

### Il punto di vigilanza, dichiarato

La revisione 1 proponeva una carta chiara con l'argomento che il fondo scuro è il cliché della
categoria (Playtomic, Matchi, le app dei circoli: tutte nere con accenti neon). L'utente ha scelto
il fondo scuro. **L'argomento resta valido e va neutralizzato altrove**: dal momento che l'asse
chiaro/scuro non ci differenzia più, la distanza dallo slop di categoria deve venire da tre cose
precise, verificabili su una cattura:

1. **Il buio ha una tinta e una materia** - `#0F2233` è resina blu, non grigio neutro. Il
   `#111316` « asfalto » del sistema precedente è vietato: un fondo desaturato = violazione.
2. **La tipografia è editoriale, non da scoreboard** - serif in peso 400, corsivo come firma.
   Nessun maiuscolo nero corsivo: era la firma del sistema archiviato ed è la firma della categoria.
3. **Il giallo è un gioiello, uno per schermo** - la categoria usa il neon come vernice. Qui una
   sola apparizione, e mai in campitura larga.

Se un giudice della Fase 5 non sa dire, guardando una cattura, perché questo non è « l'ennesima app
padel nera », il sistema ha fallito su questo punto e va ripreso.

---

## 1. Alfabeto dei motivi (8 primitive, alfabeto chiuso)

**Validato dall'utente, revisione 1.** Le anteprime CSS della tavola campione erano schemi tecnici
e non vanno giudicate: questi motivi si valutano **solo** su incisioni vere della Fase 2.

| # | Motivo | Sorgente reale | Astrazione (geometrica, riproducibile) | Usi previsti |
|---|--------|----------------|-----------------------------------------|--------------|
| 1 | **Cucitura** | La cucitura a due lobi della pallina | Una curva continua a S con due lobi simmetrici, spessore costante, estremi tagliati netti. **Mai un cerchio chiuso** | Separatori brevi, punti elenco, punto del wordmark, indicatore di caricamento |
| 2 | **Foratura** | I ~40 fori tondi passanti nella pala | Cerchi di diametro uguale su griglia sfalsata; diametro ≈ 1/3 dell'interasse; contenuti in una silhouette a triangolo arrotondato (goccia) | Pattern di fondo (*whisper*), maschera avatar, forma badge, contenitore statistica |
| 3 | **Malla** | La recinzione a maglia romboidale del campo | Reticolo di rombi a 60°, tratto unico, incroci **non** marcati da nodi | Texture *whisper*, velo su fasce piene, maschera immagini |
| 4 | **Linea di servizio** | La T dipinta sul campo (linee di servizio + centrale) | Due tratti che si incontrano ad angolo retto, bordi leggermente irregolari (pittura), **estremi non arrotondati** | Divisori di sezione, indicatore di stato attivo, ancoraggio della griglia |
| 5 | **Rete** | La rete: fascia piena in alto, maglia quadra sotto | Banda orizzontale piena sopra una tessitura quadra le cui celle si allargano scendendo | Fascia di chiusura (footer), barra di avanzamento, fine sezione |
| 6 | **Grip** | L'overgrip avvolto a spirale sull'impugnatura | Bande parallele a 25°, ciascuna con una linea più scura sul bordo di sovrapposizione | Chip, barre di avanzamento, accenti diagonali, bordo CTA |
| 7 | **Granulo** | La sabbia silicea che intasa l'erba sintetica | Rumore granulare fine e irregolare, contrasto ≤ 8 % | Texture della carta, fondo pagina (*whisper*) |
| 8 | **Vetro** | Il pannello temperato 12 mm e i suoi 4 fissaggi | Rettangolo con un filo luminoso su 2 lati soli + 4 fissaggi tondi agli angoli | Card, pannelli, contenitori di contenuto |

**Non sono motivi**: la traiettoria della bandeja, il rimbalzo, la luce dei fari, «l'energia».
Sono **comportamenti** → vivono nel livello motion (§ 7), mai nell'alfabeto.

**Regola di sorgente unica**: ogni asset si aggancia a 1 motivo, 2 al massimo. Oltre = rifiutato.

---

## 2. Registri di resa

La carta è scura: gli asset sono quindi **chiari su fondo scuro**. È anche la configurazione
migliore per il detourage - il chroma-key ha bisogno di forte contrasto tra soggetto e fondo
(§ 9.4).

> **Revisione degli STYLE BLOCK dopo la planche d'ancrage, 25 luglio 2026.** Il metodo prevede una
> sola finestra per toccarli: dopo l'ancrage, prima del primo lotto. È questa. Due correzioni,
> ricavate dai difetti misurati sulle quattro varianti (`audits/audit-ancrage-round1.md` § 3):
> **(a)** tutte e quattro derivavano verso un rilievo metallico sbalzato - il pannello di vetro
> leggeva come piastra di metallo spazzolato - quindi gli interdetti guadagnano `no embossing,
> no repoussé, no metallic sheen, no brushed metal`; **(b)** « at most one small area » di giallo
> non era misurabile e due varianti su quattro l'hanno letto come « tre palline piene », quindi
> il limite è ora quantificato al 2 % della superficie.
> **Da qui in avanti i blocchi sono congelati**: si copiano verbatim, non si ritoccano più.

### 2a. Registro **TRATTO** - STYLE BLOCK, verbatim

```
Elegant ornamental line illustration, single-plane vector look, drawn as a museum plate.
Confident MEDIUM-WEIGHT strokes, about three times thicker than a hairline, of perfectly even
width along their whole length; ends cut square, never rounded, never tapered. Warm pale sand
#EAE3D6 lines on a flat deep blue resin background #0F2233. Strictly two-dimensional and
perfectly flat. No 3D relief, no embossing, no repoussé, no metallic sheen, no brushed metal, no
shading, no shadows, no photorealism, no gradients, no texture fills, no text or lettering, no
kitsch, no clip-art, no drop shadow, no outline glow, no neon, no bloom. Quiet, ornamental,
timeless.
```

Si applica a: cucitura, linea di servizio, rete, bande grip, divisori, punti elenco, icone.
Riferimento di stile: `assets/00-anchor/anchor-sheet-v1.png`.

### 2b. Registro **INCISIONE** - STYLE BLOCK, verbatim

```
Detailed engraved illustration in the manner of a 19th-century patent plate, built entirely from
parallel hatching and cross-hatching; volume is described by line density only. Confident
MEDIUM-WEIGHT contour strokes, about three times thicker than the hatching lines, of even width.
Warm pale sand #EAE3D6 ink on a flat deep blue resin background #0F2233. Optic yellow #D6E32B may
appear on ONE object only and must cover no more than two percent of the image. Strictly
two-dimensional and perfectly flat, flat frontal or three-quarter view. No 3D relief, no
embossing, no repoussé, no metallic sheen, no brushed metal, no soft shading, no shadows, no
photorealism, no gradients, no text or lettering, no kitsch, no clip-art, no watermark, no neon,
no bloom. Quiet, precise, timeless.
```

Si applica a: la pala, la pallina, la scatola di vetro in assonometria, il campo visto dall'alto,
le vignette editoriali che oggi sono blocchi gradiente segnaposto.
Riferimento di stile: `assets/00-anchor/anchor-sheet-v1.png`.

### 2c. Registro **MATERIA** - STYLE BLOCK, verbatim

```
Flat seamless tileable surface texture, edge-to-edge, with no framing, no border, no vignette and
no isolated object anywhere in the image. Uniform density across the whole square; the pattern
must repeat without a visible seam on all four edges. Very low contrast, no more than eight
percent between lightest and darkest value. Deep blue resin #0F2233 base with markings in a
slightly lighter blue. Strictly two-dimensional and perfectly flat. No 3D relief, no embossing,
no metallic sheen, no shading, no shadows, no photorealism, no gradients, no text or lettering,
no objects, no illustration, no focal point, no neon. Quiet, material, timeless.
```

Si applica a: granulo, malla, campo di foratura, tessitura della rete.
**Nessuna immagine di riferimento su questo registro** - vedi § 9.2, è il piede in fallo più
costoso della pipeline.

### 2d. Cartografia (chi rende cosa)

| Famiglia | Registro | Cartella canonica |
|---|---|---|
| Ornamenti al tratto (cucitura, T, rete, grip) | TRATTO | `assets/motifs/` |
| Divisori e chiusure di sezione | TRATTO | `assets/dividers/` |
| Icone UI 24 px | TRATTO | `assets/icons/` |
| Illustrazioni editoriali (pala, campo, scatola) | INCISIONE | `assets/plates/` |
| Texture tileabili (granulo, malla, foratura) | MATERIA | `assets/patterns/` |

**Convenzione di archiviazione**: una sostituzione non cancella MAI un asset. Il vecchio va in
`assets/_archive-<registro>/` con il suo nome d'origine, il nuovo prende il percorso canonico.
Tornare indietro deve costare due spostamenti di file.

---

## 3. Palette (token colore) - « inchiostro rovesciato »

Rapporti calcolati con `tools/contrast.py`, non stimati. Ogni coppia dichiarata «testo» è
verificata AA (≥ 4,5:1) con margine.

| Token | Hex | Sorgente materiale | Ruolo | Testo? |
|-------|-----|--------------------|-------|--------|
| `--carta` | `#0F2233` | Resina blu del campo, vista dall'alto | **Carta**: fondo principale. Mai un grigio desaturato | fondo |
| `--carta-alta` | `#16324B` | Resina in piena luce | Superficie sollevata (card, pannelli) | fondo |
| `--carta-bassa` | `#0A1826` | Resina in ombra sotto la rete | Superficie incassata, righe alterne, disabilitato | fondo |
| `--calce` | `#F2F4F3` | Vernice bianca delle linee | **Inchiostro**: testo principale, titoli | AAA 14,7:1 su carta ✓ |
| `--nebbia` | `#9FB0BC` | Alone d'umidità sul vetro | Testo secondario, didascalie | AAA 7,3:1 su carta ✓ |
| `--vetro` | `#5FC4AC` | Vetro temperato visto di taglio | **Voce**: link, bordi attivi, focus, stati positivi | AAA 7,7:1 su carta ✓ |
| `--ottico` | `#D6E32B` | Feltro della pallina, giallo ottico | **GIOIELLO - max 1 apparizione per schermo** | AAA 11,5:1 su carta ✓ |
| `--ruggine` | `#EB7E61` | Terra battuta dei campi all'aperto | Urgenza, errori, scadenze | AA 5,9:1 su carta ✓ |
| `--sabbia` | `#EAE3D6` | Sabbia silicea del manto | **Blocco d'inversione**: fasce ad alto impatto, tavole incise | fondo |

Nove token. `--sabbia` è retrocessa da carta a **blocco**: era il fondo nella revisione 1,
l'utente l'ha rifiutata in quel ruolo. Non sparisce - è la materia del manto, e come fascia
invertita su fondo blu è il contrasto più forte del sistema (12,7:1).

**Coppie AA validate per il testo corrente**
Su carta scura: calce (14,7) · nebbia (7,3) · vetro (7,7) · ottico (11,5) · ruggine (5,9) ·
sabbia (12,7).
Su `--carta-alta` (le card): calce (11,9) · nebbia (5,9) · vetro (6,3) · ottico (9,4) ·
ruggine (4,8).
Su blocco `--sabbia`: carta (12,7) - il testo sui blocchi chiari è il blu della carta.
Su blocco `--ottico`: carta (11,5) - mai testo chiaro sul giallo.

**Coppie vietate** (misurate, non presunte): nebbia su sabbia (1,8) · vetro su sabbia (1,7) ·
calce su sabbia (1,2) · calce su ottico (1,3) · qualsiasi testo chiaro su `--ottico`.

---

## 4. Geometria

- **Griglia icone**: 24 px; **due sole** spessore di tratto: 2 px (principale) / 1 px (dettaglio).
- **Modulo pattern**: 48 px · **Base di spaziatura**: 8 px.
- **Logica degli angoli**: **vivi** per ciò che deriva dal campo e dal vetro (pannelli, card,
  fasce, tagli) - raggio 0 o 2 px; **tondi** per ciò che deriva dalla pallina e dal grip (chip,
  avatar, pill, badge) - raggio pieno. Non esistono raggi intermedi: il `rounded-lg` generico
  sparisce.
- **3 densità decorative** - è l'unico strumento di limitazione dell'intensità (la scala a tre
  ranghi in pixel della revisione 1 è stata rifiutata dall'utente e rimossa: faceva lo stesso
  lavoro di questa regola, in modo più rigido e meno leggibile):
  - *whisper* - granulo/malla di fondo, contrasto ≤ 8 %, non disturba mai la lettura;
  - *voice* - bordi, divisori, bande grip, un colore;
  - *song* - momento hero, **max 1 visibile per schermo**.

---

## 5. Tipografia (mai generata in immagine)

**Due famiglie, non tre.** Il mono è stato rimosso su richiesta dell'utente: i dati vivono nel
sans con cifre tabulari (`font-variant-numeric: tabular-nums`), che allinea prezzi e orari in
colonna senza importare una terza voce.

- **Serif editoriale - `Instrument Serif`**: titoli, nomi dei coach, numeri hero. Il corsivo è una
  firma, non un ripiego. Peso unico 400: a 40 px+ è più editoriale di un nero, ed evita in blocco
  il cliché «sport = maiuscolo nero corsivo» (vedi § 0, punto di vigilanza 2).
- **Sans umanista - `Hanken Grotesk`**: UI, corpo del testo, navigazione, form, **dati**, etichette.
  Unica famiglia conservata dal sistema precedente.
- **`Anybody` e `Space Mono` sono ritirati.**
- **Auto-ospitate**: `next/font/google` scarica e serve dal nostro dominio in fase di build - zero
  chiamate a terzi, nessun cookie di font.

Scala desktop (base 17 px, ratio ~1,28):
`caption 14 / body 17 / body-lg 19 / h3 26 / h2 34 / h1 44 / display 62`

Scala mobile (base 16 px):
`body 16/1,65 · h3 22 · h2 27 · h1 33 · display 40 · cifra 52`

Su fondo scuro il testo chiaro « ingrassa » otticamente: il corpo va impostato a peso 400, mai
500, e `-webkit-font-smoothing: antialiased` è obbligatorio.

---

## 6. Principi falsificabili

Sono il **barème dei giudici** della Fase 5. Ognuno si può prendere in fallo su una singola
schermata.

1. **La carta ha una tinta** - il fondo è resina blu. Un grigio o un nero desaturato a schermo
   (`#111`, `#1a1a1a`, `#111316`) = violazione. È la regola che ci separa dallo slop di categoria.
2. **L'ornamento si merita** - due elementi *song* visibili insieme = violazione.
3. **Un motivo per elemento** - più di 2 motivi mescolati in un componente = rifiutato.
4. **L'ottico è un gioiello, non della vernice** - il giallo in campitura larga, o due apparizioni
   nello stesso schermo = violazione.
5. **Gli angoli hanno una causa** - un raggio intermedio (né 0/2 px né pieno) = violazione: vuol
   dire che l'elemento non sa da quale materia viene.
6. **Astrarre, mai illustrare** - un asset decorativo che raffigura una scena (un giocatore che
   colpisce, un campo prospettico «fotografico») = violazione. Le illustrazioni editoriali del
   registro INCISIONE sono l'unica eccezione, e sono dichiarate.
7. **La materia alle superfici, il tratto agli ornamenti** - una texture usata come divisore, o un
   ornamento al tratto usato come fondo tileato = violazione.
8. **Il movimento ha una causa** - nulla si anima senza un'azione dell'utente o un cambio di stato.
   Un loop decorativo permanente = violazione.
9. **Niente scoreboard** - un titolo in maiuscolo nero corsivo, un glow neon, un bordo luminoso
   = violazione. Sono le firme del sistema archiviato e della categoria.

---

## 7. Livello motion (i comportamenti, fuori dall'alfabeto)

- **Rimbalzo**: solo su conferma di un'azione riuscita (prenotazione inviata). Una volta, non in
  loop.
- **Traiettoria**: la transizione tra due stati segue un arco, non una linea - `cubic-bezier(.33,
  0, .2, 1)`.
- **Il vetro reagisce**: al focus, il filo luminoso del motivo Vetro si accende sui 2 lati. È
  l'unico effetto di «luce» ammesso, e non è un glow: è un bordo che cambia colore.
- Tutto disattivato sotto `prefers-reduced-motion: reduce`.

---

## 8. Invarianti del soggetto (da ri-verificare su OGNI asset, uno alla volta)

Elementi che i modelli sbagliano sistematicamente e che vanno ispezionati pezzo per pezzo, mai in
fiducia:

1. **La pala non ha corde.** È una lastra piena forata. Se un asset mostra un piatto incordato, è
   una racchetta da tennis: rifiutato.
2. **La pala non ha manico lungo.** Impugnatura corta, cordino da polso, silhouette a goccia o
   diamante o tonda - mai ovale allungato.
3. **Il campo è 20 × 10 m e chiuso su 4 lati**: vetro sul fondo e su metà delle laterali, malla
   sul resto. Un campo aperto senza pareti = rifiutato. **Proporzione esatta 2:1** e **vista
   zenitale ortografica**: sulla planche d'ancrage il modello ha reso tutte e quattro le varianti
   in assonometria con le pareti svasate, e con rapporti fra 1,24 e 1,66. Nel prompt della tavola
   dedicata vanno imposti in lettere: `exactly twice as long as it is wide`, `strict top-down
   orthographic view, no perspective, no splayed walls`.
4. **La rete è più bassa al centro**: 92 cm ai pali, 88 cm al centro. L'avvallamento va al centro -
   una rete tesa dritta, o più alta al centro, è sbagliata.
5. **La pallina ha una cucitura a due lobi** - due lobi, mai tre, mai una linea dritta.
6. **Il wordmark è sempre « PAIDEIO »**, mai « Paideia ». Il termine greco παιδεία è il concetto
   raccontato in `/chi-siamo`; il nome del prodotto no. Errore già presente nell'export Stitch
   originale, non ripeterlo.
7. **Nessuna scritta negli asset.** Ogni testo è HTML.

---

## 9. Workflow di produzione

1. Prompt = STYLE BLOCK del registro mirato (**verbatim, mai parafrasato**) + descrizione
   dell'asset + dimensione scritta in lettere nel testo.
2. Generazione a lotti di 4-8; `referenced_image_paths` = planche d'ancrage, oppure l'ornamento
   capostipite del motivo. **Eccezione: mai riferimento sui prompt "vuoti"** (registro MATERIA,
   texture whisper) - il modello ci ricasca dentro gli oggetti della referenza.
3. Dentro un lotto: **l'ornamento del motivo PRIMA**, poi le sue declinazioni con lui in referenza.
4. Nessun alpha nativo: generare su fondo pieno fortemente contrastato (qui: sabbia chiara su
   `#0F2233`) → chroma-key (`tools/key_bg.py`) → QA tuilage < 12/255
   (`tools/qa_assets.py tile`) → archiviazione + grezzo in `_raw/`.
5. Planche contact (`tools/contact_sheet.py`) → veto utente.
6. Export verso il sito **alla dimensione di visualizzazione reale × 2**.
