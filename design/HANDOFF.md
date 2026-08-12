# Handoff design - Paideio Game Arena

Ultimo aggiornamento: 26 luglio 2026.

## Direzione approvata

Paideio è un marketplace di coach di padel con un’identità comic/cel-shaded
ispirata al linguaggio dei giochi sportivi contemporanei. Il gioco è una
grammatica visiva, non una promessa di gamification: l’utente deve capire
subito che può trovare un coach e prenotare una lezione.

La modalità giorno è il default; la modalità notte è opzionale. Entrambe
devono rispettare WCAG 2.2 AA.

## Fonti normative

1. `PRODUCT.md` - verità di prodotto.
2. `DESIGN.md` - tesi e regole visuali correnti.
3. `design/SYSTEM.md` - token e grammatica completa.
4. `design/IMPLEMENTATION-BRIEF.md` - traduzione tecnica.
5. `AGENTS.md` - convenzioni architetturali e stato del prodotto.

I documenti storici e gli screenshot di audit non sono parte della runtime.

## Implementazione corrente

- Token e motion: `src/app/globals.css`.
- Primitive: `src/components/design/`.
- Asset runtime: `public/design/game/`.
- Icone proprietarie PNG: `public/design/icons/`.
- Registry asset: `src/components/design/field-assets.tsx`.
- Catalogo componenti: `/design-system`.
- Logo e favicon raster: `public/brand/`, `src/app/icon.png`,
  `src/app/apple-icon.png`.

Non introdurre SVG per logo, asset o icone. Le icone PNG sono applicate come
CSS mask per ereditare `currentColor`.

## Regole da non riaprire senza richiesta

- Nome sempre “Paideio”; “paideia” indica il concetto greco.
- Un solo asset illustrato dominante per viewport.
- CTA primaria giallo-pallina, con angoli tagliati e bordo completo anche
  sulle diagonali.
- Il testo del servizio prevale sempre sulla metafora del gioco.
- Motion causale e one-shot; fallback statico sotto
  `prefers-reduced-motion`.
- Nessun dato, premio, classifica o progresso inventato.
- Le pagine Academy sono moduli didattici, non liste.

## Accessibilità

- Contrasto testo normale ≥ 4.5:1; testo grande e contorni UI ≥ 3:1.
- Target interattivi minimi 44×44 px.
- Focus visibile e navigazione completa da tastiera.
- Un solo landmark `main`, fornito da `src/app/layout.tsx`.
- Tema giorno e notte vanno verificati separatamente.

## Asset

I master approvati sono in `design/assets-comic/`; i file serviti dal sito
sono in `public/design/game/`. Le versioni `_raw`, gli archivi scartati e gli
screenshot di audit sono locali e non vengono pubblicati.

Per aggiungere un’icona aggiornare:

1. `scripts/generate-paideio-icons.mjs`;
2. `src/components/icons/paideio-icon-names.ts`;
3. gli alias in `src/components/icons/paideio-icons.tsx`;
4. rigenerare i PNG e verificare `/design-system`.
