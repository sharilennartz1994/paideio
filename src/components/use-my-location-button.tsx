"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, X } from "@/components/icons/paideio-icons";
import { Button } from "@/components/ui/button";
import { setSearchLocation, clearSearchLocation } from "@/lib/actions/search-location";

/**
 * La posizione non passa più dalla query string: viene consegnata a una Server
 * Action che la arrotonda e la mette in un cookie httpOnly. Vedi
 * `lib/actions/search-location.ts` per il perché.
 */
export function UseMyLocationButton({ active = false }: { active?: boolean }) {
  const router = useRouter();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const busy = locating || isPending;

  function handleClick() {
    if (!("geolocation" in navigator)) {
      setError("Il tuo browser non supporta la geolocalizzazione.");
      return;
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        startTransition(async () => {
          const result = await setSearchLocation(
            position.coords.latitude,
            position.coords.longitude
          );
          if (result.ok) router.refresh();
          else setError(result.error);
        });
      },
      () => {
        setLocating(false);
        setError(
          "Non è stato possibile accedere alla tua posizione. Controlla i permessi del browser."
        );
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  function handleClear() {
    startTransition(async () => {
      await clearSearchLocation();
      router.refresh();
    });
  }

  if (active) {
    return (
      <div className="flex flex-col gap-1.5">
        <Button type="button" variant="outline" onClick={handleClear} disabled={busy}>
          <X className="size-4" aria-hidden />
          {busy ? "Aggiorno…" : "Non usare la mia posizione"}
        </Button>
        <p className="text-xs text-nebbia">
          La posizione resta sul tuo dispositivo per questa sessione e non viene salvata.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button type="button" variant="outline" onClick={handleClick} disabled={busy}>
        <MapPin className="size-4" aria-hidden />
        {busy ? "Rilevamento posizione…" : "Usa la mia posizione"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-accent-orange-ink">
          {error}
        </p>
      )}
    </div>
  );
}
