# Changelog - identità visiva Paideio

Una voce datata per sessione. Obbligatorio.

## 2026-07-25 (e) - Fase 2 : lotti 02, 03, 04 - biblioteca quasi completa

14 asset generati in tre lotti paralleli. Audit: `audits/audit-lotti02-03-04.md`.
**13 accettati, 1 rifiutato.**

- **Lotto 02** (MATERIA, **senza referenza** di proposito): granulo, malla, foratura,
  rete-tessitura. Nessuna contaminazione da referenza: la regola del prompt « vuoto » ha retto.
- **Lotto 03** (INCISIONE, referenza ancrage): plate-scatola-vetro (il pezzo forte, hero della
  home), plate-campo-alto, plate-pala, plate-palla-rete.
- **Lotto 04** (TRATTO, referenza = i **capostipiti**, non l'ancrage): 4 divisori + tavola-campione
  delle 12 icone.

**La correzione più redditizia dei quattro lotti**: imporre in lettere `exactly twice as long as
it is wide` + `strict top-down orthographic view` ha portato il campo da 1,24-1,66 in assonometria
(errore al 100 % sulle quattro varianti dell'ancrage) a **1,94:1 zenitale**.

**Rifiutato - `grip-banda-v2`**: doveva essere una fascia astratta di bande a 25°, il modello ha
disegnato **l'impugnatura di una racchetta**, oggetto isolato al centro. Doppia violazione: non è
una fascia, e infrange il principio § 6.6 « astrarre, mai illustrare ». Causa probabile: la
referenza `anchor-sheet-v1.png` contiene un rotolo di grip e una racchetta, e su una richiesta
astratta ha tirato verso l'oggetto - variante attenuata della trappola del prompt « vuoto ».
Da rigenerare **senza ancrage in referenza**. Resta valida la v1 (angolo sbagliato ma vera fascia).

**Due volte ho quasi riportato un difetto sbagliato, entrambe corrette dalla misura o dallo
sguardo**: (a) su `grip-banda-v2` avevo misurato « 89,6°, strisce verticali » - guardando
l'immagine il difetto era tutt'altro e assai più grave: **la misura non sostituisce lo sguardo**;
(b) su `plate-palla-rete` avevo stimato a occhio ~10 % di giallo, misurato è **2,33 %** contro un
limite del 2 %, sforamento marginale accettato: **lo sguardo non sostituisce la misura**.

**Difetti misurati e trattati**: contrasto texture 13,7-16,9 % (p2-p98) contro il limite dichiarato
dell'8 % - sulla deviazione standard (3,3-5,2 %) rientrano, quindi `granulo` va già bene come
whisper e le altre tre andranno applicate a opacità ridotta, da misurare sui componenti reali;
`foratura` tuilage 13,0 → **0,6** per ritaglio su periodo intero (originale in `_archive-materia/`).

**Terzo lotto su tre in cui le dimensioni richieste vengono ignorate**: confermato come
comportamento del tool. Smesso di chiederle.

---

## 2026-07-25 (d) - Fase 2 : ancrage scelto + lotto 01 (ornamenti al tratto)

**Planche d'ancrage**: l'utente sceglie la **V4** → `assets/00-anchor/anchor-sheet-v1.png`.
Le altre tre restano come candidate, nulla cancellato.

**STYLE BLOCK corretti e da qui in avanti congelati** (`SYSTEM.md` § 2, unica finestra prevista dal
metodo - dopo l'ancrage, prima del primo lotto): aggiunto `no embossing, no repoussé, no metallic
sheen, no brushed metal` a tutti e tre i registri; il limite del giallo passa da « at most one
small area » (non misurabile, letto come tre palline piene da due varianti su quattro) a **un solo
oggetto, max 2 % della superficie**. Invariante § 8.3 rinforzato con proporzione 2:1 e vista
zenitale imposte in lettere per la futura tavola del campo.

**Lotto 01** - 4 ornamenti capostipite al tratto in `assets/motifs/`, audit in
`audits/audit-lotto01-tratto.md`:
- **La correzione anti-rilievo ha preso, misurata**: deviazione standard della luminanza interna
  al tratto (bordi antialiasati esclusi per erosione) fra **0,75 e 1,33** su 255. Uno sbalzo
  metallico darebbe 15-40.
- **Secondo falso positivo consecutivo di Codex**: segnala « rilievo metallico ricomparso, lieve »
  su due asset che sono i più piatti del lotto. È antialiasing dei bordi. Da trasmettere come
  falso positivo noto nei prompt futuri, per non farglielo « correggere ».
- **Difetto vero**: `grip-banda` a **45°** invece dei 25° richiesti (misurato per regressione sul
  bordo). A 45° legge come striscia di pericolo da cantiere, il cliché opposto all'overgrip.
  Da rigenerare, accorpato al lotto 02.
- **Tuilage riparato per ritaglio** invece che per rigenerazione, come prescrive il metodo:
  `rete-fascia` 46,9 → **0,7**, `grip-banda` 42,2 → **3,9** (soglia 12), verificato anche a vista
  ripetendo le fasce. Originali pre-ritaglio in `assets/_archive-tratto/`.
- **Comportamento acquisito del tool**: `image_gen.imagegen` ignora la dimensione scritta in
  lettere due volte su due (1254 invece di 2048; 1983×793 e 1774×887 invece di 1600×400). Smettere
  di chiederla: ritagliare all'ingestione.

---

## 2026-07-25 (c) - Fase 2 avviata : planche d'ancrage

Grammatica revisione 2 approvata dall'utente (« già meglio »). Avvio della generazione asset.

- `prompts/00-anchor.md` - prompt della planche d'ancrage: STYLE BLOCK INCISIONE verbatim + 8
  oggetti emblematici del padel in griglia 2×4, nessuna immagine di riferimento (è la prima).
  Include la checklist degli invarianti da verificare oggetto per oggetto e le trappole note.
- Lanciato `codex:codex-rescue` → `image_gen.imagegen` per 4 varianti.
- **4 varianti atterrate** in `assets/00-anchor/` (+ grezzi in `_raw/`, verificati byte-identici).
  1254 × 1254 invece dei 2048 chiesti in lettere: il tool non ha onorato la dimensione. Tollerabile
  per una referenza di stile, **non** per gli asset veri.
- `audits/audit-ancrage-round1.md` + `audits/planche-contact-ancrage.png`.
- **L'invariante più temuto ha tenuto**: la pala esce come lastra piena forata in tutte e quattro,
  mai come racchetta da tennis incordata. Il vincolo scritto in maiuscolo nel prompt funziona.
- **Verifica del rapporto di Codex** (passo obbligatorio del metodo): rapporto onesto e completo,
  ma con **1 falso positivo** (una « pseudo-lettera » sulla V1 che è la tratteggiatura della
  ghiera), **1 errore ripetuto su tutte e quattro** (« campo ~2:1 »; misurati 1,50 · 1,66 · 1,43 ·
  1,24) e **2 omissioni** (V1 e V2 violano la disciplina del giallo con tre palline piene; nessun
  campo è visto dall'alto come chiesto, tutti in assonometria). Confermata la regola d'oro n° 1
  del metodo: verificare da sé prima di far correggere.
- Correzioni allo STYLE BLOCK identificate per il lotto 1 (rilievo metallico, giallo quantificato,
  proporzione e vista del campo) - vedi § 5 dell'audit. **Non ancora applicate**: si applicano
  dopo la scelta della variante, con le correzioni dell'utente insieme.
- **Trappola d'ambiente incontrata e documentata** (vedi `HANDOFF.md` § 8): lo stato dei job
  Codex sta in `~/.claude/plugins/data/codex-openai-codex/state/…`, non in `codex-inline/` come
  scrive `references/2-generation-assets.md` del skill. Guardando nel posto sbagliato ho
  concluso per errore che la task non fosse partita, mentre stava girando. Corretto sul posto.
  Il sotto-agente inoltre rientra subito con un id di job mentre il lavoro continua staccato:
  nessuna notifica automatica, la vigilanza sui file va messa a mano.

---

## 2026-07-25 (b) - Fase 1, revisione 2 : redirezione dell'utente alla porta di validazione

Prima passata alla porta: **tre proposte su quattro rifiutate**. La porta ha funzionato - le
correzioni costano un'ora adesso, sarebbero costate novanta asset dopo.

**Verdetto dell'utente sulla revisione 1**
- Motivi: « non mi piacciono ». Diagnosi chiesta e ottenuta: **il concetto regge, erano brutte le
  anteprime CSS** (schemi tecnici da manuale). → l'alfabeto a 8 motivi resta validato; le anteprime
  disegnate sono state rimosse dalla tavola campione; i motivi si giudicheranno **solo su incisioni
  vere della Fase 2**.
- Carta: la sabbia non va come sfondo. → direzione **« inchiostro rovesciato »**, carta scura
  `#0F2233` (resina blu del campo). `--sabbia` retrocessa da carta a **blocco d'inversione**.
- Ranghi: la scala di ornamenti a 3 ranghi in pixel è rifiutata. → **rimossa**. Le tre densità
  *whisper/voice/song* facevano già il lavoro di limitare l'intensità, in modo meno rigido e più
  leggibile. Nessuna protezione persa.
- Dati/mono: è il **font mono** il problema, non la formattazione a puntini né le maiuscole. → il
  mono sparisce come terza famiglia, i dati passano al sans con `font-variant-numeric: tabular-nums`.
  Due famiglie invece di tre, che è anche ciò che raccomanda il metodo.

**Conseguenza da tenere d'occhio, dichiarata in `SYSTEM.md` § 0**
La revisione 1 vendeva la carta chiara con l'argomento che il fondo scuro è lo slop di categoria
(Playtomic, Matchi: tutte nere con accenti neon). Scegliendo lo scuro, quell'asse di
differenziazione sparisce. Non si finge che il problema non esista: la distanza dalla categoria è
stata spostata su tre criteri verificabili su una cattura (buio con una tinta, tipografia
editoriale, giallo raro) ed è diventata il **principio falsificabile n° 1 e n° 9**. Se un giudice
della Fase 5 non sa citarli guardando una schermata, il sistema ha fallito su questo punto.

**Ricalibrature di contrasto sulla nuova carta**
- `ruggine` `#E0765A` → `#EB7E61`: dava 4,34:1 su `--carta-alta` (le card), sotto AA. Ora 4,83.
- `blucampo` eliminato: su carta scura coincideva con `--carta-alta` (rapporto 1,00). Nove token
  invece di dieci.
- Verificati tutti i fondi, inclusi i blocchi `--sabbia` e `--ottico` (il testo sui blocchi chiari
  è il blu della carta; nessun testo chiaro sul giallo, mai).

**Prodotto**: `SYSTEM.md` riscritto · `planche-stile.html` rifatta · `audits/planche-stile-v2.png`
· `tools/contrast.py` aggiornato sulla nuova palette. La v1 è in `audits/_archive/` - non si
cancella nulla.

**Non fatto**: il divisore « linea di servizio » nella card coach resta poco convincente in CSS
(una riga con una tacca). Non l'ho aggiustato di proposito: è esattamente un motivo che va
giudicato sull'incisione vera, non sul segnaposto.

---

## 2026-07-25 (a) - Fase 0 + Fase 1 : grammatica « Campo Centrale »

Avvio del quarto giro di design, questa volta con il metodo `site-identite-generative`
(identità generativa: grammatica → asset → boucle critique).

**Decisioni dell'utente (porta di validazione, non riaprire senza di lui)**
- Ampiezza: **identità nuova da zero**. Il sistema « Agonistic Pulse » - replica 1:1 dell'export
  Google Stitch, dark-only - è archiviato. La regola « non toccare i valori Stitch » di AGENTS.md
  è formalmente revocata da questa decisione.
- Fase 2 asset: **pipeline completa** (Codex → `image_gen.imagegen`), non CSS a mano.
- Dark-only: **abbandonato**. Direzione scelta « Campo Centrale - luce di mezzogiorno », su
  proposta motivata: il dark-neon è il cliché della categoria padel (Playtomic, Matchi e simili),
  quindi lo slop di categoria.

**Prodotto**
- `SYSTEM.md` - alfabeto chiuso di 8 motivi ricavati da materia reale del padel (cucitura,
  foratura, malla, linea di servizio, rete, grip, granulo, vetro) ; 3 STYLE BLOCK verbatim
  (TRATTO / INCISIONE / MATERIA) con cartografia ; palette a 10 token ; 8 principi falsificabili ;
  7 invarianti del soggetto ; scala ornamenti a 3 ranghi ; livello motion separato dall'alfabeto.
- `tools/contrast.py` - matrice WCAG della palette, riproducibile.
- Struttura cartelle: `assets/{00-anchor,motifs,patterns,dividers,plates,icons,_raw}`,
  `prompts/`, `audits/screens/`, `_backups/`, `tools/`.

**Correzioni fatte in corsa sulla palette proposta**
Due token dell'anteprima non superavano la verifica e sono stati ricalibrati invece di essere
dichiarati a memoria:
- `ombra-rete` `#6B7A82` → `#55626A` (era 3,48:1 su sabbia, sotto AA ; ora 4,93:1) ;
- `vetro` `#1E7A6A` → `#17685A` (era 4,07:1 su sabbia ; ora 5,20:1).
Aggiunti `--vetro-chiaro` (il vetro fallisce su fondo scuro: 2,07:1) e `--sabbia-cupa`
(superficie incassata).

**Toolchain Fase 2 verificata**: Node 24.18, Pillow 11.3, Chrome presente.

**Non fatto in questa sessione, e perché**
- Nessun asset generato: la Fase 2 non parte prima della validazione della grammatica (porta del
  metodo) e della planche d'ancrage.
- Nessuna riga di codice del sito toccata: la Fase 4 (costruzione) viene dopo la biblioteca.
- `AGENTS.md` non ancora aggiornato: lo sarà quando il nuovo sistema sarà implementato, non
  mentre è ancora una proposta.
