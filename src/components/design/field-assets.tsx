import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const GAME_ASSETS = {
  racket: {
    src: "/design/game/core/racket.png",
    width: 1024,
    height: 1536,
    alt: "Pala da padel illustrata in stile comic",
  },
  ball: {
    src: "/design/game/core/ball.png",
    width: 1254,
    height: 1254,
    alt: "Pallina da padel illustrata in stile comic",
  },
  impact: {
    src: "/design/game/core/impact.png",
    width: 1024,
    height: 1536,
    alt: "Scintilla grafica di impatto",
  },
  net: {
    src: "/design/game/architecture/net.png",
    width: 1774,
    height: 887,
    alt: "Rete da padel illustrata in stile comic",
  },
  glassCorner: {
    src: "/design/game/architecture/glass-corner.png",
    width: 1024,
    height: 1536,
    alt: "Angolo in vetro di un campo da padel",
  },
  grip: {
    src: "/design/game/materials/grip.png",
    width: 1024,
    height: 1536,
    alt: "Grip da padel illustrato in stile comic",
  },
  meshModule: {
    src: "/design/game/materials/mesh-module.png",
    width: 1024,
    height: 1536,
    alt: "Modulo di recinzione metallica da padel",
  },
  perforationPattern: {
    src: "/design/game/materials/perforation-pattern.png",
    width: 1254,
    height: 1254,
    alt: "Pattern ispirato alla foratura di una pala da padel",
  },
  smashTrail: {
    src: "/design/game/motion/smash.png",
    width: 1024,
    height: 1536,
    alt: "Traiettoria grafica di uno smash",
  },
  bandejaTrail: {
    src: "/design/game/motion/bandeja.png",
    width: 1536,
    height: 1024,
    alt: "Traiettoria grafica di una bandeja",
  },
  crossedRackets: {
    src: "/design/game/compositions/crossed-rackets.png",
    width: 1254,
    height: 1254,
    alt: "Due pale da padel incrociate",
  },
  backpack: {
    src: "/design/game/equipment/backpack.png",
    width: 1024,
    height: 1536,
    alt: "Zaino da padel illustrato in stile comic",
  },
  shoes: {
    src: "/design/game/equipment/shoes.png",
    width: 1536,
    height: 1024,
    alt: "Scarpe da padel illustrate in stile comic",
  },
  ballBasket: {
    src: "/design/game/equipment/ball-basket.png",
    width: 1024,
    height: 1536,
    alt: "Cesta piena di palline da padel",
  },
  pickupTube: {
    src: "/design/game/equipment/ball-pickup-tube.png",
    width: 1024,
    height: 1536,
    alt: "Tubo raccogli palline da padel",
  },
  playerVolley: {
    src: "/design/game/players/player-volley.png",
    width: 1024,
    height: 1536,
    alt: "Giocatrice di padel mentre intercetta una palla al volo",
  },
  playerSmash: {
    src: "/design/game/players/player-smash.png",
    width: 864,
    height: 1821,
    alt: "Giocatore di padel durante uno smash",
  },
  splitStep: {
    src: "/design/game/academy/split-step.png",
    width: 1003,
    height: 1568,
    alt: "Giocatore nella posizione atletica dello split step",
  },
  markerCones: {
    src: "/design/game/academy/marker-cones.png",
    width: 1662,
    height: 946,
    alt: "Cinesini da allenamento per il padel",
  },
  resistanceBands: {
    src: "/design/game/academy/resistance-bands.png",
    width: 1254,
    height: 1254,
    alt: "Elastici per il riscaldamento",
  },
  changeDirectionPlayer: {
    src: "/design/game/academy/change-direction-player.png",
    width: 1536,
    height: 1024,
    alt: "Giocatrice durante un cambio di direzione",
  },
  waterBottle: {
    src: "/design/game/academy/water-bottle.png",
    width: 1024,
    height: 1536,
    alt: "Borraccia sportiva",
  },
  tacticsBoard: {
    src: "/design/game/academy/tactics-board.png",
    width: 1536,
    height: 1024,
    alt: "Lavagnetta da coach con una tattica di padel",
  },
  racketShapes: {
    src: "/design/game/academy/racket-shapes-v2.png",
    width: 1721,
    height: 914,
    alt: "Confronto illustrato tra pala rotonda, a goccia e a diamante",
  },
  courtPositions: {
    src: "/design/game/academy/court-positions.png",
    width: 1774,
    height: 887,
    alt: "Schema orientativo di due coppie sui lati opposti di un campo da padel",
  },
  ballMicro: {
    src: "/design/game/micro/ball-micro.png",
    width: 1254,
    height: 1254,
    alt: "Pallina da padel",
  },
} as const;

export type GameAssetName = keyof typeof GAME_ASSETS;

export function GameAsset({
  name,
  className,
  decorative = false,
  preload = false,
  loading,
  sizes = "(max-width: 768px) 80vw, 40vw",
}: {
  name: GameAssetName;
  className?: string;
  decorative?: boolean;
  preload?: boolean;
  loading?: "eager" | "lazy";
  sizes?: string;
}) {
  const asset = GAME_ASSETS[name];

  return (
    <Image
      src={asset.src}
      alt={decorative ? "" : asset.alt}
      aria-hidden={decorative || undefined}
      width={asset.width}
      height={asset.height}
      preload={preload}
      loading={loading}
      sizes={sizes}
      className={cn("h-auto max-w-full object-contain", className)}
    />
  );
}

export function GameDivider({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative mx-auto flex w-full items-center overflow-hidden",
        compact ? "h-7 max-w-md" : "h-10 max-w-6xl md:h-12",
        className
      )}
    >
      <span className="h-px flex-1 bg-accent-cyan-ink/35" />
      <span className="mx-3 flex items-center gap-2">
        {Array.from({ length: compact ? 5 : 9 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "block size-2 rotate-45 border",
              index === Math.floor((compact ? 5 : 9) / 2)
                ? "scale-125 border-accent-ball-ink bg-accent-ball-ink"
                : "border-accent-cyan-ink/55 bg-carta"
            )}
          />
        ))}
      </span>
      <span className="h-px flex-1 bg-accent-cyan-ink/35" />
    </div>
  );
}

export function GameEmptyState({
  asset,
  title,
  description,
  action,
  className,
}: {
  asset: GameAssetName;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "game-empty-state flex flex-col items-center px-6 py-10 text-center",
        className
      )}
    >
      <GameAsset
        name={asset}
        decorative
        loading="eager"
        sizes="(max-width: 768px) 180px, 220px"
        className="mb-2 max-h-48 w-auto"
      />
      <h2 className="font-heading text-[34px] text-calce">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-nebbia">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function GlassPanel({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass-panel", className)} {...props}>{children}</div>;
}

/** @deprecated Use GameDivider. Kept while remaining surfaces migrate. */
export function FieldDivider({
  short = false,
  className,
}: {
  short?: boolean;
  className?: string;
}) {
  return <GameDivider compact={short} className={className} />;
}

/** @deprecated Use GameAsset with a semantic asset name. */
export function FieldPlate({
  kind,
  className,
  decorative = false,
  priority = false,
}: {
  kind: "box" | "court" | "racket" | "netBall";
  className?: string;
  decorative?: boolean;
  priority?: boolean;
}) {
  const mappedAsset: Record<typeof kind, GameAssetName> = {
    box: "playerVolley",
    court: "glassCorner",
    racket: "racket",
    netBall: "net",
  };

  return (
    <GameAsset
      name={mappedAsset[kind]}
      className={className}
      decorative={decorative}
      preload={priority}
    />
  );
}
