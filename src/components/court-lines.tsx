export function CourtLines({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      {/* perimetro campo */}
      <rect x="20" y="20" width="360" height="260" stroke="currentColor" strokeWidth="2" />
      {/* rete centrale */}
      <line x1="20" y1="150" x2="380" y2="150" stroke="currentColor" strokeWidth="2.5" />
      {/* linee di servizio */}
      <line x1="20" y1="82" x2="380" y2="82" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="218" x2="380" y2="218" stroke="currentColor" strokeWidth="1.5" />
      {/* linea centrale di servizio, superiore e inferiore */}
      <line x1="200" y1="20" x2="200" y2="82" stroke="currentColor" strokeWidth="1.5" />
      <line x1="200" y1="218" x2="200" y2="280" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
