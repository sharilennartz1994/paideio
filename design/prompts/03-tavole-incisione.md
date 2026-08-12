# Lotto 03 - Tavole editoriali (registro INCISIONE) + rigenerazione `grip-banda`

**Registri**: INCISIONE (`SYSTEM.md` § 2b) per le tavole · TRATTO (§ 2a) per `grip-banda-v2`.
**Referenza immagine**: `design/assets/00-anchor/anchor-sheet-v1.png` su **tutti** i prompt di
questo lotto.
**Destinazione**: tavole in `design/assets/plates/`, `grip-banda-v2.png` in
`design/assets/motifs/` - grezzi in `design/assets/_raw/`.

Queste tavole sostituiscono i blocchi gradiente segnaposto lasciati dove il sistema archiviato
aveva foto AI su URL temporanei. Non sono decorazione: sono le uniche illustrazioni figurative
ammesse dal sistema (eccezione dichiarata al principio § 6.6).

---

## Asset 1 - `grip-banda-v2.png` (motivo 06, registro TRATTO) - RIGENERAZIONE

La versione 1 è uscita a **45°** invece dei 25° richiesti, e a 45° legge come striscia di pericolo
da cantiere invece che come overgrip avvolto a spirale bassa. L'angolo va imposto senza ambiguità.

```
Elegant ornamental line illustration, single-plane vector look, drawn as a museum plate.
Confident MEDIUM-WEIGHT strokes, about three times thicker than a hairline, of perfectly even
width along their whole length; ends cut square, never rounded, never tapered. Warm pale sand
#EAE3D6 lines on a flat deep blue resin background #0F2233. Strictly two-dimensional and
perfectly flat. No 3D relief, no embossing, no repoussé, no metallic sheen, no brushed metal, no
shading, no shadows, no photorealism, no gradients, no texture fills, no text or lettering, no
kitsch, no clip-art, no drop shadow, no outline glow, no neon, no bloom. Quiet, ornamental,
timeless.

A band of parallel diagonal stripes abstracting grip tape wrapped around a handle. The stripes
lie at a SHALLOW angle of twenty-five degrees from the horizontal - they are much closer to
horizontal than to diagonal. They are NOT at forty-five degrees. Picture tape spiralling around
a cylinder in long, shallow turns. Each stripe carries one thinner line along one edge, where the
wrapping overlaps. Uniform stripe width, uniform spacing, edge to edge.

Wide landscape composition, much wider than tall.
```

---

## STYLE BLOCK INCISIONE, verbatim (asset 2, 3, 4, 5)

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

## Asset 2 - `plate-scatola-vetro.png` - hero della home

L'immagine portante del sito: il padel è l'unico sport di racchetta giocato dentro una scatola di
vetro, ed è la spina dorsale del concept.

```
<STYLE BLOCK>

A padel court drawn as a single transparent glass box, seen in three-quarter axonometric view
from slightly above. The box is enclosed on all four sides: tall tempered glass panels at both
ends and along the lower half of the long sides, diamond-mesh fencing above and along the rest.
The net crosses the middle of the floor and sags lower at its centre than at its posts. The
floor carries the painted service lines and centre line forming a T on each half. The court is
empty - no players, no figures, no equipment. The structure reads as a precise architectural
plate: every panel, post and mesh section drawn in line.

Wide landscape composition.
```

## Asset 3 - `plate-campo-alto.png` - emblema, pagina concetto

```
<STYLE BLOCK>

A padel court seen in STRICT TOP-DOWN ORTHOGRAPHIC VIEW, looking straight down from directly
above. No perspective whatsoever, no splayed walls, no three-quarter angle - a flat plan, as in
a technical drawing. The playing surface is a rectangle EXACTLY TWICE AS LONG AS IT IS WIDE. The
enclosing walls are drawn as thin outlines around that rectangle, not as receding surfaces. The
net crosses the exact middle as a straight line. Each half carries the service line and the
centre line forming a T. Empty court, no players, no equipment, no shadows.

Square composition.
```

## Asset 4 - `plate-pala.png` - pagina « diventa coach »

```
<STYLE BLOCK>

A single padel racket seen face-on, centred, filling most of the image. It is a SOLID PERFORATED
SLAB with a teardrop silhouette, pierced by about forty round holes of equal diameter on a
staggered grid. It has NO STRINGS and NO STRUNG FACE - it is not a tennis racket. The grip is
SHORT, wrapped in tape, with a wrist cord hanging from its base. Nothing else in the image.

Square composition.
```

## Asset 5 - `plate-palla-rete.png` - stato vuoto « Palla a rete! »

```
<STYLE BLOCK>

A single padel ball come to rest against the square mesh of a net, seen frontally and close up.
The ball shows its two-lobed curved seam. The mesh deforms slightly around it. The ball is the
one object allowed the optic yellow accent, covering no more than two percent of the image. No
posts, no ground, no players, no perspective - only the ball and the mesh around it.

Square composition.
```

---

## Verifica prima dell'ingestione

Invarianti di `SYSTEM.md` § 8, uno alla volta, mai in fiducia:

- [ ] **Asset 1** - angolo misurato ≈ 25° dall'orizzontale, **non 45°**. È il difetto che questa
      rigenerazione deve risolvere: se torna a 45°, la rigenerazione è fallita.
- [ ] **Asset 2 e 4** - la pala/le pareti: **nessuna corda**, nessun piatto incordato.
- [ ] **Asset 2** - campo chiuso su 4 lati, rete che si abbassa **al centro**.
- [ ] **Asset 3** - proporzione **esattamente 2:1** e vista **zenitale**, senza prospettiva. Sulla
      planche d'ancrage il modello ha sbagliato entrambe su tutte e quattro le varianti (rapporti
      1,24-1,66, tutte in assonometria): è l'errore atteso di questo asset.
- [ ] **Asset 4** - impugnatura corta + cordino, silhouette a goccia.
- [ ] **Asset 5** - cucitura a **due** lobi, mai tre.
- [ ] **Tutti** - nessuna scritta, nessun numero, nessuna didascalia.
- [ ] **Tutti** - il giallo su **un solo oggetto** e sotto il 2 % della superficie.

## Trappole e falsi positivi noti

- **L'antialiasing dei bordi NON è rilievo metallico.** Segnalato due volte come difetto nei lotti
  precedenti, falso entrambe le volte (deviazione standard interna al tratto < 1,4 su 255). Non
  « correggerlo ».
- **Non chiedere dimensioni in pixel**: il tool le ha ignorate due volte su due. Si ritaglia
  all'ingestione.
- Nessun alpha nativo: il fondo blu pieno è voluto, il detourage viene dopo.
- Non cancellare nulla: grezzi in `_raw/`, `grip-banda.png` v1 resta dov'è.
