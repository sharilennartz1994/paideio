"use client";

import { useEffect } from "react";

export function BookingHashScroll() {
  useEffect(() => {
    if (window.location.hash !== "#prenota") return;

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById("prenota")?.scrollIntoView({ block: "start" });
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return null;
}
