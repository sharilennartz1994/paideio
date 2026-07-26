"use client";

import { useActionState, useEffect, useRef } from "react";
import { MessageSquarePlus, Send } from "@/components/icons/paideio-icons";
import { toast } from "sonner";
import { submitProductFeedback } from "@/lib/actions/product-feedback";
import { FullScreenGameLoader, GameCta } from "@/components/design";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ReleaseFeedbackForm() {
  const [state, formAction, isPending] = useActionState(submitProductFeedback, null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastSubmission = useRef<string | null>(null);

  useEffect(() => {
    if (!state) return;
    if (!state.ok) {
      toast.error(state.error);
      return;
    }
    if (lastSubmission.current === state.data.submissionId) return;
    lastSubmission.current = state.data.submissionId;
    formRef.current?.reset();
    toast.success("Richiesta ricevuta. Grazie per aver migliorato Paideio!");
  }, [state]);

  return (
    <>
      {isPending && <FullScreenGameLoader label="Invio della tua proposta" />}
      <form ref={formRef} action={formAction} className="grid gap-5">
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="feedback-name" className="mb-2 block font-heading text-[10px] font-bold text-nebbia uppercase">
              Nome
            </Label>
            <Input id="feedback-name" name="name" required minLength={2} maxLength={80} placeholder="Come ti chiami?" />
          </div>
          <div>
            <Label htmlFor="feedback-email" className="mb-2 block font-heading text-[10px] font-bold text-nebbia uppercase">
              Email
            </Label>
            <Input id="feedback-email" name="email" type="email" required maxLength={160} placeholder="nome@email.it" />
          </div>
        </div>
        <div>
          <Label htmlFor="feedback-category" className="mb-2 block font-heading text-[10px] font-bold text-nebbia uppercase">
            Tipo di richiesta
          </Label>
          <Select
            name="category"
            defaultValue="nuova_feature"
            items={[
              { value: "nuova_feature", label: "Nuova funzionalità" },
              { value: "miglioramento", label: "Miglioramento" },
              { value: "bug", label: "Bug da correggere" },
              { value: "altro", label: "Altro" },
            ]}
          >
            <SelectTrigger id="feedback-category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="nuova_feature">Nuova funzionalità</SelectItem>
              <SelectItem value="miglioramento">Miglioramento</SelectItem>
              <SelectItem value="bug">Bug da correggere</SelectItem>
              <SelectItem value="altro">Altro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="feedback-message" className="mb-2 block font-heading text-[10px] font-bold text-nebbia uppercase">
            La tua proposta
          </Label>
          <Textarea
            id="feedback-message"
            name="message"
            required
            minLength={15}
            maxLength={1500}
            rows={6}
            placeholder="Quale problema vuoi risolvere? Come dovrebbe funzionare secondo te?"
          />
          <p className="mt-2 text-xs text-nebbia">Non inserire password, dati di pagamento o informazioni sensibili.</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-nebbia/18 pt-5">
          <p className="flex items-center gap-2 text-sm text-nebbia">
            <MessageSquarePlus className="size-4 text-accent-cyan-ink" aria-hidden />
            Leggiamo ogni proposta.
          </p>
          <GameCta type="submit" tone="ball" showBall arrow disabled={isPending}>
            <Send className="size-4" aria-hidden /> Invia proposta
          </GameCta>
        </div>
      </form>
    </>
  );
}
