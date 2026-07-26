import Image from "next/image";

const PALETTE = [
  "bg-gradient-to-br from-primary-container to-surface-container-lowest",
  "bg-gradient-to-br from-[oklch(0.5_0.02_258)] to-surface-container-lowest",
  "bg-gradient-to-br from-tertiary-container to-surface-container-lowest",
  "bg-gradient-to-br from-secondary-fixed-dim to-surface-container-lowest",
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function CoachAvatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const sizeClass = className ?? "size-11 text-base";

  if (src) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-full ${sizeClass}`}>
        <Image src={src} alt={name} fill sizes="96px" className="object-cover" />
      </div>
    );
  }

  const color = PALETTE[hashString(name) % PALETTE.length];
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-heading font-black text-white uppercase ${color} ${sizeClass}`}
    >
      {initials(name)}
    </div>
  );
}
