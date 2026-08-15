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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  body,
  reassurance,
  warning,
  confirmLabel,
  cancelLabel = "Torna indietro",
  disabled = false,
  confirmDisabled = false,
  mustDecide = false,
  onConfirm,
}: {
  /** Bottone che apre il dialog. Riceve lui il ruolo di trigger. */
  trigger: ReactElement;
  kicker?: string;
  title: string;
  description: ReactNode;
  /**
   * Campi che l'utente deve compilare prima di confermare (una motivazione, un
   * orario alternativo). Vanno qui e non in `description`: quella è la
   * `Description` di Base UI, cioè un `<p>`, e annidarci dentro form control
   * produce markup non valido.
   */
  body?: ReactNode;
  /** Perché si può procedere senza timore: come si torna indietro. */
  reassurance?: ReactNode;
  /** Danno collaterale reale: cosa viene perso o annullato. */
  warning?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  disabled?: boolean;
  /** Il modulo dentro `body` non è ancora completo. */
  confirmDisabled?: boolean;
  /**
   * Forza la modale non chiudibile anche quando la regola automatica la
   * renderebbe chiudibile. Da usare solo con una ragione scritta.
   */
  mustDecide?: boolean;
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

  // Chiudibile per default: annullare una conferma cliccando fuori equivale a
  // premere "Torna indietro", non si perde niente. Resta non chiudibile in due
  // casi in cui invece qualcosa si perde: c'è un modulo compilato a metà
  // (`body`), oppure c'è una conseguenza irreversibile da leggere (`warning`).
  const mustStay = mustDecide || body != null || warning != null;

  const Root = mustStay ? AlertDialog : Dialog;
  const Trigger = mustStay ? AlertDialogTrigger : DialogTrigger;
  const Content = mustStay ? AlertDialogContent : DialogContent;
  const Title = mustStay ? AlertDialogTitle : DialogTitle;
  const Description = mustStay ? AlertDialogDescription : DialogDescription;
  const Close = mustStay ? AlertDialogClose : DialogClose;

  return (
    <Root open={open} onOpenChange={setOpen}>
      <Trigger disabled={disabled} render={trigger} />
      <Content>
        <p className="ui-kicker text-accent-cyan-ink">{kicker}</p>
        {/* `pr-14` solo quando c'è la X in alto a destra. */}
        <Title className={mustStay ? "mt-2" : "mt-2 pr-14"}>{title}</Title>
        <Description>{description}</Description>
        {body && <div className="mt-4 grid gap-4">{body}</div>}
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
          <Close render={<Button variant="outline" />} disabled={working}>
            {cancelLabel}
          </Close>
          {/* `variant="default"` = `bg-primary text-primary-foreground`, cioè
              `--vetro` su `--carta`: 5,45:1 di giorno e 9,82:1 di notte,
              perché i due token cambiano tema insieme. */}
          <Button
            onClick={handleConfirm}
            disabled={working || confirmDisabled}
            className="font-heading font-bold uppercase"
          >
            {confirmLabel}
          </Button>
        </div>
      </Content>
    </Root>
  );
}
