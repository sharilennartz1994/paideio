"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, InfoIcon } from "@/components/icons/paideio-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export type Outcome = {
  /** Etichetta breve sopra il titolo. */
  kicker?: string;
  title: string;
  description: ReactNode;
  /** Dettaglio secondario: cosa succede adesso, chi deve fare cosa. */
  next?: ReactNode;
  tone?: "success" | "info";
  /** Testo del bottone di chiusura. */
  closeLabel?: string;
};

const OutcomeContext = createContext<((outcome: Outcome) => void) | null>(null);

/**
 * Esiti delle azioni importanti, mostrati in una modale invece che in un toast.
 *
 * Un toast in alto dura pochi secondi e si perde: va bene per confermare che
 * un campo è stato salvato, non per dire a un giocatore che la sua richiesta è
 * partita e che ora deve aspettare la conferma del coach. La modale ferma
 * l'attenzione e ha spazio per spiegare cosa succede dopo.
 *
 * **Solo per le azioni che cambiano lo stato di una lezione.** Le conferme di
 * routine (preferito, campo aggiunto, profilo salvato) restano toast: una
 * modale a ogni click sarebbe più fastidiosa del problema che risolve.
 *
 * È un `Dialog`, non un `AlertDialog`: qui non c'è niente da decidere, quindi
 * si chiude con la X, con Esc e cliccando fuori. Vedi `ui/dialog.tsx`.
 */
export function OutcomeProvider({ children }: { children: ReactNode }) {
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [open, setOpen] = useState(false);

  const show = useCallback((next: Outcome) => {
    setOutcome(next);
    setOpen(true);
  }, []);

  const tone = outcome?.tone ?? "success";
  const Icon = tone === "success" ? CheckCircle2 : InfoIcon;

  return (
    <OutcomeContext.Provider value={show}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        {outcome && (
          <DialogContent closeLabel="Chiudi">
            <p className="ui-kicker flex items-center gap-2 text-accent-cyan-ink">
              <Icon className="size-4" aria-hidden />
              {outcome.kicker ?? "Fatto"}
            </p>
            {/* `pr-14`: lascia spazio al bottone di chiusura in alto a destra. */}
            <DialogTitle className="mt-2 pr-14">{outcome.title}</DialogTitle>
            <DialogDescription>{outcome.description}</DialogDescription>
            {outcome.next && (
              <p className="mt-4 border border-accent-cyan-ink/40 bg-carta-bassa p-3 text-sm leading-relaxed text-calce">
                {outcome.next}
              </p>
            )}
            <div className="mt-6 flex justify-end">
              <DialogClose render={<Button className="font-heading font-bold uppercase" />}>
                {outcome.closeLabel ?? "Ho capito"}
              </DialogClose>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </OutcomeContext.Provider>
  );
}

/**
 * Mostra l'esito di un'azione importante. Fuori dal provider ritorna una
 * funzione inerte invece di lanciare: un componente non deve rompersi solo
 * perché è renderizzato in un contesto che non ha il provider (test, storybook).
 */
export function useOutcome(): (outcome: Outcome) => void {
  const show = useContext(OutcomeContext);
  return show ?? (() => {});
}
