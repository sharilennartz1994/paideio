# Lotto 02 — Texture tileabili (registro MATERIA)

**Registro**: MATERIA (`SYSTEM.md` § 2c, congelato).
**Referenza immagine**: **NESSUNA. Su nessuno dei quattro prompt.**
**Destinazione**: `design/assets/patterns/` — grezzi in `design/assets/_raw/`.

> **Perché nessuna referenza.** È la trappola più costosa della pipeline: su un prompt « vuoto »
> (una texture senza soggetto) il modello riempie il vuoto con gli oggetti dell'immagine di
> referenza. Passare `anchor-sheet-v1.png` qui produrrebbe texture con pale e palline dentro.
> Se un asset di questo lotto contiene un oggetto riconoscibile, è questa la causa.

---

## STYLE BLOCK, verbatim

```
Flat seamless tileable surface texture, edge-to-edge, with no framing, no border, no vignette and
no isolated object anywhere in the image. Uniform density across the whole square; the pattern
must repeat without a visible seam on all four edges. Very low contrast, no more than eight
percent between lightest and darkest value. Deep blue resin #0F2233 base with markings in a
slightly lighter blue. Strictly two-dimensional and perfectly flat. No 3D relief, no embossing,
no metallic sheen, no shading, no shadows, no photorealism, no gradients, no text or lettering,
no objects, no illustration, no focal point, no neon. Quiet, material, timeless.
```

---

## Asset 1 — `granulo.png` (motivo 07)

```
<STYLE BLOCK>

Fine irregular granular speckle, the silica sand dressed between the fibres of an artificial turf
court. Thousands of tiny dots of slightly varying size, scattered with even density and no
clustering, no pattern, no alignment. Extremely subtle: at a glance the square should read as an
almost plain surface.

Square composition.
```

## Asset 2 — `malla.png` (motivo 03)

```
<STYLE BLOCK>

A regular lattice of diamonds, the abstraction of diamond-mesh wire fencing. Single line weight
throughout, every line the same width. The crossings are plain line intersections and are NOT
marked with knots, dots or thickenings. Even spacing, the diamonds all identical.

Square composition.
```

## Asset 3 — `foratura.png` (motivo 02)

```
<STYLE BLOCK>

A field of small circles of identical diameter arranged on a staggered grid, the abstraction of
the drilled holes of a padel racket face. Each circle's diameter is about one third of the
distance between circle centres. Even spacing in all directions, no variation in size, no
silhouette containing them — the field runs edge to edge.

Square composition.
```

## Asset 4 — `rete-tessitura.png` (motivo 05)

```
<STYLE BLOCK>

A regular square weave, the abstraction of netting: two sets of parallel lines crossing at right
angles, forming identical square cells. Single uniform line weight. No top band, no posts, no
sag, no perspective — only the flat weave, running edge to edge with identical cells everywhere.

Square composition.
```

---

## Verifica prima dell'ingestione

- [ ] **Nessun oggetto riconoscibile** dentro la texture (vedi il riquadro sopra: sarebbe la
      referenza infiltrata).
- [ ] **Contrasto ≤ 8 %** fra il valore più chiaro e il più scuro. Misurabile, non a occhio.
- [ ] **Tuilage su tutti e quattro i bordi** — `tools/qa_assets.py tile`, soglia < 12/255.
      Se fallisce, ritagliare a metà intervallo, mai al bordo.
- [ ] **Densità uniforme**: nessun punto focale, nessun addensamento in un angolo.
- [ ] **Nessuna scritta.**

## Trappole e falsi positivi noti

- **L'antialiasing dei bordi NON è rilievo metallico.** Nei due lotti precedenti è stato segnalato
  due volte come difetto e in entrambi i casi era falso (deviazione standard interna al tratto
  < 1,4 su 255). Non « correggerlo ».
- **Non chiedere dimensioni in pixel**: `image_gen.imagegen` le ha ignorate due volte su due. Si
  ritaglia all'ingestione.
- Nessun alpha nativo: qui non serve, le texture restano su fondo pieno.
- Non cancellare nulla: grezzi in `_raw/`.
