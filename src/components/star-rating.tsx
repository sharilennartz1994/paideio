"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
            className={cn(sizeClass, i < rounded ? "fill-ball text-ball" : "fill-transparent text-muted-foreground/40")}
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
    <div className="flex gap-1" onMouseLeave={() => setHovered(null)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            type="button"
            className="p-0.5 transition-transform hover:scale-110"
            onMouseEnter={() => setHovered(starValue)}
            onClick={() => onChange(starValue)}
            aria-label={`${starValue} stelle`}
          >
            <Star
              className={cn("size-6", starValue <= active ? "fill-ball text-ball" : "fill-transparent text-muted-foreground/40")}
            />
          </button>
        );
      })}
    </div>
  );
}
