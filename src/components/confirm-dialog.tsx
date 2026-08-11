"use client";

import { type ReactElement, type ReactNode, useState } from "react";
import { AlertTriangle } from "@/components/icons/paideio-icons";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * Conferma in stile Paideio, al posto di `window.confirm()`.
 *
 * Il dialog nativo del browser non è solo brutto: non rispetta il tema,
 * non si può evidenziare la conseguenza distruttiva e su iOS mostra il
 * dominio in cima. `CancelBookingButton` usava già un `AlertDialog` Base UI;
 * questo componente ne generalizza la forma per tutte le altre conferme.
 *
 * Il dialog si chiude da solo quando l'azione va a buon fine: `onConfirm`
 * ritorna `true` per chiudere, `false` per restare aperto e lasciare leggere
 * l'errore nel toast.
 */
export function ConfirmDialog({
  trigger,
  kicker = "Conferma richiesta",
  title,
  description,
  warning,
  confirmLabel,
  cancelLabel = "Torna indietro",
  destructive = true,
  disabled = false,
  onConfirm,
}: {
  /** Bottone che apre il dialog. Riceve lui il ruolo di trigger. */
  trigger: ReactElement;
  kicker?: string;
  title: string;
  description: ReactNode;
  /** Conseguenza irreversibile, evidenziata sopra i bottoni. */
  warning?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  disabled?: boolean;
  onConfirm: () => Promise<boolean> | boolean;
}) {
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);

  async function handleConfirm() {
    setWorking(true);
    try {
      if (await onConfirm()) setOpen(false);
    } finally {
      setWorking(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger disabled={disabled} render={trigger} />
      <AlertDialogContent>
        <p className={destructive ? "ui-kicker text-accent-orange-ink" : "ui-kicker text-accent-cyan-ink"}>
          {kicker}
        </p>
        <AlertDialogTitle className="mt-2">{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        {warning && (
          <p className="mt-4 flex items-start gap-2 border border-accent-orange-ink/45 bg-carta-bassa p-3 text-sm leading-relaxed text-calce">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent-orange-ink" aria-hidden />
            <span>{warning}</span>
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AlertDialogClose render={<Button variant="outline" />} disabled={working}>
            {cancelLabel}
          </AlertDialogClose>
          {/* Non `variant="destructive"`: quella variante è un riempimento al
              10-20% con testo `--destructive`, che di notte dà 3,91:1. Qui il
              riempimento è pieno e fisso — ruggine + game-ink, 6,32:1 in
              entrambi i temi — anche perché l'azione distruttiva di un dialog
              di conferma deve essere il bottone più evidente. */}
          <Button
            onClick={handleConfirm}
            disabled={working}
            className={
              destructive
                ? "bg-ruggine font-heading font-bold text-game-ink uppercase hover:bg-ruggine/85"
                : "font-heading font-bold uppercase"
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
