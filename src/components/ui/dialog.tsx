"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "@/components/icons/paideio-icons";
import { cn } from "@/lib/utils";

/**
 * Modale **chiudibile**, gemella di `ui/alert-dialog.tsx`.
 *
 * La differenza non è estetica ed è l'unica ragione per cui questo file
 * esiste: `AlertDialog` di Base UI "requires a user response to proceed",
 * quindi ignora il click fuori e l'Esc; `Dialog` si chiude con click fuori,
 * Esc e pulsante di chiusura. Vale la regola del prodotto: se non è vitale
 * che la persona legga il contenuto o agisca da qui, deve poter uscire in
 * tutti i modi che si aspetta. Gli esiti informativi usano questo, le
 * conferme distruttive restano su `AlertDialog`.
 *
 * Stessi z-index dell'alert dialog (backdrop 210, popup 220) perché le due
 * modali non compaiono mai insieme: l'esito si apre solo dopo che la
 * conferma si è chiusa del tutto.
 */
function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger {...props} />;
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-[210] bg-game-ink/78 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  closeLabel = "Chiudi",
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
  closeLabel?: string;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        className={cn(
          "fixed top-1/2 left-1/2 z-[220] max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-accent-cyan-ink/45 bg-carta-alta p-6 text-calce shadow-[8px_8px_0_var(--game-blue)] outline-none transition duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          // Target 44px pieno e non un'icona minuscola: è la via d'uscita
          // principale su touch. `pr-14` sul titolo evita la sovrapposizione.
          <DialogPrimitive.Close
            className="absolute top-3 right-3 inline-flex size-11 items-center justify-center border border-transparent text-nebbia transition-colors hover:border-nebbia/30 hover:bg-carta-bassa hover:text-calce focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vetro"
          >
            <XIcon className="size-5" />
            <span className="sr-only">{closeLabel}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      className={cn("font-heading text-2xl font-bold text-calce", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      className={cn("mt-3 leading-relaxed text-nebbia", className)}
      {...props}
    />
  );
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close {...props} />;
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
