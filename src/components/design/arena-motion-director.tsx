"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ArenaMotionDirector() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    root.dataset.motionReady = "true";

    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-game-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.gameVisible = "true";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -9% 0px", threshold: 0.12 }
    );

    revealTargets.forEach((target, index) => {
      target.style.setProperty("--game-reveal-delay", `${Math.min(index % 3, 2) * 55}ms`);
      observer.observe(target);
    });

    const tiltTargets = finePointer && !reduceMotion
      ? Array.from(document.querySelectorAll<HTMLElement>("[data-game-tilt]"))
      : [];

    const cleanups = tiltTargets.map((target) => {
      const onMove = (event: PointerEvent) => {
        const bounds = target.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        target.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translate3d(${(x * 6).toFixed(1)}px, ${(-y * 5).toFixed(1)}px, 0)`;
      };
      const onLeave = () => {
        target.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)";
      };

      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerleave", onLeave);
      return () => {
        target.style.removeProperty("transform");
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerleave", onLeave);
      };
    });

    const onImpact = (event: PointerEvent) => {
      if (reduceMotion || !(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>(".game-cta");
      if (!target || target.matches(":disabled")) return;
      const bounds = target.getBoundingClientRect();
      const impact = document.createElement("span");
      impact.className = "game-impact";
      impact.style.left = `${event.clientX - bounds.left}px`;
      impact.style.top = `${event.clientY - bounds.top}px`;
      impact.setAttribute("aria-hidden", "true");
      target.append(impact);
      impact.addEventListener("animationend", () => impact.remove(), { once: true });
    };

    document.addEventListener("pointerdown", onImpact);

    return () => {
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      document.removeEventListener("pointerdown", onImpact);
      delete root.dataset.motionReady;
    };
  }, [pathname]);

  return (
    <div className="arena-scroll-rally" aria-hidden="true">
      <span />
    </div>
  );
}
