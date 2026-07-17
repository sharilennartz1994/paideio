# Paideio

Marketplace per trovare coach di padel e prenotare lezioni singole o di gruppo. Due ruoli: giocatore (cerca e prenota) e coach (gestisce campi, orari, tipo di allenamento, livelli, richieste).

Il nome viene dal greco antico παιδεία (paideia): la formazione della persona attraverso la pratica e la guida di un maestro.

## Stack

Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4, shadcn/ui su Base UI, Drizzle ORM su SQLite locale, autenticazione Clerk.

Dettagli architetturali, convenzioni e decisioni di design: vedi [`AGENTS.md`](./AGENTS.md).

## Avvio rapido

```bash
npm install
npm run db:seed   # crea e popola paideio.db con dati demo
npm run dev        # http://localhost:3000
```

Il seed crea tre coach demo pubblici (Elena Ferraro, Davide Conti, Giulia Romano), navigabili senza autenticazione. Per provare il flusso giocatore/coach completo, registrati con Clerk e usa "Diventa coach" per passare al ruolo coach.

## Comandi

- `npm run dev` — dev server
- `npm run build` — build di produzione
- `npm run lint` — ESLint
- `npm run db:seed` — resetta e ripopola il database demo
- `npm run db:push` — applica lo schema Drizzle al DB locale
