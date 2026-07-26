# Lotto 04 — Divisori (declinazioni) + tavola-campione delle icone

**Registro**: TRATTO (`SYSTEM.md` § 2a, congelato) per tutti e cinque.
**Destinazione**: divisori in `design/assets/dividers/`, tavola icone in `design/assets/icons/`
— grezzi in `design/assets/_raw/`.

**Referenze, diverse per asset** — regola di sequenziamento del metodo: *l'ornamento capostipite di
un motivo serve da referenza alle sue declinazioni*, non la planche d'ancrage.

| Asset | Referenza |
|---|---|
| 1, 2, 4 (famiglia cucitura) | `design/assets/motifs/cucitura-divisore.png` |
| 3 (famiglia linea di servizio) | `design/assets/motifs/linea-servizio-divisore.png` |
| 5 (tavola icone) | `design/assets/00-anchor/anchor-sheet-v1.png` |

---

## STYLE BLOCK TRATTO, verbatim

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

---

## Asset 1 — `dividers/divider-sezione.png`

Divisore di sezione a piena larghezza: la frontiera fra due sezioni della home.

```
<STYLE BLOCK>

A horizontal section divider: one long straight rule running the full width of the image, broken
at its exact centre by the two-lobed S-curve seam ornament, which sits in the gap and reconnects
the rule on either side. The rule and the curve share exactly the same stroke width. Both far
ends of the rule are cut square. Nothing else in the image; generous empty space above and below.

Very wide landscape composition, many times wider than tall.
```

## Asset 2 — `dividers/divider-corto.png`

Ornamento breve centrato, rango « gioiello »: punteggia, non separa.

```
<STYLE BLOCK>

A small centred ornament, alone: the two-lobed S-curve seam, compact, with a short straight
stroke extending from each of its two ends and stopping after a small distance. It reads as a
delicate typographic ornament, the kind that punctuates a page rather than dividing it. Nothing
else; wide empty margins all around.

Wide landscape composition.
```

## Asset 3 — `dividers/divider-t-larga.png`

Frontiera di sezione derivata dalla T del campo.

```
<STYLE BLOCK>

A horizontal section divider built from painted court lines: one long straight rule running the
full width of the image, with three short vertical strokes descending from it — one at the exact
centre, longer, and one on each side at equal distance, shorter. All strokes share the same width
and all ends are cut square, never rounded. Nothing else in the image.

Very wide landscape composition, many times wider than tall.
```

## Asset 4 — `dividers/divider-fine.png`

Marca di fine contenuto.

```
<STYLE BLOCK>

An end-of-content mark: three identical small two-lobed S-curve seam ornaments in a horizontal
row, evenly spaced, centred together in the image with wide empty margins around the group. All
three are exactly the same size and the same stroke width.

Wide landscape composition.
```

## Asset 5 — `icons/icone-tavola.png`

**Tavola-campione**, non icone da spedire. Fissa il disegno e il vocabolario formale; il ritaglio
a 24 px non si fa da qui — le icone finali si ridisegnano in SVG su griglia (vedi § Limiti).

```
<STYLE BLOCK>

A specimen plate of twelve pictogram icons arranged in a regular grid, three rows of four, each
icon centred in its own cell and drawn at exactly the same visual size and the same stroke width
as all the others. Each icon is built on a square grid, using only two line weights: a main
weight for the outline and a thinner weight for interior detail. Simple, geometric, closed forms.
No frame, no border, no captions, no numbers, no labels.

The twelve icons, in this order:
1. A magnifying glass.
2. A calendar page with a grid of cells.
3. A map location pin.
4. A five-pointed star, outline only.
5. A heart, outline only.
6. A single person bust, head and shoulders.
7. A clock face with two hands.
8. Three ascending bars of increasing height, denoting a skill level.
9. A speech bubble, rectangular with a small tail.
10. A padel racket seen face-on: a solid slab pierced with round holes, short grip. NOT strung.
11. A check mark inside a circle.
12. A cross inside a circle.

Square composition.
```

---

## Verifica prima dell'ingestione

- [ ] **Asset 1, 3** — la riga arriva davvero **da bordo a bordo**? Se il modello la centra
      lasciando margini, il divisore non è a piena larghezza e va ritagliato o rifatto.
- [ ] **Asset 1** — la curva e la riga hanno **lo stesso spessore**. Se la curva è più grassa,
      l'ornamento litiga con la riga.
- [ ] **Asset 2, 4** — nessun bordo, nessuna cornice attorno all'ornamento.
- [ ] **Asset 4** — **tre** ornamenti, identici fra loro, non due né quattro.
- [ ] **Asset 5** — **dodici** icone, 3 righe × 4. Spessore di tratto **identico** fra tutte:
      è il difetto atteso di una tavola di icone generata.
- [ ] **Asset 5, icona 10** — la pala è una lastra forata, **senza corde**.
- [ ] **Tutti** — estremi tagliati netti, nessuna scritta, nessun numero.

## Trappole e falsi positivi noti

- **L'antialiasing dei bordi NON è rilievo metallico.** Segnalato come difetto in due lotti su due,
  falso entrambe le volte (deviazione standard interna al tratto < 1,4 su 255). Non « correggerlo ».
- **Non chiedere dimensioni in pixel**: il tool le ha ignorate due volte su due. Si ritaglia
  all'ingestione.
- Nessun alpha nativo: fondo blu pieno, detourage dopo.
- Non cancellare nulla: grezzi in `_raw/`.

## Limiti previsti di questo lotto

La tavola dell'asset 5 **non produce icone utilizzabili a 24 px**. Il sistema (`SYSTEM.md` § 4)
richiede griglia 24 px e due soli spessori di tratto; un raster generato e riscalato a 24 px
diventa impastato e con spessori incoerenti da un'icona all'altra. La tavola serve a fissare il
disegno e il vocabolario formale: le icone di produzione vanno **ridisegnate in SVG** su griglia
a partire da essa. Questo passaggio non appartiene a questo lotto.
