"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateCoachProfile } from "@/lib/actions/coach-admin";
import { LEVELS, TRAINING_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FullScreenGameLoader } from "@/components/design";

export function CoachProfileForm({
  initialBio,
  initialLevels,
  initialTrainingTypes,
  initialPricePerLesson,
}: {
  initialBio: string;
  initialLevels: string[];
  initialTrainingTypes: string[];
  initialPricePerLesson: number | null;
}) {
  const [bio, setBio] = useState(initialBio);
  const [levels, setLevels] = useState(new Set(initialLevels));
  const [trainingTypes, setTrainingTypes] = useState(new Set(initialTrainingTypes));
  const [price, setPrice] = useState(initialPricePerLesson != null ? String(initialPricePerLesson) : "");
  const [isPending, startTransition] = useTransition();

  function toggle(set: Set<string>, setSet: (s: Set<string>) => void, value: string) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setSet(next);
  }

  function handleSave() {
    const trimmedPrice = price.trim();
    const parsedPrice = trimmedPrice === "" ? null : Number(trimmedPrice);
    if (parsedPrice !== null && (!Number.isInteger(parsedPrice) || parsedPrice <= 0)) {
      toast.error("Il prezzo per lezione deve essere un numero intero positivo.");
      return;
    }
    startTransition(async () => {
      const result = await updateCoachProfile({
        bio,
        levels: Array.from(levels),
        trainingTypes: Array.from(trainingTypes),
        pricePerLesson: parsedPrice,
      });
      if (result.ok) {
        toast.success("Profilo aggiornato!");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {isPending && <FullScreenGameLoader label="Salviamo il profilo" />}
      <div>
        <Label htmlFor="bio" className="mb-2 block font-mono text-label-caps text-on-surface-variant uppercase">
          Bio
        </Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
          placeholder="Racconta come alleni, quale esperienza porti in campo e cosa può aspettarsi un giocatore."
        />
        <p className="mt-1.5 text-xs text-nebbia">Scrivi in modo concreto: metodo, specialità e tipo di giocatore che segui meglio.</p>
      </div>

      <div>
        <Label className="mb-2 block font-mono text-label-caps text-on-surface-variant uppercase">Tipo di allenamento offerto</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {TRAINING_TYPES.map((t) => (
            <div key={t} className="flex min-h-11 items-center gap-3 border border-nebbia/25 bg-carta-bassa px-3">
              <Checkbox
                id={`tt-${t}`}
                checked={trainingTypes.has(t)}
                onCheckedChange={() => toggle(trainingTypes, setTrainingTypes, t)}
              />
              <Label htmlFor={`tt-${t}`} className="font-normal">
                {t === "singolo" ? "Singolo" : "Gruppo"}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block font-mono text-label-caps text-on-surface-variant uppercase">Livelli che segui</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {LEVELS.map((l) => (
            <div key={l} className="flex min-h-11 items-center gap-3 border border-nebbia/25 bg-carta-bassa px-3">
              <Checkbox id={`lv-${l}`} checked={levels.has(l)} onCheckedChange={() => toggle(levels, setLevels, l)} />
              <Label htmlFor={`lv-${l}`} className="font-normal capitalize">
                {l}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="price" className="mb-2 block font-mono text-label-caps text-on-surface-variant uppercase">
          Prezzo per lezione (€)
        </Label>
        <Input
          id="price"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          placeholder="es. 40"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="max-w-32"
        />
        <p className="mt-1.5 font-sans text-xs text-on-surface-variant">
          In euro interi. Lascia vuoto se preferisci non indicarlo.
        </p>
      </div>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 border border-nebbia/25 bg-carta-alta/95 p-3 shadow-lg backdrop-blur">
        <p className="hidden text-sm text-nebbia sm:block">Le modifiche saranno subito visibili nel profilo pubblico.</p>
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="neo-shadow bg-secondary-fixed font-mono text-label-caps text-on-secondary-fixed uppercase hover:bg-secondary-fixed/90"
        >
          Salva profilo
        </Button>
      </div>

      {(trainingTypes.size === 0 || levels.size === 0) && (
        <Alert role="status">
          <AlertDescription>
            Senza almeno un tipo di allenamento e un livello selezionati, il tuo profilo non
            comparirà nei risultati di ricerca dei giocatori.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
