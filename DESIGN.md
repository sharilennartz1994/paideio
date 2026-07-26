# Paideio — Game Arena

## Thesis

Paideio deve sembrare il menu vivo di un gioco online di padel contemporaneo:
un’arena utile dove cercare un coach e prenotare è già parte del divertimento.
Nessun dato finto, nessuna gamification generica.

## Visual world

- Modalità giorno predefinita: fondo `Court Daylight` azzurro ghiaccio,
  superfici chiare blu-lavanda e shell `Game Ink`.
- Modalità notte opzionale: fondo `Game Ink` quasi nero-blu.
- `Game Blue` per masse e selezioni strutturali.
- `Game Cyan` per navigazione, focus e vetro.
- `Game Ball` per la sola azione primaria.
- `Game Orange` per impatto, errore e urgenza.
- In modalità giorno gli accenti usati come testo passano dai token
  `accent-*-ink` più scuri; i colori brillanti restano per fondi, asset e
  superfici. Non usare `text-game-ball/cyan/orange` direttamente sul chiaro.
- Asset comic/cel-shaded scontornati; massimo uno dominante per viewport.

## Typography

- `Oxanium`: titoli, dati, label HUD, CTA. Peso 600–800.
- `Hanken Grotesk`: testo, form, descrizioni e contenuto lungo.
- Titoli compatti, sportivi, con tracking negativo moderato; niente serif.

## Geometry

Angoli smussati/tagliati, bordi netti, ombre hard-edge corte. Le pillole sono
riservate a filtri compatti e stato. Card operative senza decorazione gratuita.

## Motion

- Focal moment home: il giocatore e il pannello di ricerca hanno profondità
  fisica leggera, legata al puntatore e sempre interrompibile.
- Continuità: ingresso route 220 ms; sezioni chiave entrano una volta con
  stagger massimo 110 ms; una traiettoria gialla mostra la posizione reale
  nella pagina.
- Feedback: press CTA 120-150 ms, riflesso direzionale su hover e
  pallina-impact al puntatore. Nessun effetto ritarda l’azione.
- Card esplorabili: sollevamento massimo 3 px; tilt riservato ai due oggetti
  principali, solo con puntatore fine.
- Loader: scambio orizzontale della pallina.
- Reduced motion: restano opacità e colore; tilt, traiettoria, impact e
  spostamenti vengono rimossi.
- Il cambio tema è rappresentato da una pallina che attraversa il toggle tra
  sole e luna in 220 ms; i colori cambiano senza una transizione globale lenta.

## Component language

Primitive canoniche esportate da `@/components/design`. Lucide resta per
azioni e navigazione; i PNG raccontano il mondo e gli stati. CTA primarie con
pallina micro, pannelli come HUD, overgrip come confine fra macro-sezioni.
