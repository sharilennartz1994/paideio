"use client";

import { useState, useTransition } from "react";
import { SignInButton } from "@clerk/nextjs";
import { Heart } from "@/components/icons/paideio-icons";
import { toast } from "sonner";
import { toggleFavorite } from "@/lib/actions/favorites";
import { FullScreenGameLoader, GameCta } from "@/components/design";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewerRole = "player" | "coach" | null;

/**
 * Due forme dello stesso gesto:
 * - `icon` (default) è il cuoricino sulle card e nell'hero del profilo;
 * - `cta` è il bottone etichettato che sostituisce "Scegli giorno e orario"
 *   quando il coach non ha ancora pubblicato turni.
 *
 * Il visitatore anonimo non vedeva nulla: il salvataggio era invisibile finché
 * non avevi già un account. Ora apre il modale Clerk e resta sulla pagina.
 */
export function FavoriteButton({
  coachId,
  initialFavorite,
  viewerRole,
  variant = "icon",
  className,
}: {
  coachId: string;
  initialFavorite: boolean;
  viewerRole: ViewerRole;
  variant?: "icon" | "cta";
  className?: string;
}) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isPending, startTransition] = useTransition();

  // Un coach non può salvare altri coach: `toggleFavorite` lo rifiuterebbe.
  if (viewerRole === "coach") return null;

  if (viewerRole === null) {
    const label = variant === "cta" ? "Accedi e salvalo tra i preferiti" : "Accedi per salvare tra i preferiti";
    return (
      <SignInButton mode="modal">
        {variant === "cta" ? (
          <GameCta tone="ball" showBall arrow size="large" className={className}>
            {label}
          </GameCta>
        ) : (
          <Button variant="outline" size="icon" aria-label={label} className={cn("shrink-0", className)}>
            <Heart className="size-4" />
          </Button>
        )}
      </SignInButton>
    );
  }

  function handleClick() {
    const next = !isFavorite;
    setIsFavorite(next);
    startTransition(async () => {
      const result = await toggleFavorite(coachId);
      if (result.ok) {
        setIsFavorite(result.data);
        if (result.data) toast.success("Aggiunto ai preferiti — lo ritrovi in “Preferiti”");
        else toast("Rimosso dai preferiti");
      } else {
        setIsFavorite(!next);
        toast.error(result.error);
      }
    });
  }

  if (variant === "cta") {
    return (
      <>
        {isPending && <FullScreenGameLoader label="Aggiorniamo i preferiti" />}
        <GameCta
          type="button"
          disabled={isPending}
          onClick={handleClick}
          tone={isFavorite ? "outline" : "ball"}
          showBall={!isFavorite}
          size="large"
          className={className}
        >
          {isFavorite ? "Salvato tra i preferiti" : "Salva tra i preferiti"}
        </GameCta>
      </>
    );
  }

  return (
    <>
      {isPending && <FullScreenGameLoader label="Aggiorniamo i preferiti" />}
      <Button
        variant="outline"
        size="icon"
        disabled={isPending}
        onClick={handleClick}
        aria-label={isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
        aria-pressed={isFavorite}
        className={cn("shrink-0", className)}
      >
        <Heart className={cn("size-4 transition-[transform,color,fill] duration-150", isFavorite && "scale-110 fill-red-500 text-red-500")} />
      </Button>
    </>
  );
}
