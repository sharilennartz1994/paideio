"use client";

import { useState } from "react";
import { Star } from "@/components/icons/paideio-icons";
import { cn } from "@/lib/utils";

/*
 * Le stelle usano `accent-ball-ink`, non `ball`: il giallo pallina è un colore
 * FISSO e su fondo chiaro dà 1,01:1, cioè un riempimento invisibile con solo il
 * contorno a reggere. Con l'accento theme-aware si ottiene 5,16:1 di giorno e
 * 14,49:1 di notte. Le stelle vuote passano da `/55` a `/80` perché al 55%
 * davano 2,29:1, sotto la soglia di 3:1 per gli elementi non testuali.
 */
export function StarRatingDisplay({
  rating,
  count,
  size = "sm",
  textClassName = "text-muted-foreground",
}: {
  rating: number | null;
  count?: number;
  size?: "sm" | "md" | "lg";
  textClassName?: string;
}) {
  const sizeClass = size === "lg" ? "size-5" : size === "md" ? "size-4" : "size-3.5";
  const rounded = rating != null ? Math.round(rating) : 0;

  return (
    <div className="flex items-center gap-1">
      <div className="flex" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(sizeClass, i < rounded ? "fill-accent-ball-ink text-accent-ball-ink" : "fill-transparent text-muted-foreground/80")}
          />
        ))}
      </div>
      {rating != null ? (
        <span className={cn("font-mono text-sm tabular-nums", textClassName)}>
          {rating.toFixed(1)}
          {count != null && <span> ({count})</span>}
        </span>
      ) : (
        <span className={cn("font-mono text-sm", textClassName)}>Nuovo</span>
      )}
    </div>
  );
}

export function StarRatingInput({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? value;

  return (
    <div
      className="flex gap-1"
      role="radiogroup"
      aria-label="Valutazione"
      onMouseLeave={() => setHovered(null)}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            className="flex size-11 items-center justify-center transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vetro"
            onMouseEnter={() => setHovered(starValue)}
            onClick={() => onChange(starValue)}
            aria-label={`${starValue} stelle`}
          >
            <Star
              className={cn("size-6", starValue <= active ? "fill-accent-ball-ink text-accent-ball-ink" : "fill-transparent text-muted-foreground/80")}
            />
          </button>
        );
      })}
    </div>
  );
}
