# Brief d’implementazione - Campo Centrale / Game Mode

> Aggiornamento 26 luglio 2026: le tavole incise descritte più sotto sono
> archiviate. Le superfici narrative usano ora i PNG comic/cel-shaded
> registrati in `src/components/design/field-assets.tsx`. La distribuzione
> corrente è: vibora nella hero home, pala sul profilo coach, smash nella
> dashboard, overgrip come divisore e attrezzatura negli stati vuoti. I due
> asset del campo non sono autorizzati nel runtime finché le proporzioni non
> sono ricostruite geometricamente.

Destinatario: frontend developer. Data: 25 luglio 2026.

Questo documento traduce `SYSTEM.md`, gli asset finali e le reference richieste in scelte
implementabili. Non sostituisce `SYSTEM.md`: in caso di conflitto prevale quello.

## 1. Tesi visiva

La pagina è una superficie di resina blu su cui contenuto, linee del campo e tavole incise
convivono. Non costruire “un’app sportiva dark con immagini decorative”: costruire un prodotto
editoriale e operativo la cui materia è il campo.

Ordine di lettura:

1. titolo serif e azione primaria;
2. contenuto utile (ricerca, coach, prenotazione, gestione);
3. una sola tavola incisa come momento `song`;
4. divisori e texture come infrastruttura silenziosa.

La nuova identità sostituisce Agonistic Pulse/Stitch: rimuovere progressivamente Anybody,
Space Mono, fondo asfalto, glow, maiuscolo corsivo pesante, card-clip e giallo diffuso. Conservare
funzioni, copy e flussi; non “ridisegnare” i contratti di prodotto.

## 2. Asset: cosa usare e dove

### Tavole editoriali (`plates/`)

- `plate-scatola-vetro.png`: hero home, è il pezzo principale. Desktop: lato destro, circa
  44–48% della larghezza utile, senza card contenitrice; il fondo blu dell’asset deve fondersi
  nella carta. Mobile: sotto headline/CTA, crop completo, rapporto conservato. Non usarla altrove.
- `plate-campo-alto.png`: `/cerca` e stati di orientamento/geolocalizzazione. Usarla come
  ancoraggio laterale o fondale a bassa presenza, mai dietro testo lungo. È l’unica tavola adatta
  a comunicare “spazio/posizione”.
- `plate-pala.png`: profilo coach e `/diventa-coach`; un uso editoriale per pagina, preferibilmente
  accanto a competenze, livelli o proposta professionale.
- `plate-palla-rete.png`: feedback di booking, empty/error state “Palla a rete”, o fascia di
  chiusura della pagina prenotazioni. Poiché contiene l’unico giallo, quando è visibile non
  aggiungere altri elementi `--ottico` nello stesso viewport.

Le tavole non sono thumbnail ripetibili, non stanno dentro ogni card e non sostituiscono avatar
reali. Sempre `object-contain`, nessun filtro, glow, ombra, parallasse o hover zoom.

### Texture (`patterns/`)

- `granulo.png`: texture globale della carta, `repeat`, opacità iniziale 12–18%; deve essere
  quasi percepita, non vista.
- `malla.png`: grandi fasce funzionali o pannelli vuoti, 5–9% di opacità.
- `foratura.png`: badge/statistiche o una zona hero delimitata, 5–8%; mai su tutto il body.
- `rete-tessitura.png`: footer, fine sezione o pannello “sotto rete”, 4–7%.

Prima di chiudere ogni pagina, verificare il contrasto sul componente reale: se la texture
compete con testo o controlli, abbassarla. Non sovrapporre due pattern.

### Divisori e motivi

- `divider-sezione.png`: separazione principale tra due capitoli della home o della pagina coach.
- `divider-corto.png`: pausa dentro contenuto editoriale, per esempio tra bio e metriche.
- `divider-t-larga.png`: intestazione di una griglia a tre colonne; i tre discendenti devono
  allinearsi alle colonne.
- `divider-fine.png`: sequenza o tre micro-momenti, non separatore universale.
- `cucitura-divisore.png`: firma breve, loading o conferma una tantum.
- `linea-servizio-divisore.png`: bordo attivo/ancoraggio di una sezione.
- `rete-fascia.png`: chiusura pagina/footer.
- `grip-banda.png`: solo piccola fascia/chip. È a 45° anziché 25°: uso tollerato ma raro.
- `grip-banda-v2.png`: rifiutato, non importare.

Gli asset di tratto richiedono detourage/chroma-key prima di essere sovrapposti a superfici
diverse. Non spedire lo sfondo rettangolare se il contesto non coincide perfettamente.

### Icone

`icone-tavola.png` è esclusivamente riferimento di disegno. Non ritagliarla in produzione.
Ridisegnare solo le icone realmente necessarie come SVG 24×24, stroke 2 px principale / 1 px
dettaglio, estremità nette. Lucide può restare temporaneamente dove semanticamente corretta,
ma non mischiare nello stesso gruppo Lucide arrotondate e nuove icone squadrate.

## 3. Composizione per superficie

### Home - modalità “persuadere”

- Hero asimmetrico: testo 6/12, tavola scatola 5/12, una colonna d’aria.
- Eyebrow sans breve; H1 Instrument Serif, sentence case, 40 mobile / 62 desktop. Una sola parola
  o breve locuzione in corsivo, non tutto il titolo.
- Ricerca rapida subito sotto il testo, composta come pannello Vetro rettangolare, non pill
  gigante. CTA chiara e specifica: “Trova un coach”.
- Coach in evidenza: evitare tre card identiche “immagine/titolo/testo/bottone”. Dare priorità
  al primo risultato e rendere gli altri più compatti; prezzo, luogo e disponibilità devono
  formare una gerarchia, non una zuppa di badge.
- Un solo blocco invertito `--sabbia` per pagina, destinato alla prova/argomento “Perché Paideio”.
  Testo blu `--carta`; nessun giallo dentro.

### Cerca - modalità “operare”

- Filtri desktop in colonna stabile; risultati dominanti. Mobile: filtri in Sheet accessibile,
  con riepilogo dei filtri applicati e pulsante persistente solo quando serve.
- Card coach: nome serif, luogo/disponibilità in sans, prezzo con cifre tabulari, rating
  secondario. Una sola azione dominante. Evitare corner ribbon, rotazioni, bordi che crescono,
  avatar che ruota.
- Stato zero: copy esistente + `plate-palla-rete`; nessuna emoji tennis.

### Profilo coach - modalità “leggere → agire”

- Testata con avatar reale, nome serif, rating e località; `plate-pala` è contrappunto editoriale,
  non sostituto del coach.
- Booking panel sticky desktop; mobile precede il calendario. Prezzo e primo slot disponibile
  devono precedere dettagli secondari.
- Sezioni bio, campi, recensioni con ritmo editoriale e un divisore massimo tra capitoli.

### Prenotazioni e coach-admin - modalità “operare”

- Densità maggiore, decorazione minore. Una sola tavola può vivere nell’empty state, mai tra righe
  attive.
- Metriche senza “card dentro card”: una superficie comune, separatori, numeri tabulari.
- Stati e transizioni devono essere leggibili anche senza colore; testo + icona + focus.

## 4. Componenti e geometria

- Campo/vetro: radius 0 o 2 px. Pallina/grip/avatar/chip: pill piena. Eliminare raggi intermedi.
- Button primario: rettangolare, altezza minima 44 px, label concreta; secondario outline Vetro.
- Input: label sempre visibile, non affidarsi al placeholder; focus su due lati con `--vetro`,
  senza glow.
- Card: una sola superficie, niente card annidate salvo reale gerarchia interattiva.
- Dati: Hanken Grotesk con `tabular-nums`; niente font mono.
- Touch target minimo 44×44; focus visibile e non coperto da topbar/bottom-nav.

## 5. Motion

La sintesi delle reference Emil Kowalski e SmoothUI è: animare stato e causalità, non
“aggiungere movimento”.

- Hover: 140–180 ms, solo colore/bordo o traslazione 1–2 px. Nessuna scala su intere card.
- Apertura pannelli/filtri: 220–280 ms, easing `cubic-bezier(.33,0,.2,1)`.
- Conferma booking: un singolo rimbalzo della cucitura/pallina, poi stop.
- Numeri dashboard: animazione solo quando il valore cambia realmente, non al mount di ogni visita.
- Nessun loop decorativo, pulse, ring rotante, scramble text, marquee o parallax.
- `prefers-reduced-motion`: trasformazioni disattivate; transizioni istantanee o dissolve breve.

Non installare Motion/GSAP o un componente SmoothUI per ottenere effetti già esprimibili in CSS.
Valutare una dipendenza soltanto se un’interazione scelta richiede fisica, gesture o
coordinamento complesso e porta un beneficio verificabile.

## 6. Responsive

- Mobile non è desktop impilato: priorità = titolo → azione → informazione decisiva → visuale.
- La tavola hero passa sotto il CTA; i divisori larghi si nascondono o hanno una variante breve.
- Nessun testo dentro immagini; gli asset possono essere nascosti se comprimono il compito.
- Griglie: 1 colonna sotto 640, 2 da 768 quando il contenuto regge, 3 solo con almeno ~320 px
  reali per card.
- Evitare `min-height` rigide da 700+ px su mobile. Testare 320, 375, 768, 1024 e 1440 px.
- Considerare safe-area per bottom navigation e Sheet.

## 7. Accessibilità e QA

- Conservare HTML semantico e ordine DOM coerente con la lettura senza CSS.
- Asset decorativi: `alt=""`, `aria-hidden`; tavole che veicolano significato: alt breve
  specifico in italiano.
- Filtri radio/checkbox nativi o Base UI correttamente etichettati; non nasconderli senza
  equivalente focus.
- Non comunicare stato solo con `--ruggine`, `--vetro` o `--ottico`.
- Verificare zoom 200%, tastiera completa, contrasto nei nove token, reduced motion e
  `forced-colors`.
- Non introdurre testo sotto 14 px per informazioni operative.

## 8. Anti-slop / preflight

Prima della consegna, ogni pagina deve passare queste domande:

1. La pagina sembra resina blu, non asfalto nero?
2. La gerarchia resta chiara in scala di grigi?
3. C’è al massimo un elemento `song` e un’apparizione gialla per viewport?
4. Ogni decorazione deriva da un motivo dichiarato?
5. Le card esistono perché raggruppano un’unità, non per riempire spazio?
6. Il titolo è editoriale e sentence case, non scoreboard?
7. Il movimento risponde a un’azione o cambio di stato?
8. La pagina funziona senza l’asset decorativo?
9. Mobile ha una priorità propria?
10. Non sono entrati gradienti, glow, glassmorphism, pill eccessive, ribbon diagonali,
    emoji tennis o copy generico?

## 9. Ordine consigliato al developer

1. Backup datato.
2. Migrare token/font/base geometry in `globals.css` e `layout.tsx`.
3. Creare primitive per texture, tavola, divisore e pannello Vetro.
4. Implementare home come pagina campione; catturare desktop/mobile.
5. Solo dopo validazione, propagare a cerca e profilo coach.
6. Poi superfici operative: prenotazioni, preferiti, coach-admin, form e stati.
7. Audit visuale su catture, verifica manuale dei difetti, build e test tastiera.

Non fare una sostituzione meccanica globale delle classi: la nuova gerarchia richiede decisioni
per superficie.

## 10. Cosa prendere dalle reference

- Emil Kowalski: vocabolario e severità sul motion; opportunità poche, causali, reduced-motion.
- Impeccable: preservare prodotto e contratti, distillare gerarchia, rimuovere card annidate,
  badge soup e default “AI”.
- Unlumen: precisione delle primitive e composizione sobria; riferimento, non tema da copiare.
- SmoothUI: qualità delle transizioni, compatibilità React/Tailwind e attenzione reduced-motion;
  non importare i suoi componenti spettacolari fuori contesto.
- Taste Skill: audit-first, inferenza del brief, preservation rules e preflight onesto.

Le skill/reference ampliano il giudizio; `SYSTEM.md` resta la fonte normativa della marca.
