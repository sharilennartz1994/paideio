# Paideio Game Mode — asset system

Stato: libreria PNG comic/cel-shaded, luglio 2026.

## Grammatica

Ogni asset rappresenta un oggetto, materiale o gesto reale del padel. Sono
ammessi questi motivi:

1. faccia piena e forata della racchetta;
2. pallina pressurizzata e cucitura curva;
3. vetro temperato con riflessi angolari;
4. rete e maglia metallica;
5. linee regolamentari del campo;
6. grip avvolto;
7. traiettorie di smash e bandeja;
8. scintilla d'impatto.

Un asset usa al massimo due motivi, salvo le composizioni narrative.

## Style block

```text
Create a bold contemporary sports-comic raster illustration with clean cel
shading, expressive contour lines, angular highlight shapes and controlled
graphic exaggeration. Inspired by 2026 animation title sequences, premium game
key art and modern sneaker campaigns, never vintage comics. Use exactly three
levels of flat tonal shading, crisp near-black outlines with varied weight,
sharp motion-oriented geometry and an elegant editorial silhouette. Energetic,
playful and adult-facing. No photorealism, no 3D product rendering, no
gradients, no glow, no coarse halftone, no text, no lettering, no logos, no
watermark, no clip-art.
```

## Palette

| Token | Hex | Uso |
|---|---|---|
| `--game-ink` | `#07131F` | contorni, struttura, profondità |
| `--game-blue` | `#185BFF` | massa sportiva principale |
| `--game-cyan` | `#24D4D1` | vetro, velocità, accento secondario |
| `--game-white` | `#F5F4ED` | linee, rete, riflessi |
| `--game-orange` | `#FF6338` | impatto, massimo un punto per asset |
| `--game-ball` | `#DDF23A` | esclusivamente pallina |

## Regole verificabili

- Nessuna racchetta può avere corde.
- Campo, vetro e mesh devono essere riconoscibili come padel senza testo.
- Ogni immagine usa esattamente tre livelli di cel shading.
- L'arancione è un segnale, mai una superficie dominante.
- Nessun gradiente, glow, effetto vintage o linguaggio esport.
- Ogni file runtime è un PNG RGBA; nessun SVG.
- Testo, loghi e numeri non vengono incorporati nelle immagini.
- Le animazioni future possono muovere l'asset, non deformarne il disegno.

## Inventario

- `core/racket.png`
- `core/ball.png`
- `core/impact.png`
- `architecture/court-isometric.png`
- `architecture/court-topdown.png`
- `architecture/glass-corner.png`
- `architecture/net.png`
- `materials/grip.png`
- `materials/mesh-module.png`
- `materials/perforation-pattern.png`
- `motion/smash.png`
- `motion/bandeja.png`
- `compositions/crossed-rackets.png`
- `equipment/backpack.png`
- `equipment/shoes.png`
- `equipment/ball-basket.png`
- `equipment/ball-pickup-tube.png`
- `players/player-volley.png`
- `players/player-smash.png`
- `academy/split-step.png`
- `academy/marker-cones.png`
- `academy/resistance-bands.png`
- `academy/change-direction-player.png`
- `academy/water-bottle.png`
- `academy/tactics-board.png`
- `academy/racket-shapes-v2.png` (versione didattica corrente)
- `academy/court-positions.png`
- `dividers/overgrip-divider.png`
- `micro/ball-micro.png`

I sorgenti con fondale chroma-key sono conservati in `_raw/`. La tavola di
controllo della famiglia Academy è `academy-contact-sheet.png`.

## Stato QA tecnico-padel

- `academy/court-positions.png` rispetta la pianta 2:1 e mantiene ogni coppia
  nello stesso lato della rete. È uno schema orientativo: pedine e distanze
  non sono in scala.
- `academy/tactics-board.png` ha una geometria di campo coerente, ma le frecce
  rappresentano una rotazione illustrativa e non una sequenza tecnica
  autosufficiente. Va sempre accompagnata da una spiegazione del coach.
- `academy/racket-shapes.png` non differenzia abbastanza le sagome rotonda,
  goccia e diamante per avere valore didattico. Rimane nel catalogo come
  illustrazione, ma non va usata per insegnare le tre forme finché non viene
  rigenerata con profili esterni e sweet spot chiaramente distinti.
- `players/player-volley.png` è adatto come illustrazione editoriale, non come
  tavola tecnica: il punto d'impatto è troppo vicino al corpo per mostrare una
  volée modello.
- `motion/smash.png` tocca il bordo inferiore e destro della tela; evitare
  crop stretti o rotazioni che rendano visibile il taglio.
