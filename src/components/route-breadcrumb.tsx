"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "@/components/icons/paideio-icons";
import { buildBreadcrumb } from "@/lib/navigation";

/**
 * Percorso di navigazione, sotto la topbar su ogni pagina che non sia la home.
 *
 * Prima non esisteva nessuna indicazione di posizione: aperta `/academy/regole`
 * da un link o da una ricerca, l'unico indizio era il kicker dell'hero, che è
 * copy editoriale e non un percorso risalibile. L'ultima briciola è anche il
 * titolo della pagina, quindi la barra risponde insieme a "dove sono" e "come
 * torno indietro".
 *
 * Superficie fissa (`--game-ink`, come la topbar) quindi testo fisso: si
 * incolla alla topbar formando un unico blocco di chrome in entrambi i temi.
 */
export function RouteBreadcrumb() {
  const pathname = usePathname();
  const crumbs = buildBreadcrumb(pathname);

  if (crumbs.length < 2) return null;

  return (
    <nav
      aria-label="Percorso di navigazione"
      className="border-b border-game-cyan/20 bg-game-ink px-4 md:px-8"
    >
      <ol className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-1 gap-y-0.5 py-0.5">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 && (
                <ChevronRight className="size-3 shrink-0 text-game-white/45" aria-hidden />
              )}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="flex min-h-11 items-center font-heading text-xs font-semibold tracking-[0.04em] text-game-white/75 uppercase transition-colors hover:text-game-cyan focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-game-cyan"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="flex min-h-11 min-w-0 items-center font-heading text-xs font-bold tracking-[0.04em] text-game-cyan uppercase"
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
