# Paideio Game Mode — componenti

Catalogo visuale locale: `http://localhost:3000/design-system`.

Tipografia corrente: Oxanium per display, CTA e HUD; Hanken Grotesk per il
corpo. La grammatica è quella di un gioco online di padel, senza punteggi o
progressi fittizi.

## Import

```tsx
import {
  GameAsset,
  GameBadge,
  GameCta,
  GameDivider,
  GameEmptyState,
  GameLoader,
  GamePanel,
  GameSectionHeading,
  GameSkeleton,
  GameStat,
} from "@/components/design";
```

## Primitive

### `GameCta`

Varianti: `primary`, `ball`, `outline`, `quiet`, `danger`.

- `ball` è riservata all’azione primaria ad alto impatto.
- `showBall` usa esclusivamente `micro/ball-micro.png`.
- `href` produce un link Base UI correttamente configurato con
  `nativeButton={false}`.
- Le etichette restano su una riga e descrivono l’azione.

### `GameDivider`

Marcatura di campo modulare con elementi ripetuti orizzontalmente. Variante
standard fra macro-sezioni, `compact` dentro superfici più piccole. Il PNG
overgrip non è più un divider: il grip viene usato come asset editoriale
nella pagina Academy sull’attrezzatura.

### `GameLoader`

Loader accessibile con `role="status"` e label personalizzabile. La pallina
si muove orizzontalmente come uno scambio; nessun bounce decorativo. Le
animazioni si disattivano con `prefers-reduced-motion`.
`FullScreenGameLoader` è l’unico stato di attesa per navigazioni e mutazioni:
copre l’intero viewport e mantiene una label operativa visibile.

### `GameBadge`

Toni: `neutral`, `info`, `success`, `pending`, `danger`. Il testo e, dove
utile, l’icona rendono lo stato comprensibile senza dipendere dal colore.

### `GamePanel`

Toni: `default`, `quiet`, `cyan`, `ball`. Contiene informazioni correlate;
non è una card decorativa universale.

### `GameStat`

Dato, etichetta e confronto breve. Accenti ammessi: `cyan`, `ball`, `orange`.

### `GameSkeleton`

Placeholder strutturale per caricamenti di liste, profili e pannelli. Usa
una singola sweep animation e conserva l’ingombro del contenuto.

### `GameEmptyState`

Composizione condivisa di asset, titolo, descrizione e azione. Associazioni
canoniche:

- ricerca: `bandejaTrail`;
- prenotazioni: `shoes`;
- preferiti: `backpack`;
- richieste coach: `ballBasket`;
- campi: `meshModule`;
- orari: `pickupTube`;
- 404: `ball`;
- errore: `net`.

### `GameAsset`

Registry tipizzato con dimensioni intrinseche e alt italiano. Gli asset
decorativi usano `decorative`; `preload` è riservato all’unico LCP della
pagina. I due campi non sono presenti nel registry finché non vengono
ricostruiti con geometria FIP verificata.

## Regole di composizione

- Massimo un asset narrativo dominante per viewport.
- Le icone funzionali restano Lucide.
- Personaggi e attrezzatura usano `object-contain`, senza crop anatomici.
- Nessuna ombra o glow aggiuntiva sulle illustrazioni.
- L’immagine non sostituisce mai testo, stato o affordance.
- La pallina micro può vivere fra 16 e 32 px; la pallina core parte da 96 px.
