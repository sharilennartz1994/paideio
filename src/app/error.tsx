"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PadelBallMark } from "@/components/padel-ball-mark";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <PadelBallMark className="animate-ball-bounce size-14" />
      <div className="mx-auto mt-1 h-2.5 w-9 animate-ball-shadow rounded-full bg-foreground/20 blur-[2px]" />
      <p className="mt-6 font-mono text-xs tracking-widest text-destructive uppercase">Errore</p>
      <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">Siamo finiti in rete!</h1>
      <p className="mt-3 text-muted-foreground">
        Qualcosa è andato storto durante lo scambio. Riprova il colpo: di solito basta.
      </p>
      <Button
        className="cut-cta mt-6 bg-ball font-mono text-xs font-bold tracking-wider text-ball-foreground uppercase hover:bg-ball/90"
        onClick={reset}
      >
        Riprova
      </Button>
    </div>
  );
}
