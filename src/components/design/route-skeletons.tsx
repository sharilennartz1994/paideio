import { cn } from "@/lib/utils";
import { GameLoader } from "./game-ui";

/**
 * Scheletri di rotta condivisi, usati dai `loading.tsx`.
 *
 * Perché non `FullScreenGameLoader`: quel componente è un velo `fixed inset-0
 * bg-game-ink` e copre topbar, rail e bottom nav, cioè proprio la shell che
 * l'App Router tiene viva e interattiva durante una navigazione. Su tema
 * giorno era anche un lampo nero a tutto schermo ad ogni click. Resta la
 * scelta giusta per le attese delle azioni interattive (dove l'utente non deve
 * poter fare altro), non per il cambio pagina.
 *
 * Ogni variante ricalca la griglia della pagina che sostituisce, così il
 * passaggio scheletro → contenuto non sposta nulla.
 */

type SkeletonTone = "carta" | "arena";

function Bar({
  className,
  tone = "carta",
}: {
  className?: string;
  tone?: SkeletonTone;
}) {
  return (
    <div
      className={cn(
        "game-skeleton-shape",
        tone === "arena" && "game-skeleton-arena",
        className
      )}
    />
  );
}

function Frame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div aria-hidden>{children}</div>
    </div>
  );
}

/** Hero scuro con occhiello, titolo, testo e asset: la testata editoriale. */
function ArenaHero({ nav }: { nav: boolean }) {
  return (
    <header className="border-b border-game-cyan/22 bg-game-ink">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 md:grid-cols-[minmax(0,1fr)_280px] md:px-8 md:py-16">
        <div className="max-w-3xl">
          <Bar tone="arena" className="h-3 w-40" />
          <Bar tone="arena" className="mt-5 h-9 w-full md:h-14" />
          <Bar tone="arena" className="mt-3 h-9 w-3/5 md:h-14" />
          <Bar tone="arena" className="mt-6 h-4 w-11/12 max-w-xl" />
          <Bar tone="arena" className="mt-2.5 h-4 w-2/3 max-w-md" />
          <div className="mt-7 flex gap-3">
            <Bar tone="arena" className="h-11 w-44" />
            <Bar tone="arena" className="h-11 w-36" />
          </div>
        </div>
        <Bar tone="arena" className="mx-auto hidden size-56 md:block" />
      </div>
      {nav && (
        <div className="border-t border-game-cyan/16">
          <div className="mx-auto flex max-w-7xl gap-4 px-5 py-4 md:px-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <Bar key={index} tone="arena" className="h-3 w-16 shrink-0" />
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function CardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-px overflow-hidden border border-nebbia/20 bg-nebbia/20 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="min-h-56 bg-carta-alta p-6">
          <Bar className="size-7" />
          <Bar className="mt-8 h-6 w-2/3" />
          <Bar className="mt-4 h-3.5 w-full" />
          <Bar className="mt-2 h-3.5 w-4/5" />
          <Bar className="mt-6 h-3.5 w-32" />
        </div>
      ))}
    </div>
  );
}

function PageHeading() {
  return (
    <div>
      <Bar className="h-3 w-36" />
      <Bar className="mt-3 h-8 w-4/5 max-w-lg md:h-11" />
    </div>
  );
}

function ListRows({ count }: { count: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[44px_1fr] items-start gap-4 border border-nebbia/22 bg-carta-alta p-4 md:grid-cols-[56px_1fr_auto]"
        >
          <Bar className="size-11 rounded-full md:size-14" />
          <div className="min-w-0">
            <Bar className="h-5 w-2/5 min-w-32" />
            <Bar className="mt-3 h-3.5 w-11/12" />
            <Bar className="mt-2 h-3.5 w-3/5" />
          </div>
          <Bar className="hidden h-11 w-32 md:block" />
        </div>
      ))}
    </div>
  );
}

export type RouteSkeletonVariant =
  | "editorial"
  | "list"
  | "profile"
  | "dashboard"
  | "document"
  | "block";

export function RouteSkeleton({
  variant,
  label,
  nav = false,
  rows = 4,
}: {
  variant: RouteSkeletonVariant;
  /** Annuncio per gli screen reader: sempre in italiano. */
  label: string;
  /** Solo per `editorial`: la striscia di sottosezioni Academy/Circuito. */
  nav?: boolean;
  /** Solo per `list`: quante righe segnaposto. */
  rows?: number;
}) {
  if (variant === "block") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <GameLoader size="large" label={label} inline />
      </div>
    );
  }

  if (variant === "editorial") {
    return (
      <Frame label={label}>
        <ArenaHero nav={nav} />
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
          <CardGrid />
        </div>
      </Frame>
    );
  }

  if (variant === "list") {
    return (
      <Frame label={label}>
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
          <PageHeading />
          <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
            <div className="hidden lg:block">
              <Bar className="h-6 w-24" />
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="mt-7">
                  <Bar className="h-3 w-20" />
                  <Bar className="mt-3 h-10 w-full" />
                </div>
              ))}
            </div>
            <div>
              <div className="mb-5 flex items-center justify-between gap-4">
                <Bar className="h-3.5 w-40" />
                <Bar className="h-10 w-44" />
              </div>
              <ListRows count={rows} />
            </div>
          </div>
        </div>
      </Frame>
    );
  }

  if (variant === "profile") {
    return (
      <Frame label={label}>
        <header className="border-b border-game-cyan/22 bg-game-ink">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:flex-row md:items-end md:px-8">
            <Bar tone="arena" className="size-28 rounded-full md:size-36" />
            <div className="flex-1">
              <Bar tone="arena" className="h-3 w-32" />
              <Bar tone="arena" className="mt-4 h-10 w-3/4 max-w-md md:h-12" />
              <Bar tone="arena" className="mt-4 h-4 w-2/3 max-w-sm" />
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-3 gap-px bg-game-cyan/16 px-4 md:px-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-game-ink py-5">
                <Bar tone="arena" className="h-7 w-16" />
                <Bar tone="arena" className="mt-2 h-3 w-24" />
              </div>
            ))}
          </div>
        </header>
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 md:px-8">
          <div className="border border-nebbia/22 bg-carta-alta p-6">
            <Bar className="h-6 w-56" />
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Bar key={index} className="h-12" />
              ))}
            </div>
            <Bar className="mt-7 h-12 w-full max-w-xs" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Bar className="h-40" />
            <Bar className="h-40" />
          </div>
        </div>
      </Frame>
    );
  }

  if (variant === "dashboard") {
    return (
      <Frame label={label}>
        <div className="mb-10 border border-nebbia/20 bg-carta-bassa px-6 py-8 md:px-9">
          <Bar className="h-3 w-40" />
          <Bar className="mt-4 h-9 w-3/5 max-w-sm md:h-11" />
          <Bar className="mt-4 h-4 w-4/5 max-w-md" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border-t border-nebbia/30 bg-carta-alta p-5">
              <Bar className="h-3.5 w-28" />
              <Bar className="mt-3 h-9 w-16" />
              <Bar className="mt-3 h-3 w-32" />
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="border border-nebbia/22 bg-carta-alta p-6">
            <Bar className="h-6 w-48" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Bar className="size-11 rounded-full" />
                  <div className="flex-1">
                    <Bar className="h-4 w-2/5 min-w-28" />
                    <Bar className="mt-2 h-3 w-3/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-nebbia/22 bg-carta-alta p-6">
            <Bar className="h-6 w-40" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Bar key={index} className="h-12" />
              ))}
            </div>
          </div>
        </div>
      </Frame>
    );
  }

  // "document": pagine di testo lungo con indice laterale (termini, privacy).
  return (
    <Frame label={label}>
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <PageHeading />
        <Bar className="mt-5 h-3.5 w-56" />
        <div className="mt-10 grid gap-10 md:grid-cols-[220px_1fr]">
          <div className="hidden md:block">
            {Array.from({ length: 7 }).map((_, index) => (
              <Bar key={index} className="mt-3 h-3.5 w-full" />
            ))}
          </div>
          <div className="space-y-9">
            {Array.from({ length: 4 }).map((_, section) => (
              <div key={section}>
                <Bar className="h-6 w-2/5 min-w-40" />
                <Bar className="mt-4 h-3.5 w-full" />
                <Bar className="mt-2.5 h-3.5 w-full" />
                <Bar className="mt-2.5 h-3.5 w-4/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}
