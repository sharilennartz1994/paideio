"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { addAvailabilitySlot, removeAvailabilitySlot } from "@/lib/actions/coach-admin";
import { dayName } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
      await addAvailabilitySlot({ locationId, dayOfWeek, startTime, endTime });
      formRef.current?.reset();
      toast.success("Orario aggiunto al tuo calendario 🎾");
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      await removeAvailabilitySlot(id);
      toast("Orario rimosso.");
    });
  }

  if (locations.length === 0) {
    return (
      <Alert>
        <AlertDescription>Aggiungi prima almeno un campo nella scheda &quot;Campi&quot;.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {initialSlots.length === 0 && <p className="text-muted-foreground">Non hai ancora impostato orari.</p>}
        {initialSlots.map((slot) => (
          <Card key={slot.id} className="border-l-2 border-l-primary py-4">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {dayName(slot.dayOfWeek)}, {slot.startTime}–{slot.endTime}
                </p>
                <p className="text-sm text-muted-foreground">{locationById.get(slot.locationId)?.name}</p>
              </div>
              <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleRemove(slot.id)}>
                Rimuovi
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <form ref={formRef} action={handleAdd} className="grid gap-3 sm:grid-cols-4">
        <div>
          <Label htmlFor="locationId" className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Campo</Label>
          <select
            id="locationId"
            name="locationId"
            className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="dayOfWeek" className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Giorno</Label>
          <select
            id="dayOfWeek"
            name="dayOfWeek"
            className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {dayName(d)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="startTime" className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Dalle</Label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue="09:00"
            className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          />
        </div>
        <div>
          <Label htmlFor="endTime" className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Alle</Label>
          <input
            id="endTime"
            name="endTime"
            type="time"
            defaultValue="12:00"
            className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          />
        </div>
        <div className="sm:col-span-4">
          {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            disabled={isPending}
            className="cut-cta bg-ball font-mono text-xs font-bold tracking-wider text-ball-foreground uppercase hover:bg-ball/90"
          >
            {isPending ? "Aggiunta…" : "Aggiungi orario"}
          </Button>
        </div>
      </form>
    </div>
  );
}
