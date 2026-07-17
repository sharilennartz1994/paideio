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
      try {
        await updateCoachProfile({
          bio,
          levels: Array.from(levels),
          trainingTypes: Array.from(trainingTypes),
          pricePerLesson: parsedPrice,
        });
        toast.success("Profilo aggiornato!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Errore imprevisto, riprova.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label htmlFor="bio" className="mb-2 block font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          Bio
        </Label>
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
      </div>

      <div>
        <Label className="mb-2 block font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Tipo di allenamento offerto</Label>
        <div className="flex gap-4">
          {TRAINING_TYPES.map((t) => (
            <div key={t} className="flex items-center gap-2">
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
        <Label className="mb-2 block font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Livelli che segui</Label>
        <div className="flex gap-4">
          {LEVELS.map((l) => (
            <div key={l} className="flex items-center gap-2">
              <Checkbox id={`lv-${l}`} checked={levels.has(l)} onCheckedChange={() => toggle(levels, setLevels, l)} />
              <Label htmlFor={`lv-${l}`} className="font-normal capitalize">
                {l}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="price" className="mb-2 block font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
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
        <p className="mt-1.5 text-xs text-muted-foreground">
          In euro interi. Lascia vuoto se preferisci non indicarlo.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="cut-cta bg-ball font-mono text-xs font-bold tracking-wider text-ball-foreground uppercase hover:bg-ball/90"
        >
          {isPending ? "Salvataggio…" : "Salva profilo"}
        </Button>
      </div>

      {(trainingTypes.size === 0 || levels.size === 0) && (
        <Alert>
          <AlertDescription>
            Senza almeno un tipo di allenamento e un livello selezionati, il tuo profilo non
            comparirà nei risultati di ricerca dei giocatori.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
