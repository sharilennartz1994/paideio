"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateBookingStatus } from "@/lib/actions/bookings";
import { Button } from "@/components/ui/button";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, "annullata");
      if (result.ok) {
        toast("Prenotazione annullata.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button size="sm" variant="outline" disabled={isPending} onClick={handleCancel}>
      {isPending ? "Annullamento…" : "Annulla"}
    </Button>
  );
}
