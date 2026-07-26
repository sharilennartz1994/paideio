import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check, Clock3, X } from "@/components/icons/paideio-icons";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { PadelBallMark } from "@/components/padel-ball-mark";
import { cn } from "@/lib/utils";

const gameCtaVariants = cva(
  "game-cta inline-flex min-h-11 items-center justify-center gap-2 rounded-none border border-transparent px-5 font-semibold whitespace-nowrap transition-[background-color,color,transform] duration-150",
  {
    variants: {
      tone: {
        primary:
          "[--game-cta-border:var(--vetro)] bg-vetro text-carta hover:[--game-cta-border:var(--calce)] hover:bg-calce",
        ball:
          "[--game-cta-border:var(--game-ball)] bg-game-ball text-game-ink hover:[--game-cta-border:var(--game-white)] hover:bg-game-white",
        outline:
          "[--game-cta-border:var(--vetro)] bg-transparent text-vetro hover:bg-vetro hover:text-carta",
        quiet:
          "[--game-cta-border:transparent] bg-transparent text-calce hover:[--game-cta-border:color-mix(in_srgb,var(--nebbia)_35%,transparent)] hover:bg-carta-alta",
        danger:
          "[--game-cta-border:var(--ruggine)] bg-ruggine/12 text-ruggine hover:bg-ruggine hover:text-game-ink",
      },
      size: {
        default: "min-h-11 px-5 text-sm",
        large: "min-h-13 px-7 text-base",
        compact: "min-h-9 px-3 text-sm",
      },
    },
    defaultVariants: {
      tone: "primary",
      size: "default",
    },
  }
);

type GameCtaProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  disabled?: boolean;
  showBall?: boolean;
  arrow?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  [key: `data-${string}`]: string | boolean | undefined;
} & VariantProps<typeof gameCtaVariants>;

export function GameCta({
  children,
  href,
  className,
  disabled,
  showBall = false,
  arrow = false,
  tone,
  size,
  type = "button",
  onClick,
  ...dataProps
}: GameCtaProps) {
  const content = (
    <>
      {showBall && <PadelBallMark className="size-5" />}
      <span>{children}</span>
      {arrow && <ArrowRight className="size-4" />}
    </>
  );
  const classes = cn(gameCtaVariants({ tone, size }), className);

  if (href && !disabled) {
    if (href.includes("#")) {
      return (
        <a href={href} className={classes} {...dataProps}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...dataProps}>
        {content}
      </Link>
    );
  }

  return (
    <Button type={type} disabled={disabled} className={classes} onClick={onClick} {...dataProps}>
      {content}
    </Button>
  );
}

const gameBadgeVariants = cva(
  "inline-flex min-h-6 items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      tone: {
        // Fondo opaco: il badge compare sia su superfici chiare sia sull'header
        // arena scuro, quindi non può dipendere dal colore che sta sotto.
        neutral: "border-nebbia/35 bg-carta-bassa text-nebbia",
        info: "border-accent-cyan-ink/55 bg-carta-alta text-accent-cyan-ink",
        success: "border-vetro/55 bg-carta-alta text-vetro",
        pending: "border-accent-ball-ink/55 bg-carta-alta text-accent-ball-ink",
        danger: "border-accent-orange-ink/55 bg-carta-alta text-accent-orange-ink",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export function GameBadge({
  children,
  tone,
  className,
}: {
  children: ReactNode;
  className?: string;
} & VariantProps<typeof gameBadgeVariants>) {
  const Icon =
    tone === "success"
      ? Check
      : tone === "danger"
        ? X
        : tone === "pending"
          ? Clock3
          : null;

  return (
    <span className={cn(gameBadgeVariants({ tone }), className)}>
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  );
}

export function GameLoader({
  label = "Caricamento in corso",
  size = "default",
  inline = false,
  className,
}: {
  label?: string;
  size?: "small" | "default" | "large";
  inline?: boolean;
  className?: string;
}) {
  const ballSize =
    size === "small" ? "size-5" : size === "large" ? "size-12" : "size-8";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-3",
        inline ? "w-fit" : "min-h-24 w-full",
        className
      )}
    >
      <span className="game-loader-track" aria-hidden>
        <PadelBallMark className={cn("game-loader-ball", ballSize)} />
      </span>
      <span className={inline ? "text-sm text-nebbia" : "sr-only"}>
        {label}
      </span>
    </div>
  );
}

export function FullScreenGameLoader({
  label = "Prepariamo il campo",
}: {
  label?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex min-h-dvh items-center justify-center bg-game-ink px-6 text-game-white"
    >
      <div className="text-center">
        <p className="font-heading text-xs font-bold tracking-[0.14em] text-game-cyan uppercase">
          Paideio match loading
        </p>
        <GameLoader size="large" label={label} className="mt-4 min-h-20" />
        <p className="mt-3 font-heading text-lg font-semibold">{label}</p>
        <div className="mx-auto mt-5 h-px w-48 bg-game-cyan/30" />
      </div>
    </div>
  );
}

export function GamePanel({
  children,
  className,
  tone = "default",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "quiet" | "cyan" | "ball";
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag
      className={cn(
        "game-panel border bg-carta-alta",
        tone === "default" && "border-nebbia/30",
        tone === "quiet" && "border-nebbia/18 bg-carta-bassa",
        tone === "cyan" && "border-accent-cyan-ink/50 bg-accent-cyan-ink/7",
        tone === "ball" && "border-accent-ball-ink/45 bg-accent-ball-ink/6",
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function GameStat({
  label,
  value,
  detail,
  accent = "cyan",
}: {
  label: string;
  value: string | number;
  detail?: string;
  accent?: "cyan" | "ball" | "orange";
}) {
  return (
    <div
      className={cn(
        "border-t bg-carta-alta p-5",
        accent === "cyan" && "border-accent-cyan-ink",
        accent === "ball" && "border-accent-ball-ink",
        accent === "orange" && "border-accent-orange-ink"
      )}
    >
      <p className="text-sm text-nebbia">{label}</p>
      <p className="mt-1 font-heading text-[38px] leading-none text-calce">
        {value}
      </p>
      {detail && <p className="mt-2 text-xs text-nebbia">{detail}</p>}
    </div>
  );
}

export function GameSkeleton({
  className,
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div
      aria-hidden
      className={cn("game-skeleton border border-nebbia/20 bg-carta-alta p-5", className)}
    >
      <div className="game-skeleton-shape h-5 w-2/5" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="game-skeleton-shape h-3"
            style={{ width: `${92 - index * 13}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function GameSectionHeading({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 border-b border-nebbia/22 pb-6 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div>
        <h2 className="font-heading text-headline-lg-mobile text-calce md:text-headline-lg">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-nebbia">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export { gameBadgeVariants, gameCtaVariants };
