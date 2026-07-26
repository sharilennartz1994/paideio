import Link from "next/link";
import { GameAsset } from "@/components/design";

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
        <nav aria-label="Link nel piè di pagina" className="flex flex-wrap justify-center gap-2">
          <Link href="/cerca" className="flex min-h-11 items-center px-3 text-sm text-game-white/65 transition-colors hover:text-game-cyan">
            Trova un coach
          </Link>
          <Link href="/diventa-coach" className="flex min-h-11 items-center px-3 text-sm text-game-white/65 transition-colors hover:text-game-cyan">
            Diventa coach
          </Link>
          <Link href="/chi-siamo" className="flex min-h-11 items-center px-3 text-sm text-game-white/65 transition-colors hover:text-game-cyan">
            Il concept
          </Link>
          <Link href="/prossime-release" className="flex min-h-11 items-center px-3 text-sm text-game-white/65 transition-colors hover:text-game-cyan">
            Prossime release
          </Link>
        </nav>
      </div>
    </footer>
  );
}
