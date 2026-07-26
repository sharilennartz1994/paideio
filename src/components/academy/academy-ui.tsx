import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CircleDot,
  Info,
  Lightbulb,
  MoveRight,
  Target,
  X,
} from "@/components/icons/paideio-icons";
import type { ReactNode } from "react";
import {
  GameAsset,
  GameBadge,
  GameCta,
  GamePanel,
  type GameAssetName,
} from "@/components/design";
import { cn } from "@/lib/utils";

export function AcademyIntro({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-6 border-y border-nebbia/20 py-8 md:grid-cols-[220px_1fr]">
      <div>
        <GameBadge tone="info">Come usare la guida</GameBadge>
        <h2 className="mt-4 font-heading text-2xl font-bold text-calce">{title}</h2>
      </div>
      <div className="max-w-[70ch] space-y-4 leading-relaxed text-nebbia">{children}</div>
    </section>
  );
}

export function AcademyVisual({
  asset,
  title,
  caption,
  className,
}: {
  asset: GameAssetName;
  title: string;
  caption: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "grid items-center gap-6 overflow-hidden border border-nebbia/18 bg-carta-bassa p-5 sm:grid-cols-[minmax(180px,0.8fr)_1.2fr] md:p-7",
        className
      )}
    >
      <div className="flex min-h-48 items-center justify-center bg-carta-alta/55 p-4">
        <GameAsset
          name={asset}
          sizes="(max-width: 640px) 75vw, 360px"
          className="max-h-64 w-auto drop-shadow-[0_18px_28px_rgba(3,16,30,0.18)]"
        />
      </div>
      <figcaption>
        <p className="font-heading text-xs font-bold tracking-[0.08em] text-accent-cyan-ink uppercase">
          Tavola di campo
        </p>
        <h3 className="mt-2 font-heading text-xl font-bold text-calce">{title}</h3>
        <p className="mt-3 max-w-[55ch] leading-relaxed text-nebbia">{caption}</p>
      </figcaption>
    </figure>
  );
}

export function LearningPath({
  steps,
}: {
  steps: ReadonlyArray<{ label: string; title: string; description: string; href?: string }>;
}) {
  return (
    <ol className="grid border-y border-nebbia/20 md:grid-cols-3">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="relative border-b border-nebbia/20 py-6 md:border-r md:border-b-0 md:px-6 first:md:pl-0 last:border-0"
        >
          <span className="font-heading text-xs font-bold tracking-[0.08em] text-accent-cyan-ink uppercase">
            {step.label}
          </span>
          <h3 className="mt-2 font-heading text-xl font-bold text-calce">{step.title}</h3>
          <p className="mt-2 leading-relaxed text-nebbia">{step.description}</p>
          {step.href && (
            <Link
              href={step.href}
              className="mt-4 inline-flex min-h-11 items-center gap-2 py-2 font-heading text-sm font-semibold text-vetro hover:text-calce"
            >
              Apri il modulo <ArrowRight className="size-4" />
            </Link>
          )}
          {index < steps.length - 1 && (
            <MoveRight
              aria-hidden
              className="absolute top-7 right-[-13px] z-10 hidden size-6 bg-background text-vetro md:block"
            />
          )}
        </li>
      ))}
    </ol>
  );
}

export function LessonBlock({
  title,
  subtitle,
  level = "Fondamentale",
  children,
}: {
  title: string;
  subtitle: string;
  level?: "Fondamentale" | "Intermedio" | "Avanzato";
  children: ReactNode;
}) {
  return (
    <GamePanel as="article" className="p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-calce">{title}</h2>
          <p className="mt-2 max-w-[65ch] leading-relaxed text-nebbia">{subtitle}</p>
        </div>
        <GameBadge tone={level === "Fondamentale" ? "info" : level === "Intermedio" ? "pending" : "neutral"}>
          {level}
        </GameBadge>
      </div>
      <div className="mt-7">{children}</div>
    </GamePanel>
  );
}

export function LessonColumns({
  principle,
  practice,
  check,
}: {
  principle: ReactNode;
  practice: ReactNode;
  check: ReactNode;
}) {
  const items = [
    { title: "Principio", icon: Lightbulb, body: principle },
    { title: "In campo", icon: CircleDot, body: practice },
    { title: "Verifica", icon: Target, body: check },
  ];

  return (
    <div className="grid gap-px border border-nebbia/18 bg-nebbia/18 md:grid-cols-3">
      {items.map((item) => (
        <section key={item.title} className="bg-carta-bassa p-5">
          <item.icon className="size-5 text-vetro" aria-hidden />
          <h3 className="mt-4 font-heading text-sm font-bold text-calce uppercase">{item.title}</h3>
          <div className="mt-2 text-sm leading-relaxed text-nebbia">{item.body}</div>
        </section>
      ))}
    </div>
  );
}

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "tip" | "warning";
  title: string;
  children: ReactNode;
}) {
  const Icon = tone === "warning" ? AlertTriangle : tone === "tip" ? Lightbulb : Info;

  return (
    <aside
      className={cn(
        "border p-5",
        tone === "warning" && "border-ruggine/55 bg-ruggine/8",
        tone === "tip" && "border-accent-ball-ink/45 bg-accent-ball-ink/6",
        tone === "info" && "border-accent-cyan-ink/45 bg-accent-cyan-ink/6"
      )}
    >
      <div className="flex gap-3">
        <Icon
          className={cn(
            "mt-0.5 size-5 shrink-0",
            tone === "warning" ? "text-accent-orange-ink" : tone === "tip" ? "text-accent-ball-ink" : "text-accent-cyan-ink"
          )}
          aria-hidden
        />
        <div>
          <h3 className="font-heading text-sm font-bold text-calce uppercase">{title}</h3>
          <div className="mt-2 max-w-[70ch] text-sm leading-relaxed text-nebbia">{children}</div>
        </div>
      </div>
    </aside>
  );
}

export function DoDont({
  doItems,
  dontItems,
}: {
  doItems: readonly string[];
  dontItems: readonly string[];
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section>
        <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-calce uppercase">
          <Check className="size-5 text-vetro" aria-hidden /> Cerca questo
        </h3>
        <ul className="mt-4 space-y-3">
          {doItems.map((item) => (
            <li key={item} className="border-t border-nebbia/20 pt-3 leading-relaxed text-nebbia">{item}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-calce uppercase">
          <X className="size-5 text-accent-orange-ink" aria-hidden /> Errore da evitare
        </h3>
        <ul className="mt-4 space-y-3">
          {dontItems.map((item) => (
            <li key={item} className="border-t border-ruggine/30 pt-3 leading-relaxed text-nebbia">{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function SessionPlan({
  title,
  duration,
  blocks,
}: {
  title: string;
  duration: string;
  blocks: ReadonlyArray<{ minutes: string; title: string; description: string }>;
}) {
  return (
    <GamePanel tone="cyan" className="p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <GameBadge tone="info">Seduta pronta</GameBadge>
          <h2 className="mt-3 font-heading text-2xl font-bold text-calce">{title}</h2>
        </div>
        <span className="font-heading text-sm font-bold text-accent-cyan-ink">{duration}</span>
      </div>
      <ol className="mt-6 divide-y divide-nebbia/18 border-y border-nebbia/18">
        {blocks.map((block) => (
          <li key={block.title} className="grid gap-2 py-4 sm:grid-cols-[72px_160px_1fr]">
            <strong className="font-heading text-accent-cyan-ink">{block.minutes}</strong>
            <span className="font-heading font-semibold text-calce">{block.title}</span>
            <span className="leading-relaxed text-nebbia">{block.description}</span>
          </li>
        ))}
      </ol>
    </GamePanel>
  );
}

export function NextLesson({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <div className="mt-10 flex flex-col gap-4 border-t border-nebbia/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-heading text-xs font-bold text-accent-cyan-ink uppercase">Continua il percorso</p>
        <p className="mt-1 max-w-xl text-nebbia">{description}</p>
      </div>
      <GameCta href={href} tone="outline" arrow className="shrink-0">{label}</GameCta>
    </div>
  );
}
