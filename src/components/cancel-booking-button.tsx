"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateBookingStatus } from "@/lib/actions/bookings";
import { FullScreenGameLoader } from "@/components/design";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function CancelBookingButton({
  bookingId,
  coachName,
  date,
  startTime,
}: {
  bookingId: string;
  coachName?: string;
  date: string;
  startTime: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, "annullata");
      if (result.ok) {
        setOpen(false);
        toast("Prenotazione annullata.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      {isPending && <FullScreenGameLoader label="Annulliamo la prenotazione" />}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger
          render={<Button size="sm" variant="outline" disabled={isPending} />}
        >
          Annulla
        </AlertDialogTrigger>
        <AlertDialogContent>
          <p className="ui-kicker text-accent-orange-ink">Conferma richiesta</p>
          <AlertDialogTitle className="mt-2">Vuoi annullare la lezione?</AlertDialogTitle>
          <AlertDialogDescription>
            Stai annullando la lezione con {coachName ?? "il coach"} del {date} alle {startTime}.
            Tu e il coach riceverete subito una notifica.
          </AlertDialogDescription>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AlertDialogClose render={<Button variant="outline" />}>
              Torna indietro
            </AlertDialogClose>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isPending}
              className="font-heading font-bold uppercase"
            >
              Sì, annulla la lezione
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
