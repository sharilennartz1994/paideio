import Link from "next/link";
import { GameAsset } from "@/components/design";

const FOOTER_LINKS = [
  { href: "/cerca", label: "Trova un coach" },
  { href: "/diventa-coach", label: "Diventa coach" },
  { href: "/chi-siamo", label: "Il concept" },
  { href: "/prossime-release", label: "Prossime release" },
] as const;

const LEGAL_LINKS = [
  { href: "/termini", label: "Termini di servizio" },
  { href: "/privacy", label: "Privacy" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    // Ultimo elemento del flusso: è il footer, non `main`, a dover liberare lo
    // spazio della bottom nav fissa (5rem + safe area) su mobile.
    <footer className="net-texture relative w-full overflow-hidden border-t border-game-cyan/25 pt-12 pb-[calc(8rem+env(safe-area-inset-bottom))] md:pl-20 md:pb-12">
      <GameAsset name="net" decorative sizes="360px" className="pointer-events-none absolute -right-16 bottom-0 hidden max-h-44 w-auto opacity-25 lg:block" />
      <div className="relative flex flex-col items-center justify-between gap-8 px-4 md:flex-row md:px-16">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <div className="font-heading text-xl font-extrabold tracking-[-0.03em] text-game-white uppercase">
            Paideio
          </div>
          <p className="font-sans text-sm text-game-white/65">
            © {year} Paideio. Dal greco antico παιδεία, la formazione della persona attraverso lo sport.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 md:items-end">
          <nav aria-label="Link nel piè di pagina" className="flex flex-wrap justify-center gap-2">
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex min-h-11 items-center px-3 text-sm text-game-white/65 transition-colors hover:text-game-cyan"
              >
                {label}
              </Link>
            ))}
          </nav>
          {/* Documenti legali: separati e più quieti, ma sempre raggiungibili da
              ogni pagina — è il posto in cui vengono cercati. */}
          <nav
            aria-label="Documenti legali"
            className="flex flex-wrap justify-center gap-2 md:justify-end"
          >
            {LEGAL_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex min-h-11 items-center px-3 text-xs text-game-white/50 underline decoration-game-white/20 underline-offset-4 transition-colors hover:text-game-cyan hover:decoration-game-cyan"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
