"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { addLocation, removeLocation } from "@/lib/actions/coach-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Location = { id: string; name: string; address: string; city: string; lat: number | null; lng: number | null };

export function LocationManager({ initialLocations }: { initialLocations: Location[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  function handleDetectPosition() {
    if (!("geolocation" in navigator)) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeoStatus("idle");
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  function handleAdd(formData: FormData) {
    setError(null);
    const name = String(formData.get("name") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    if (!name || !address || !city) {
      setError("Compila tutti i campi.");
      return;
    }
    startTransition(async () => {
      const result = await addLocation({ name, address, city, lat: coords?.lat, lng: coords?.lng });
      if (result.ok) {
        formRef.current?.reset();
        setCoords(null);
        toast.success(`${name} aggiunto ai tuoi campi 🎾`);
      } else {
        setError(result.error);
      }
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      const result = await removeLocation(id);
      if (result.ok) {
        toast("Campo rimosso.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {initialLocations.length === 0 && (
          <p className="text-muted-foreground">Non hai ancora aggiunto nessun campo.</p>
        )}
        {initialLocations.map((loc) => (
          <Card key={loc.id} className="border-l-2 border-l-primary py-4">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="font-medium">{loc.name}</p>
                <p className="text-sm text-muted-foreground">
                  {loc.address}, {loc.city}
                </p>
                {loc.lat == null && (
                  <Badge variant="outline" className="mt-1.5">
                    Non geolocalizzato — non comparirà nella ricerca &quot;vicino a me&quot;
                  </Badge>
                )}
              </div>
              <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleRemove(loc.id)}>
                Rimuovi
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <form ref={formRef} action={handleAdd} className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="name" className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Nome campo</Label>
          <Input id="name" name="name" className="mt-1.5" placeholder="es. Padel Club Milano Nord" />
        </div>
        <div>
          <Label htmlFor="address" className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Indirizzo</Label>
          <Input id="address" name="address" className="mt-1.5" placeholder="Via, numero civico" />
        </div>
        <div>
          <Label htmlFor="city" className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Città</Label>
          <Input id="city" name="city" className="mt-1.5" placeholder="es. Milano" />
        </div>
        <div className="sm:col-span-3 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={handleDetectPosition} disabled={geoStatus === "loading"}>
              {geoStatus === "loading" ? "Rilevamento…" : "Rileva posizione da qui"}
            </Button>
            {coords && <span className="text-sm text-muted-foreground">Posizione rilevata ✓</span>}
            {geoStatus === "error" && (
              <span className="text-sm text-destructive">Posizione non disponibile.</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Rileva la posizione mentre sei fisicamente al campo, così i giocatori potranno trovarlo nella
            ricerca &quot;vicino a me&quot;. Puoi aggiungere il campo anche senza, ma non comparirà in quella ricerca.
          </p>
        </div>
        <div className="sm:col-span-3">
          {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            disabled={isPending}
            className="cut-cta bg-ball font-mono text-xs font-bold tracking-wider text-ball-foreground uppercase hover:bg-ball/90"
          >
            {isPending ? "Aggiunta…" : "Aggiungi campo"}
          </Button>
        </div>
      </form>
    </div>
  );
}
