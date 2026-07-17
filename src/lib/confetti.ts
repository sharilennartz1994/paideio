"use client";

import confetti from "canvas-confetti";

const PADEL_COLORS = ["#CBEA3D", "#3B5BFF", "#ffffff"];

export function celebrate() {
  confetti({
    particleCount: 80,
    spread: 75,
    startVelocity: 32,
    origin: { y: 0.7 },
    colors: PADEL_COLORS,
  });
  confetti({
    particleCount: 30,
    angle: 60,
    spread: 60,
    origin: { x: 0, y: 0.75 },
    colors: PADEL_COLORS,
  });
  confetti({
    particleCount: 30,
    angle: 120,
    spread: 60,
    origin: { x: 1, y: 0.75 },
    colors: PADEL_COLORS,
  });
}
