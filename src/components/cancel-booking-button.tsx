"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateBookingStatus } from "@/lib/actions/bookings";
import { Button } from "@/components/ui/button";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    startTransition(async () => {
      await updateBookingStatus(bookingId, "annullata");
      toast("Prenotazione annullata.");
    });
  }

  return (
    <Button size="sm" variant="outline" disabled={isPending} onClick={handleCancel}>
      {isPending ? "Annullamento…" : "Annulla"}
    </Button>
  );
}
