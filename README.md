# Paideio

Marketplace italiano per trovare coach di padel, confrontare disponibilità e
prezzi e richiedere lezioni singole o di gruppo. I coach gestiscono profilo,
campi, orari e richieste dalla propria dashboard.

Produzione: [playpaideio.com](https://playpaideio.com)

## Stack

- Next.js 16 App Router, React 19 e TypeScript
- Tailwind CSS v4 e componenti shadcn basati su Base UI
- Drizzle ORM su Postgres Neon
- Clerk per autenticazione e ruoli
- Vercel per hosting, Blob e dominio

## Avvio locale

```bash
npm install
npm run dev
```

L’app usa `.env.local`. Sviluppo e produzione condividono ancora lo stesso
database Neon: **non eseguire `npm run db:seed` senza aver letto
[`docs/PRODUCTION-HANDOFF.md`](./docs/PRODUCTION-HANDOFF.md)**.

## Verifica

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Documentazione

- [`docs/PRODUCTION-HANDOFF.md`](./docs/PRODUCTION-HANDOFF.md) — runbook operativo
- [`AGENTS.md`](./AGENTS.md) — architettura, convenzioni e stato funzionale
- [`PRODUCT.md`](./PRODUCT.md) — utenti, scopo e principi di prodotto
- [`DESIGN.md`](./DESIGN.md) — identità e regole visuali
- [`design/HANDOFF.md`](./design/HANDOFF.md) — handoff sintetico di design
- [`docs/EMAIL-SETUP.md`](./docs/EMAIL-SETUP.md) — configurazione email feedback
