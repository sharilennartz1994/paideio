# Lotto 00 — Planche d'ancrage

**Obiettivo**: una sola immagine che raduna 8 oggetti emblematici del padel nello stile mirato.
È lei — molto più delle parole dei prompt — che terrà la coerenza su tutta la biblioteca. Diventa
la `referenced_image_paths` di ogni generazione successiva.

**Registro**: INCISIONE (`SYSTEM.md` § 2b).
**Varianti da generare**: 4. L'utente ne sceglie una, le altre restano in `_raw/`.
**Destinazione**: `design/assets/00-anchor/anchor-candidate-{1,2,3,4}.png`
La vincitrice viene rinominata `anchor-sheet-v1.png`.

**Nessuna immagine di riferimento** su questo lotto: è la prima, non esiste ancora una referenza.

---

## Prompt, da consegnare tale e quale

> Lo STYLE BLOCK va copiato **verbatim**, mai parafrasato. È il primo paragrafo qui sotto.

```
Detailed engraved illustration in the manner of a 19th-century patent plate, built entirely from
parallel hatching and cross-hatching; volume is described by line density only. Confident
MEDIUM-WEIGHT contour strokes, about three times thicker than the hatching lines, of even width.
Warm pale sand #EAE3D6 ink on a flat deep blue resin background #0F2233, with at most one small
area of optic yellow #D6E32B. Strictly two-dimensional, flat frontal or three-quarter view. No 3D
relief, no soft shading, no shadows, no photorealism, no gradients, no text or lettering, no
kitsch, no clip-art, no watermark, no neon, no bloom. Quiet, precise, timeless.

A specimen plate arranging eight padel objects in a regular grid, two rows of four, each object
centred in its own cell and drawn at a consistent visual scale. Flat frontal composition, generous
negative space between the objects, no frame, no border, no captions, no numbers.

The eight objects, in this order:
1. A padel racket seen face-on: a SOLID PERFORATED SLAB, teardrop silhouette, pierced by about
   forty round holes of equal size on a staggered grid, with a SHORT grip and a wrist cord.
   It has NO STRINGS and NO STRUNG FACE — it is not a tennis racket.
2. A padel ball, showing the two-lobed curved seam.
3. A padel court seen from directly above: a rectangle twice as long as it is wide, ENCLOSED ON
   ALL FOUR SIDES by walls, with the painted service lines and centre line forming a T on each
   half.
4. A single tempered glass panel seen face-on, with one round fixing bolt at each of its four
   corners.
5. A section of diamond-mesh wire fencing.
6. A roll of grip tape, partly unwound, the tape spiralling at a shallow angle.
7. A padel net seen from the front with its post: the net SAGS LOWER AT THE CENTRE than at the
   posts.
8. A pressurised tube holding three padel balls, seen face-on.

Square image, two thousand forty-eight pixels by two thousand forty-eight pixels.
```

---

## Invarianti da verificare su OGNI variante, uno alla volta

Da `SYSTEM.md` § 8. Il metodo è esplicito: mai in fiducia, un oggetto per volta.

- [ ] **Oggetto 1** — la pala è una lastra piena forata, **senza corde**. Se ha un piatto
      incordato è una racchetta da tennis → variante rifiutata su questo punto.
- [ ] **Oggetto 1** — impugnatura **corta**, mai manico lungo da tennis.
- [ ] **Oggetto 2** — cucitura a **due** lobi, mai tre, mai una linea dritta.
- [ ] **Oggetto 3** — campo **chiuso su 4 lati**. Un campo aperto è rifiutato.
- [ ] **Oggetto 3** — proporzione 2:1 (20 × 10 m).
- [ ] **Oggetto 4** — **quattro** fissaggi, uno per angolo.
- [ ] **Oggetto 7** — la rete **si abbassa al centro**, non ai pali.
- [ ] **Tutti** — nessuna scritta, nessun numero, nessuna didascalia dentro l'immagine.
- [ ] **Tutti** — spessore del tratto: contorni ~3× il tratteggio, **uniforme**. È il parametro
      che deriva di più e va validato **qui**, non al lotto 3.

## Trappole note (`references/2-generation-assets.md`)

- `image_gen.imagegen` **non produce alpha nativo**. Non chiedere « PNG trasparente »: darebbe una
  scacchiera dipinta dentro l'immagine. Il fondo blu pieno è voluto — serve al chroma-key dopo.
- Esportare alla dimensione chiesta, non a miniatura.
- Consegnare i grezzi in `_raw/`, non cancellare nulla.
