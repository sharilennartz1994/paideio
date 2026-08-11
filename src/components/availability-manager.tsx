"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { addAvailabilitySlot, removeAvailabilitySlot } from "@/lib/actions/coach-admin";
import { dayName } from "@/lib/constants";
import { LocationManager } from "@/components/location-manager";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FullScreenGameLoader, GameCta, GameEmptyState } from "@/components/design";

type Location = { id: string; name: string };
type Slot = { id: string; locationId: string; dayOfWeek: number; startTime: string; endTime: string };

const DAYS = [1, 2, 3, 4, 5, 6, 0]; // lunedì..domenica

export function AvailabilityManager({
  locations,
  initialSlots,
}: {
  locations: Location[];
  initialSlots: Slot[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const locationById = new Map(locations.map((l) => [l.id, l]));
  const visibleSlots = Array.from(
    new Map(
      initialSlots.map((slot) => [
        `${slot.locationId}|${slot.dayOfWeek}|${slot.startTime}|${slot.endTime}`,
        slot,
      ])
    ).values()
  );
  const slotsByDay = DAYS.map((day) => ({
    day,
    slots: visibleSlots
      .filter((slot) => slot.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  })).filter((group) => group.slots.length > 0);

  function handleAdd(formData: FormData) {
    setError(null);
    const locationId = String(formData.get("locationId") ?? "");
    const dayOfWeek = Number(formData.get("dayOfWeek"));
    const startTime = String(formData.get("startTime") ?? "");
    const endTime = String(formData.get("endTime") ?? "");

    if (!locationId || !startTime || !endTime) {
      setError("Compila tutti i campi.");
      return;
    }
    if (startTime >= endTime) {
      setError("L'orario di fine deve essere dopo l'orario di inizio.");
      return;
    }

    startTransition(async () => {
      const result = await addAvailabilitySlot({ locationId, dayOfWeek, startTime, endTime });
      if (result.ok) {
        formRef.current?.reset();
        toast.success("Orario aggiunto al tuo calendario 🎾");
      } else {
        setError(result.error);
      }
    });
  }

  async function handleRemove(id: string): Promise<boolean> {
    const result = await removeAvailabilitySlot(id);
    if (result.ok) {
      toast("Orario rimosso.");
      return true;
    }
    toast.error(result.error);
    return false;
  }

  // Senza campi non esiste un turno da pubblicare: prima qui c'era solo un
  // avviso che rimandava a un'altra scheda, e il coach restava bloccato.
  // Adesso il primo campo si crea direttamente da questa pagina.
  if (locations.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Alert role="status">
          <AlertDescription>
            Un turno è sempre legato a un campo: crea il primo qui sotto e poi torni subito a
            pubblicare gli orari.
          </AlertDescription>
        </Alert>
        <LocationManager initialLocations={[]} />
        <p className="text-sm text-nebbia">
          Preferisci gestirli tutti insieme?{" "}
          <Link href="/coach-admin/campi" className="font-semibold text-vetro underline underline-offset-4">
            Vai alla scheda Campi
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {isPending && <FullScreenGameLoader label="Aggiorniamo gli orari" />}
      <div className="flex flex-col gap-4">
        {visibleSlots.length === 0 && (
          <GameEmptyState
            asset="pickupTube"
            title="Calendario da caricare"
            description="Aggiungi il primo turno e prepara il campo per i prossimi giocatori."
          />
        )}
        {slotsByDay.map((group) => (
          <section key={group.day} className="grid gap-3 border-t border-nebbia/20 pt-4 sm:grid-cols-[120px_1fr]">
            <h3 className="font-heading text-lg capitalize text-calce">{dayName(group.day)}</h3>
            <div className="grid gap-2">
              {group.slots.map((slot) => (
                <div key={slot.id} className="flex min-h-14 items-center justify-between gap-3 border border-nebbia/25 bg-carta-bassa px-4 py-2">
                  <div>
                    <p className="font-heading text-calce">{slot.startTime}–{slot.endTime}</p>
                    <p className="text-xs text-nebbia">{locationById.get(slot.locationId)?.name}</p>
                  </div>
                  <ConfirmDialog
                    trigger={
                      <Button size="sm" variant="ghost">
                        Rimuovi
                      </Button>
                    }
                    disabled={isPending}
                    title="Rimuovere questo turno?"
                    description={
                      <>
                        <strong className="text-calce capitalize">{dayName(group.day)}</strong>{" "}
                        <strong className="text-calce">{slot.startTime}–{slot.endTime}</strong> non
                        si ripeterà più. Se ti serve togliere una sola data, chiudila in “Le
                        prossime date” invece di rimuovere il turno.
                      </>
                    }
                    confirmLabel="Sì, rimuovi il turno"
                    onConfirm={() => handleRemove(slot.id)}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <form ref={formRef} action={handleAdd} className="grid gap-4 border-t border-nebbia/20 pt-6 sm:grid-cols-4">
        <div className="sm:col-span-4">
          <h3 className="font-heading text-lg text-calce">Pubblica un turno ricorrente</h3>
          <p className="mt-1 text-sm text-nebbia">Esempio: ogni martedì dalle 18:00 alle 19:00 al tuo club.</p>
        </div>
        <div>
          <Label htmlFor="locationId" className="font-mono text-label-caps text-on-surface-variant uppercase">Campo</Label>
          <Select
            name="locationId"
            defaultValue={locations[0]?.id}
            items={locations.map((location) => ({
              value: location.id,
              label: location.name,
            }))}
          >
            <SelectTrigger id="locationId" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              {locations.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dayOfWeek" className="font-mono text-label-caps text-on-surface-variant uppercase">Giorno</Label>
          <Select
            name="dayOfWeek"
            defaultValue={DAYS[0]}
            items={DAYS.map((day) => ({
              value: day,
              label: dayName(day),
            }))}
          >
            <SelectTrigger id="dayOfWeek" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              {DAYS.map((d) => (
                <SelectItem key={d} value={d}>
                  {dayName(d)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="startTime" className="font-mono text-label-caps text-on-surface-variant uppercase">Dalle</Label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue="09:00"
            className="mt-1.5 flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          />
        </div>
        <div>
          <Label htmlFor="endTime" className="font-mono text-label-caps text-on-surface-variant uppercase">Alle</Label>
          <input
            id="endTime"
            name="endTime"
            type="time"
            defaultValue="12:00"
            className="mt-1.5 flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          />
        </div>
        <div className="sm:col-span-4">
          {error && <p role="alert" className="mb-2 font-sans text-sm text-destructive">{error}</p>}
          <GameCta
            type="submit"
            disabled={isPending}
            tone="ball"
            showBall
          >
            Aggiungi orario
          </GameCta>
        </div>
      </form>
    </div>
  );
}
