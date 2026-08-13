"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  acceptBookingProposal,
  declineBookingProposal,
} from "@/lib/actions/booking-proposals";
import { celebrate } from "@/lib/confetti";
import { CalendarDays, Clock3, MessageSquareText } from "@/components/icons/paideio-icons";
import { FullScreenGameLoader } from "@/components/design";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * Il pannello che il giocatore vede quando il coach ha proposto un altro
 * orario. Accettare conferma la lezione (l'orario l'ha scelto il coach, una
 * seconda conferma sarebbe un giro a vuoto); rifiutare chiude la richiesta.
 */
export function BookingProposalActions({
  bookingId,
  coachName,
  originalDate,
  originalStartTime,
  proposedDate,
  proposedStartTime,
  proposedEndTime,
  coachMessage,
}: {
  bookingId: string;
  coachName: string;
  originalDate: string;
  originalStartTime: string;
  proposedDate: string;
  proposedStartTime: string;
  proposedEndTime: string;
  coachMessage: string;
}) {
  const [isPending, setIsPending] = useState(false);

  async function handleAccept(): Promise<boolean> {
    setIsPending(true);
    try {
      const result = await acceptBookingProposal(bookingId);
      if (!result.ok) {
        toast.error(result.error);
        return false;
      }
      celebrate();
      toast.success(
        `Lezione confermata: ${formatDate(result.data.date)} alle ${result.data.startTime}.`
      );
      return true;
    } finally {
      setIsPending(false);
    }
  }

  async function handleDecline(): Promise<boolean> {
    setIsPending(true);
    try {
      const result = await declineBookingProposal(bookingId);
      if (!result.ok) {
        toast.error(result.error);
        return false;
      }
      toast("Proposta rifiutata. Puoi cercare un altro orario quando vuoi.");
      return true;
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="mt-4 border border-accent-cyan-ink/45 bg-carta-bassa p-4">
      {isPending && <FullScreenGameLoader label="Aggiorniamo la lezione" />}
      <p className="font-heading text-[10px] font-bold text-accent-cyan-ink uppercase">
        {coachName} propone un altro orario
      </p>
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-calce">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-4 text-accent-cyan-ink" aria-hidden />
          {formatDate(proposedDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock3 className="size-4 text-accent-cyan-ink" aria-hidden />
          {proposedStartTime}–{proposedEndTime}
        </span>
      </p>
      <p className="mt-1 text-xs text-nebbia">
        Avevi chiesto {formatDate(originalDate)} alle {originalStartTime}.
      </p>
      {coachMessage && (
        <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-nebbia">
          <MessageSquareText className="mt-0.5 size-4 shrink-0 text-accent-cyan-ink" aria-hidden />
          <span>“{coachMessage}”</span>
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <ConfirmDialog
          kicker="Nuovo orario"
          title="Vuoi spostare la lezione a questo orario?"
          description={`La lezione con ${coachName} passa a ${formatDate(proposedDate)} alle ${proposedStartTime}–${proposedEndTime} e risulta subito confermata: il coach ha già detto che c'è.`}
          reassurance="Se cambi idea puoi annullare la lezione dalla stessa pagina, come qualunque altra prenotazione."
          confirmLabel="Accetta il nuovo orario"
          disabled={isPending}
          onConfirm={handleAccept}
          trigger={
            <Button size="sm" className="font-heading text-xs font-bold uppercase">
              Accetta il nuovo orario
            </Button>
          }
        />
        <ConfirmDialog
          kicker="Proposta del coach"
          title="Vuoi rifiutare questo orario?"
          description={`${coachName} non può tenere la lezione che avevi chiesto, e l'alternativa proposta non ti va bene.`}
          warning="La richiesta si chiude qui: per allenarti con questo coach dovrai inviarne una nuova, scegliendo tu la fascia."
          confirmLabel="Rifiuta la proposta"
          disabled={isPending}
          onConfirm={handleDecline}
          trigger={
            <Button size="sm" variant="outline" className="font-heading text-xs uppercase">
              Rifiuta
            </Button>
          }
        />
      </div>
    </div>
  );
}
