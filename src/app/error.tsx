"use client";

import { useEffect } from "react";
import { GameAsset, GameCta } from "@/components/design";

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
    <div className="hex-texture mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-24 text-center">
      <GameAsset
        name="net"
        decorative
        sizes="260px"
        className="max-h-40 w-auto"
      />
      <p className="mt-6 font-mono text-label-caps text-destructive uppercase">Errore</p>
      <h1 className="mt-2 font-heading text-headline-lg-mobile text-on-surface">Siamo finiti in rete!</h1>
      <p className="mt-3 font-sans text-on-surface-variant">
        Qualcosa è andato storto durante lo scambio. Riprova il colpo: di solito basta.
      </p>
      <GameCta tone="ball" showBall className="mt-6" onClick={reset}>
        Riprova
      </GameCta>
    </div>
  );
}
