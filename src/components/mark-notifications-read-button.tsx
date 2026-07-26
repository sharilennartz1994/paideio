"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { FullScreenGameLoader, GameCta } from "@/components/design";

export function MarkNotificationsReadButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (result.ok) toast.success("Notifiche segnate come lette.");
      else toast.error(result.error);
    });
  }

  return (
    <>
      {isPending && <FullScreenGameLoader label="Aggiorniamo le notifiche" />}
      <GameCta tone="quiet" size="compact" onClick={handleClick} disabled={isPending}>
        Segna tutte come lette
      </GameCta>
    </>
  );
}
