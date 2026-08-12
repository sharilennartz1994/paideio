"use client";

import { type ReactElement, type ReactNode, useState } from "react";
import { AlertTriangle, History } from "@/components/icons/paideio-icons";
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
 * non si può evidenziare la conseguenza dell'azione e su iOS mostra il
 * dominio in cima. `CancelBookingButton` usava già un `AlertDialog` Base UI;
 * questo componente ne generalizza la forma per tutte le altre conferme.
 *
 * Il dialog si chiude da solo quando l'azione va a buon fine: `onConfirm`
 * ritorna `true` per chiudere, `false` per restare aperto e lasciare leggere
 * l'errore nel toast.
 *
 * **Il bottone di conferma è neutro, non rosso.** Il rosso significa errore o
 * allarme: qui l'utente sta facendo una cosa che vuole fare, spesso
 * reversibile. Il rischio, quando c'è, lo comunica il riquadro `warning`, che
 * dice *cosa* succede invece di limitarsi a colorare il pulsante.
 */
export function ConfirmDialog({
  trigger,
  kicker = "Conferma",
  title,
  description,
  reassurance,
  warning,
  confirmLabel,
  cancelLabel = "Torna indietro",
  disabled = false,
  onConfirm,
}: {
  /** Bottone che apre il dialog. Riceve lui il ruolo di trigger. */
  trigger: ReactElement;
  kicker?: string;
  title: string;
  description: ReactNode;
  /** Perché si può procedere senza timore: come si torna indietro. */
  reassurance?: ReactNode;
  /** Danno collaterale reale: cosa viene perso o annullato. */
  warning?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
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
        <p className="ui-kicker text-accent-cyan-ink">{kicker}</p>
        <AlertDialogTitle className="mt-2">{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        {reassurance && (
          <p className="mt-4 flex items-start gap-2 border border-accent-cyan-ink/40 bg-carta-bassa p-3 text-sm leading-relaxed text-calce">
            <History className="mt-0.5 size-4 shrink-0 text-accent-cyan-ink" aria-hidden />
            <span>{reassurance}</span>
          </p>
        )}
        {warning && (
          <p className="mt-3 flex items-start gap-2 border border-accent-orange-ink/45 bg-carta-bassa p-3 text-sm leading-relaxed text-calce">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent-orange-ink" aria-hidden />
            <span>{warning}</span>
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AlertDialogClose render={<Button variant="outline" />} disabled={working}>
            {cancelLabel}
          </AlertDialogClose>
          {/* `variant="default"` = `bg-primary text-primary-foreground`, cioè
              `--vetro` su `--carta`: 5,45:1 di giorno e 9,82:1 di notte,
              perché i due token cambiano tema insieme. */}
          <Button onClick={handleConfirm} disabled={working} className="font-heading font-bold uppercase">
            {confirmLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
