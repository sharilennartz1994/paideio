"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { editorialSectionFor, isActivePath } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Nav delle sottosezioni di Academy e Circuito.
 *
 * Due difetti corretti qui:
 * 1. **Nessuno stato attivo.** Su `/academy/tecnica` le sette voci erano
 *    identiche, quindi la nav diceva cosa esiste ma non dove sei.
 * 2. **Scroll orizzontale senza affordance.** Era `overflow-x-auto` con
 *    `min-w-max`: a 375px misurava 553px, quindi Training, Attrezzatura e
 *    Storia restavano fuori schermo senza alcun indizio, esattamente il
 *    difetto già corretto in `coach-admin-nav.tsx` e nel booking calendar.
 *    Ora va a capo.
 *
 * La sezione si deduce dal pathname invece che dalla stringa del kicker: la
 * vecchia inferenza (`kicker.startsWith("Academy")`) mostrava la nav del
 * Circuito su qualunque pagina con un kicker diverso.
 */
export function EditorialSectionNav() {
  const pathname = usePathname();
  const section = editorialSectionFor(pathname);
  if (!section) return null;

  const links = [{ href: section.root, label: section.navLabel }, ...section.children];

  return (
    <nav aria-label={`Sezioni ${section.label}`} className="border-t border-game-cyan/16">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-x-1 px-5 md:px-8">
        {links.map((link) => {
          // La panoramica è attiva solo sulla rotta esatta, altrimenti sarebbe
          // sempre accesa insieme alla sottosezione corrente.
          const active = link.href === section.root ? pathname === section.root : isActivePath(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center border-b-2 px-3 font-heading text-xs font-semibold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-game-cyan",
                active
                  ? "border-game-ball text-game-ball"
                  : "border-transparent text-game-white/72 hover:border-game-cyan hover:text-game-white"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
