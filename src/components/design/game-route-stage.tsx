"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Riporta in cima a ogni navigazione, preservando gli hash.
 *
 * Sta in un componente a parte, e non dentro `GameRouteStage`, perché
 * `useSearchParams()` sospende in prerendering: il Suspense boundary che lo
 * contiene deve avere un fallback banale. Quando l'hook stava nello stage, il
 * boundary era in `layout.tsx` con `fallback={children}` e la pagina finiva
 * renderizzata due volte (id duplicati nel DOM e controlli doppi).
 */
function RouteScrollReset() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    const hash = window.location.hash;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (hash) {
          const target = document.getElementById(decodeURIComponent(hash.slice(1)));
          if (target) {
            target.scrollIntoView({ block: "start" });
            return;
          }
        }
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [pathname, search]);

  return null;
}

export function GameRouteStage({ children }: { children: React.ReactNode }) {
  // `usePathname` non sospende, quindi lo stage può restare fuori dal Suspense
  // e rendere i figli una volta sola.
  const pathname = usePathname();

  return (
    <div key={pathname} className="game-route-stage">
      <Suspense fallback={null}>
        <RouteScrollReset />
      </Suspense>
      {children}
    </div>
  );
}
