export function PadelBallMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="10" className="fill-ball" />
      <path
        d="M4.5 7.5c2.5 2 3.8 4.3 3.8 7.2 0 1.7-.5 3.2-1.3 4.4M19.5 7.5c-2.5 2-3.8 4.3-3.8 7.2 0 1.7.5 3.2 1.3 4.4"
        stroke="var(--ball-foreground)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
