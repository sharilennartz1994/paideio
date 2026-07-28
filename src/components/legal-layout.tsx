import type { ReactNode } from "react";
import { AlertTriangle } from "@/components/icons/paideio-icons";

/**
 * Impaginazione condivisa delle pagine legali (/termini, /privacy).
 *
 * Testo lungo da leggere, non un momento editoriale: niente asset dominanti,
 * misura di riga contenuta (~70ch), gerarchia piatta e ancore stabili su ogni
 * sezione, così un articolo si può linkare in una discussione.
 */

export function LegalPage({
  kicker,
  title,
  intro,
  updatedAt,
  children,
}: {
  kicker: string;
  title: string;
  intro: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <div>
      <header className="relative overflow-hidden border-b border-game-cyan/22 bg-game-ink px-5 py-14 text-game-white md:px-10 md:py-20 lg:px-16">
        <div aria-hidden className="malla-texture absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-[820px]">
          <p className="ui-kicker ui-kicker-inverse">{kicker}</p>
          <h1 className="editorial-title mt-4 text-[40px] md:text-[58px]">{title}</h1>
          <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-game-white/76">{intro}</p>
          <p className="mt-6 font-heading text-xs font-bold tracking-[0.1em] text-game-cyan uppercase">
            Ultimo aggiornamento: {updatedAt}
          </p>
        </div>
      </header>

      <div className="px-5 py-14 md:px-10 md:py-20 lg:px-16">
        <div className="mx-auto max-w-[820px]">{children}</div>
      </div>
    </div>
  );
}

/** Blocco da rimuovere quando un legale ha validato il testo. */
export function LegalDraftBanner() {
  return (
    <aside
      role="note"
      className="mb-12 border-l-4 border-accent-orange-ink bg-carta-alta p-5 md:p-6"
    >
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-accent-orange-ink" aria-hidden />
        <div>
          <h2 className="font-heading text-sm font-bold text-calce uppercase">
            Bozza non validata
          </h2>
          <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-nebbia">
            Questo testo è una bozza tecnica, redatta a partire da come Paideio funziona
            davvero, e <strong className="text-calce">non è stata verificata da un legale</strong>.
            Non fa fede finché non è validata e i campi segnalati non sono compilati. Rimuovere
            questo riquadro solo dopo la revisione.
          </p>
        </div>
      </div>
    </aside>
  );
}

/** Segnaposto visibile: pubblicare per errore un campo vuoto deve saltare all'occhio. */
export function Da({ children }: { children: ReactNode }) {
  return (
    <mark className="border border-accent-orange-ink/50 bg-accent-orange-ink/10 px-1.5 py-0.5 font-heading text-[0.9em] font-bold text-accent-orange-ink">
      {children}
    </mark>
  );
}

export function LegalSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-nebbia/20 pt-8 pb-10">
      <p className="font-heading text-sm font-bold text-accent-cyan-ink">{number}</p>
      <h2 className="mt-2 font-heading text-2xl leading-tight font-bold text-calce md:text-3xl">
        {title}
      </h2>
      <div className="mt-4 max-w-[70ch] space-y-4 leading-relaxed text-nebbia">{children}</div>
    </section>
  );
}

/** Passaggio a cui si rimanda spesso: va trovato scorrendo, non letto per intero. */
export function LegalHighlight({ children }: { children: ReactNode }) {
  return (
    <p className="border-l-2 border-accent-cyan-ink bg-carta-alta py-3 pr-4 pl-5 text-calce">
      {children}
    </p>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="grid gap-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span
            aria-hidden
            className="mt-2.5 size-1.5 shrink-0 rotate-45 bg-accent-cyan-ink"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Indice iniziale: una pagina legale si consulta a salti. */
export function LegalIndex({ items }: { items: Array<{ id: string; label: string }> }) {
  return (
    <nav aria-label="Indice della pagina" className="mb-12">
      <h2 className="font-heading text-xs font-bold tracking-[0.12em] text-accent-cyan-ink uppercase">
        In questa pagina
      </h2>
      <ol className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="flex min-h-9 items-baseline gap-2.5 text-sm text-nebbia underline decoration-nebbia/30 underline-offset-4 transition-colors hover:text-calce hover:decoration-accent-cyan-ink"
            >
              <span className="font-heading text-xs text-accent-cyan-ink">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Tabella dei trattamenti: su mobile diventa una lista di schede. */
export function LegalTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: string[];
  rows: string[][];
}) {
  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b-2 border-accent-cyan-ink/60">
            {head.map((cell) => (
              <th
                key={cell}
                scope="col"
                className="py-3 pr-4 font-heading text-xs font-bold tracking-[0.06em] text-calce uppercase"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-b border-nebbia/18 align-top">
              {row.map((cell, index) => (
                <td
                  key={index}
                  className={
                    index === 0
                      ? "py-3 pr-4 font-semibold text-calce"
                      : "py-3 pr-4 text-nebbia"
                  }
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
