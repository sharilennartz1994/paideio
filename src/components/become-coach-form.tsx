"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { becomeCoach } from "@/lib/actions/account";
import { Button } from "@/components/ui/button";

export function BecomeCoachForm() {
  const [state, formAction, isPending] = useActionState(becomeCoach, null);

  useEffect(() => {
    if (state && !state.ok) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction}>
      <Button
        type="submit"
        disabled={isPending}
        className="cut-cta bg-ball font-mono text-xs font-bold tracking-wider text-ball-foreground uppercase hover:bg-ball/90"
      >
        {isPending ? "Attendi…" : "Diventa coach"}
      </Button>
    </form>
  );
}
