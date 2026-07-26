"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function GameRouteStage({ children }: { children: React.ReactNode }) {
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

  return (
    <div key={`${pathname}?${search}`} className="game-route-stage">
      {children}
    </div>
  );
}
