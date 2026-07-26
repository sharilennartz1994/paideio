import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink } from "@/components/icons/paideio-icons";
import type { ReactNode } from "react";
import { GameAsset, GameBadge, GameCta, GamePanel, type GameAssetName } from "@/components/design";
import { cn } from "@/lib/utils";

export function EditorialHero({
  kicker,
  title,
  description,
  asset = "racket",
  showSectionNav = true,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  asset?: GameAssetName;
  showSectionNav?: boolean;
  children?: ReactNode;
}) {
  const isAcademy = kicker.startsWith("Academy") || kicker.startsWith("Paideio Academy");
  const localLinks = isAcademy
    ? [
        ["/academy", "Hub"],
        ["/academy/tecnica", "Tecnica"],
        ["/academy/strategia", "Strategia"],
        ["/academy/regole", "Regole"],
        ["/academy/training", "Training"],
        ["/academy/attrezzatura", "Gear"],
        ["/academy/storia-cultura", "Cultura"],
      ]
    : [
        ["/circuito", "Hub"],
        ["/circuito/classifiche", "Classifiche"],
        ["/circuito/calendario", "Calendario"],
        ["/circuito/come-funziona-il-ranking", "Ranking"],
      ];

  return (
    <header className="relative overflow-hidden border-b border-game-cyan/22 bg-game-ink">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 md:grid-cols-[minmax(0,1fr)_280px] md:px-8 md:py-16">
        <div className="max-w-3xl">
          <p className="font-heading text-xs font-bold tracking-[0.12em] text-game-cyan uppercase">
            {kicker}
          </p>
          <h1 className="mt-3 text-balance font-heading text-4xl leading-[0.96] font-extrabold tracking-[-0.03em] text-game-white md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-[65ch] text-lg leading-relaxed text-game-white/78">{description}</p>
          {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
        </div>
        <GameAsset name={asset} decorative sizes="280px" className="mx-auto max-h-64 w-auto object-contain" />
      </div>
      {showSectionNav && (
        <nav aria-label={isAcademy ? "Sezioni Academy" : "Sezioni Circuito"} className="overflow-x-auto border-t border-game-cyan/16">
          <div className="mx-auto flex min-w-max max-w-7xl gap-1 px-5 md:px-8">
            {localLinks.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="min-h-11 border-b-2 border-transparent px-3 py-3 font-heading text-xs font-semibold text-game-white/72 uppercase transition-colors hover:border-game-cyan hover:text-game-white focus-visible:outline-2 focus-visible:outline-game-cyan"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export function EditorialSectionGrid({
  items,
}: {
  items: ReadonlyArray<{
    href: string;
    title: string;
    description: string;
    icon: typeof ArrowRight;
    accent: "cyan" | "ball" | "orange";
  }>;
}) {
  return (
    <div className="grid gap-px overflow-hidden border border-nebbia/20 bg-nebbia/20 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group min-h-56 bg-carta-alta p-6 transition-colors hover:bg-game-blue/18 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-vetro"
        >
          <item.icon
            className={cn(
              "size-7",
              item.accent === "cyan" && "text-vetro",
              item.accent === "ball" && "text-accent-ball-ink",
              item.accent === "orange" && "text-accent-orange-ink"
            )}
          />
          <h2 className="mt-8 font-heading text-2xl font-bold text-calce">{item.title}</h2>
          <p className="mt-2 max-w-sm leading-relaxed text-nebbia">{item.description}</p>
          <span className="mt-6 inline-flex items-center gap-2 font-heading text-sm font-semibold text-vetro">
            Entra in campo <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
    </div>
  );
}

export function ContentList({
  items,
}: {
  items: ReadonlyArray<readonly [string, string, string]>;
}) {
  return (
    <div className="divide-y divide-nebbia/18 border-y border-nebbia/18">
      {items.map(([title, label, description]) => (
        <article key={title} className="grid gap-3 py-5 md:grid-cols-[180px_1fr_auto] md:items-center">
          <GameBadge tone={label === "Avanzato" ? "danger" : label === "Intermedio" ? "pending" : "info"}>
            {label}
          </GameBadge>
          <div>
            <h2 className="font-heading text-xl font-bold text-calce">{title}</h2>
            <p className="mt-1 text-nebbia">{description}</p>
          </div>
          <GameCta href="/cerca" tone="quiet" size="compact" arrow>
            Allenalo
          </GameCta>
        </article>
      ))}
    </div>
  );
}

export function SourceNote({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-vetro hover:text-calce"
    >
      {children} <ExternalLink className="size-4" />
    </a>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 border-t border-nebbia/20 pt-3 text-nebbia">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-vetro" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function CoachClose({ title = "Portalo in campo" }: { title?: string }) {
  return (
    <GamePanel tone="ball" className="mt-12 flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="font-heading text-2xl font-bold text-calce">{title}</h2>
        <p className="mt-2 max-w-2xl text-nebbia">
          Un contenuto ti mostra la direzione. Un coach osserva il tuo gesto e costruisce la correzione.
        </p>
      </div>
      <GameCta href="/cerca" tone="ball" showBall arrow className="shrink-0">
        Trova un coach
      </GameCta>
    </GamePanel>
  );
}
