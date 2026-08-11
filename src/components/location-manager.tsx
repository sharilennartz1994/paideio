"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { addLocation, removeLocation } from "@/lib/actions/coach-admin";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FullScreenGameLoader, GameCta, GameEmptyState } from "@/components/design";

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

  async function handleRemove(id: string): Promise<boolean> {
    const result = await removeLocation(id);
    if (result.ok) {
      toast("Campo rimosso.");
      return true;
    }
    toast.error(result.error);
    return false;
  }

  return (
    <div className="flex flex-col gap-6">
      {isPending && <FullScreenGameLoader label="Aggiorniamo i campi" />}
      {geoStatus === "loading" && <FullScreenGameLoader label="Rileviamo la posizione del campo" />}
      <div className="flex flex-col gap-3">
        {initialLocations.length === 0 && (
          <GameEmptyState
            asset="meshModule"
            title="Nessun campo in mappa"
            description="Aggiungi il tuo primo club: sarà la prossima arena dei giocatori."
          />
        )}
        {initialLocations.map((loc) => (
          <div
            key={loc.id}
            className="card-clip flex items-center justify-between border-t-2 border-vetro bg-surface-container-high p-4"
          >
            <div>
              <p className="font-heading text-headline-md text-on-surface">{loc.name}</p>
              <p className="font-sans text-sm text-on-surface-variant">
                {loc.address}, {loc.city}
              </p>
              {loc.lat == null && (
                <Badge variant="outline" className="mt-1.5">
                  Non geolocalizzato — non comparirà nella ricerca &quot;vicino a me&quot;
                </Badge>
              )}
            </div>
            {/* Il cascade della FK cancella anche gli availability_slots del
                campo: se non lo diciamo, il coach si ritrova il calendario
                svuotato senza capire perché. */}
            <ConfirmDialog
              trigger={
                <Button size="sm" variant="outline">
                  Rimuovi
                </Button>
              }
              disabled={isPending}
              title="Rimuovere questo campo?"
              description={
                <>
                  <strong className="text-calce">{loc.name}</strong> sparirà dal tuo profilo
                  pubblico.
                </>
              }
              warning="Verranno eliminati anche tutti i turni settimanali pubblicati su questo campo, e le prenotazioni future collegate verranno annullate con notifica ai giocatori."
              confirmLabel="Sì, rimuovi il campo"
              onConfirm={() => handleRemove(loc.id)}
            />
          </div>
        ))}
      </div>

      <form ref={formRef} action={handleAdd} className="grid gap-4 border-t border-nebbia/20 pt-6 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <h3 className="font-heading text-lg text-calce">Aggiungi un nuovo club</h3>
          <p className="mt-1 text-sm text-nebbia">Inserisci l’indirizzo come lo vedrà il giocatore nel riepilogo della lezione.</p>
        </div>
        <div>
          <Label htmlFor="name" className="font-mono text-label-caps text-on-surface-variant uppercase">Nome campo</Label>
          <Input id="name" name="name" className="mt-1.5" placeholder="es. Padel Club Milano Nord" />
        </div>
        <div>
          <Label htmlFor="address" className="font-mono text-label-caps text-on-surface-variant uppercase">Indirizzo</Label>
          <Input id="address" name="address" className="mt-1.5" placeholder="Via, numero civico" />
        </div>
        <div>
          <Label htmlFor="city" className="font-mono text-label-caps text-on-surface-variant uppercase">Città</Label>
          <Input id="city" name="city" className="mt-1.5" placeholder="es. Milano" />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-3">
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={handleDetectPosition} disabled={geoStatus === "loading"}>
              {geoStatus === "loading" ? "Rilevamento…" : "Rileva posizione da qui"}
            </Button>
            {coords && <span className="font-sans text-sm text-on-surface-variant">Posizione rilevata ✓</span>}
            {geoStatus === "error" && (
              <span className="font-sans text-sm text-destructive">Posizione non disponibile.</span>
            )}
          </div>
          <p className="font-sans text-xs text-on-surface-variant">
            Rileva la posizione mentre sei fisicamente al campo, così i giocatori potranno trovarlo nella
            ricerca &quot;vicino a me&quot;. Puoi aggiungere il campo anche senza, ma non comparirà in quella ricerca.
          </p>
        </div>
        <div className="sm:col-span-3">
          {error && <p className="mb-2 font-sans text-sm text-destructive">{error}</p>}
          <GameCta
            type="submit"
            disabled={isPending}
            tone="ball"
            showBall
          >
            Aggiungi campo
          </GameCta>
        </div>
      </form>
    </div>
  );
}
