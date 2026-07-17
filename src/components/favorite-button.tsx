"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleFavorite } from "@/lib/actions/favorites";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  coachId,
  initialFavorite,
  isPlayer,
  className,
}: {
  coachId: string;
  initialFavorite: boolean;
  isPlayer: boolean;
  className?: string;
}) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isPending, startTransition] = useTransition();

  if (!isPlayer) return null;

  function handleClick() {
    const next = !isFavorite;
    setIsFavorite(next);
    startTransition(async () => {
      try {
        const result = await toggleFavorite(coachId);
        setIsFavorite(result);
        if (result) toast.success("Aggiunto ai preferiti");
      } catch (err) {
        setIsFavorite(!next);
        toast.error(err instanceof Error ? err.message : "Errore imprevisto.");
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="icon"
      disabled={isPending}
      onClick={handleClick}
      aria-label={isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
      className={cn("shrink-0", className)}
    >
      <Heart className={cn("size-4 transition-all", isFavorite && "scale-110 fill-red-500 text-red-500")} />
    </Button>
  );
}
