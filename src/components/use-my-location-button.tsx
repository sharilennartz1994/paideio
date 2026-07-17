"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UseMyLocationButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setError("Il tuo browser non supporta la geolocalizzazione.");
      return;
    }

    setStatus("loading");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", position.coords.latitude.toString());
        params.set("lng", position.coords.longitude.toString());
        params.delete("city");
        setStatus("idle");
        router.push(`/cerca?${params.toString()}`);
      },
      () => {
        setStatus("error");
        setError("Non è stato possibile accedere alla tua posizione. Controlla i permessi del browser.");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button type="button" variant="outline" onClick={handleClick} disabled={status === "loading"}>
        {status === "loading" ? "Rilevamento posizione…" : "Usa la mia posizione"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
