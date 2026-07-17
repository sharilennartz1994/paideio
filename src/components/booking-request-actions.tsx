"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateBookingStatus } from "@/lib/actions/bookings";
import { celebrate } from "@/lib/confetti";
import { Button } from "@/components/ui/button";

export function BookingRequestActions({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, "confermata");
      if (result.ok) {
        celebrate();
        toast.success("Lezione confermata! Il giocatore riceverà l'ok.");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, "rifiutata");
      if (result.ok) {
        toast("Richiesta rifiutata.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={isPending}
        onClick={handleConfirm}
        className="bg-ball font-mono text-xs font-bold tracking-wider text-ball-foreground uppercase hover:bg-ball/90"
      >
        Accetta
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={handleReject}
        className="font-mono text-xs tracking-wider uppercase"
      >
        Rifiuta
      </Button>
    </div>
  );
}
