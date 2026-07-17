"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createReview } from "@/lib/actions/reviews";
import { celebrate } from "@/lib/confetti";
import { StarRatingInput } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReviewForm({ bookingId, coachName }: { bookingId: string; coachName?: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (done) {
    return <p className="text-sm text-muted-foreground">Grazie per la recensione! 🎾</p>;
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Lascia una recensione
      </Button>
    );
  }

  function handleSubmit() {
    if (rating === 0) {
      toast.error("Seleziona almeno una stella.");
      return;
    }
    startTransition(async () => {
      const result = await createReview({ bookingId, rating, comment });
      if (result.ok) {
        celebrate();
        toast.success(`Recensione inviata${coachName ? ` a ${coachName}` : ""}!`);
        setDone(true);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <StarRatingInput value={rating} onChange={setRating} />
      <Textarea
        placeholder="Com'è andata la lezione? (opzionale)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Invio…" : "Invia recensione"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
          Annulla
        </Button>
      </div>
    </div>
  );
}
