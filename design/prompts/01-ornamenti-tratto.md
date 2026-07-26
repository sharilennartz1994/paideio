# Lotto 01 — Ornamenti capostipite (registro TRATTO)

**Registro**: TRATTO (`SYSTEM.md` § 2a, versione congelata post-ancrage).
**Referenza immagine**: `design/assets/00-anchor/anchor-sheet-v1.png` su **tutti** i prompt di
questo lotto (sono tutti oggetti disegnati, nessun prompt « vuoto »).
**Destinazione**: `design/assets/motifs/` — grezzi in `design/assets/_raw/`.

Regola di sequenziamento del metodo: **l'ornamento capostipite di un motivo si genera prima delle
sue declinazioni**, e poi serve lui stesso da referenza per quelle. Questo lotto produce i quattro
capostipiti al tratto; le declinazioni (barre di avanzamento, puce, chip) vengono dopo.

I quattro motivi restanti non sono in questo lotto perché non appartengono a questo registro:
granulo, malla e foratura sono texture (registro MATERIA, lotto 02), vetro è un contenitore che
si fa in CSS e non come immagine.

---

## Struttura di ogni prompt

STYLE BLOCK verbatim (qui sotto) + descrizione dell'asset + vincolo di inquadratura + dimensione
in lettere. **Lo STYLE BLOCK non si parafrasa mai.**

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

## Asset 1 — `cucitura-divisore.png` (motivo 01)

```
<STYLE BLOCK>

A single horizontal ornament: one continuous S-shaped curve with two symmetrical lobes, the seam
of a padel ball abstracted into pure line. The stroke keeps exactly the same width along its
whole length. Both ends are cut square. It is NOT a closed circle and NOT a ball — only the seam
curve, alone, centred, on an empty background with generous margin above and below.

Wide image, one thousand six hundred pixels wide by four hundred pixels tall.
```

## Asset 2 — `linea-servizio-divisore.png` (motivo 04)

```
<STYLE BLOCK>

A single ornament: two straight strokes meeting at a right angle to form a T — one long
horizontal stroke, one short vertical stroke descending from its exact centre. The strokes have
the slightly irregular edges of painted court lines, as if brushed onto a surface. The ends are
cut square, never rounded. Nothing else in the image, centred, generous empty margin.

Wide image, one thousand six hundred pixels wide by four hundred pixels tall.
```

## Asset 3 — `rete-fascia.png` (motivo 05)

```
<STYLE BLOCK>

A single horizontal ornamental band: a solid filled strip along the top, and below it a square
woven mesh whose cells grow progressively larger toward the bottom of the band. It reads as the
top band and netting of a padel net, flattened into a frontal ornament. No posts, no ground, no
perspective. The band spans the full width of the image, edge to edge, and must tile seamlessly
left and right.

Wide image, one thousand six hundred pixels wide by four hundred pixels tall.
```

## Asset 4 — `grip-banda.png` (motivo 06)

```
<STYLE BLOCK>

A single ornamental band of parallel diagonal stripes, all inclined at twenty-five degrees, each
stripe carrying one thinner line along one edge where the wrapping overlaps — the abstraction of
grip tape spiralling around a handle. Uniform stripe width, uniform spacing. The band spans the
full width of the image, edge to edge, and must tile seamlessly left and right.

Wide image, one thousand six hundred pixels wide by four hundred pixels tall.
```

---

## Verifica prima dell'ingestione

- [ ] **Spessore del tratto uniforme** su tutta la lunghezza, in tutti e quattro. È il parametro
      che deriva di più.
- [ ] **Estremi tagliati netti**, mai arrotondati, mai assottigliati.
- [ ] **Nessun rilievo metallico / sbalzo**: era la deriva della planche d'ancrage, gli interdetti
      sono stati rinforzati apposta. Se ricompare, è la correzione che non ha preso.
- [ ] **Cucitura**: due lobi, curva aperta, **mai un cerchio chiuso**.
- [ ] **Rete e grip**: raccordo orizzontale verificabile (`tools/qa_assets.py tile`, soglia
      < 12/255). Se non raccordano, ritagliare a metà intervallo, non al bordo.
- [ ] **Nessuna scritta** in nessuno dei quattro.
- [ ] **Dimensione reale su disco** pari a quella chiesta. Sulla planche d'ancrage il tool ha
      restituito 1254 px invece dei 2048 chiesti: **misurare, non presumere**.

## Trappole

- Nessun alpha nativo: il fondo blu pieno è voluto, il detourage viene dopo con
  `tools/key_bg.py`. Non chiedere « PNG trasparente ».
- Non cancellare nulla: i grezzi restano in `_raw/`.

---

## Rapporto di generazione e verifica — 25 luglio 2026

Generazione eseguita con `image_gen.imagegen`, usando
`/Users/shari/Progetti/Paideio/design/assets/00-anchor/anchor-sheet-v1.png` come immagine di
referenza in tutte e quattro le chiamate. I file in `_raw/` e `motifs/` sono copie binariamente
identiche degli output originali (verificato con SHA-256); non sono stati ridimensionati,
ritagliati o corretti.

### File scritti e dimensioni reali

- `/Users/shari/Progetti/Paideio/design/assets/motifs/cucitura-divisore.png` — **1983 × 793 px**
- `/Users/shari/Progetti/Paideio/design/assets/_raw/cucitura-divisore.png` — **1983 × 793 px**
- `/Users/shari/Progetti/Paideio/design/assets/motifs/linea-servizio-divisore.png` —
  **1983 × 793 px**
- `/Users/shari/Progetti/Paideio/design/assets/_raw/linea-servizio-divisore.png` —
  **1983 × 793 px**
- `/Users/shari/Progetti/Paideio/design/assets/motifs/rete-fascia.png` — **1774 × 887 px**
- `/Users/shari/Progetti/Paideio/design/assets/_raw/rete-fascia.png` — **1774 × 887 px**
- `/Users/shari/Progetti/Paideio/design/assets/motifs/grip-banda.png` — **1774 × 887 px**
- `/Users/shari/Progetti/Paideio/design/assets/_raw/grip-banda.png` — **1774 × 887 px**

Nessun output rispetta la dimensione richiesta di 1600 × 400 px.

### Verdetti per asset

#### `cucitura-divisore.png`

- Spessore geometrico uniforme: **sì**, sostanzialmente costante lungo la curva.
- Estremi tagliati netti e non assottigliati: **sì**.
- Curva aperta a due lobi, non cerchio chiuso: **sì**.
- Nessuna scritta: **sì**.
- Rilievo metallico/sbalzo ricomparso: **sì, lieve**. Sono visibili variazioni tonali lungo il
  tratto e una lieve ombreggiatura/alone; la correzione non ha preso pienamente.
- Dimensione richiesta rispettata: **no** (1983 × 793 px).

#### `linea-servizio-divisore.png`

- Spessore uniforme: **sì**, salvo la lieve irregolarità pittorica richiesta ai bordi.
- Estremi tagliati netti e non assottigliati: **sì**.
- Geometria a T con verticale dal centro: **sì**.
- Nessuna scritta: **sì**.
- Rilievo metallico/sbalzo ricomparso: **sì, lieve**. Il tratto mostra variazioni tonali e un
  piccolo alone/ombra; la correzione non ha preso pienamente.
- Dimensione richiesta rispettata: **no** (1983 × 793 px).

#### `rete-fascia.png`

- Spessore uniforme: **parziale**. La struttura è regolare, ma banda, maglie e trattamento
  luminoso producono spessori visivi non completamente uniformi.
- Estremi/intersezioni tagliati netti: **no**. Diverse giunzioni e celle appaiono leggermente
  arrotondate.
- Banda superiore e maglia crescente verso il basso, frontale e senza prospettiva: **sì**.
- Nessuna scritta: **sì**.
- Rilievo metallico/sbalzo ricomparso: **sì**. Sono evidenti ombreggiatura, alone e variazioni
  luminose; la correzione non ha preso.
- Dimensione richiesta rispettata: **no** (1774 × 887 px).
- Raccordo orizzontale: **46,9/255**, quindi **non supera** la soglia richiesta `< 12/255`.
  Il composito QA è stato scritto in `/tmp/rete-fascia-tile2x2.png`.

#### `grip-banda.png`

- Spessore e spaziatura uniformi: **sì**, nel complesso.
- Estremi tagliati netti: **sì**, troncati dai bordi dell'immagine.
- Inclinazione richiesta di 25°: **no**; visivamente le bande risultano molto più ripide.
- Linea sottile di sovrapposizione su ciascuna banda: **sì**.
- Nessuna scritta: **sì**.
- Rilievo metallico/sbalzo ricomparso: **sì, lieve**. Persistono variazioni tonali e una lieve
  ombreggiatura/alone; la correzione non ha preso pienamente.
- Dimensione richiesta rispettata: **no** (1774 × 887 px).
- Raccordo orizzontale: **42,2/255**, quindi **non supera** la soglia richiesta `< 12/255`.
  Il composito QA è stato scritto in `/tmp/grip-banda-tile2x2.png`.

### QA raccordo

Comandi eseguiti senza modificare gli asset:

```text
python3 design/tools/qa_assets.py tile design/assets/motifs/rete-fascia.png /tmp/rete-fascia-tile2x2.png
python3 design/tools/qa_assets.py tile design/assets/motifs/grip-banda.png /tmp/grip-banda-tile2x2.png
```

- `rete-fascia.png`: raccordo sinistra/destra **46,9/255** (alto/basso 1,1/255).
- `grip-banda.png`: raccordo sinistra/destra **42,2/255** (alto/basso 33,4/255).

Entrambi i raccordi orizzontali falliscono il target `< 12/255`; la discontinuità è visibile
anche nei compositi 2×2.

### Limiti

- Non ho ridimensionato gli output a 1600 × 400 px: il contratto richiedeva di conservare gli
  originali e di riportare onestamente le dimensioni realmente restituite.
- Non ho ritagliato, corretto o rigenerato rete e grip per migliorare il raccordo: l'istruzione
  richiedeva di riportare i valori senza intervenire.
- Non ho rimosso il fondo blu e non ho richiesto alpha/trasparenza, perché il fondo pieno è
  intenzionale e il chroma-key appartiene a una fase successiva.
- Non ho corretto localmente rilievo, ombre, inclinazione o terminali: i file consegnati restano
  gli output intatti del generatore.
- Non ho cancellato file né modificato codice applicativo, anchor sheet, audit o altri documenti
  fuori dall'ambito autorizzato.
