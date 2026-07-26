"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { becomeCoach } from "@/lib/actions/account";
import { Button } from "@/components/ui/button";
import { PadelBallMark } from "@/components/padel-ball-mark";
import { FullScreenGameLoader } from "@/components/design";

export function BecomeCoachForm() {
  const [state, formAction, isPending] = useActionState(becomeCoach, null);

  useEffect(() => {
    if (state && !state.ok) toast.error(state.error);
  }, [state]);

  return (
    <>
      {isPending && <FullScreenGameLoader label="Prepariamo la tua area coach" />}
      <form action={formAction}>
        <Button
          type="submit"
          disabled={isPending}
          className="game-cta min-h-11 rounded-none border-game-ball bg-game-ball px-5 font-heading font-bold text-game-ink uppercase hover:bg-game-white"
        >
          <PadelBallMark className="size-5" />
          Diventa coach
        </Button>
      </form>
    </>
  );
}
