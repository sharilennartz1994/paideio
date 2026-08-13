"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PadelBallMark } from "@/components/padel-ball-mark";
import { coachCallToAction, isActivePath, primaryNavGroups, type Role } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Rail desktop. Le etichette sono **sempre visibili**, non più tooltip in
 * hover: prima la rail mostrava sei glifi muti e chi arrivava per la prima
 * volta non poteva sapere che esistessero Academy o Circuito senza passarci
 * sopra il mouse (e su un tablet da 768px in su, dove la rail compare ma
 * l'hover no, non poteva scoprirlo affatto).
 *
 * La rail resta larga 80px: `layout.tsx` (`md:pl-20`) e `site-footer.tsx`
 * (`md:pl-20`) sono allineati a quella misura, quindi allargarla scollerebbe il
 * footer dal contenuto. Icona sopra etichetta a 10px è la stessa soluzione già
 * adottata da `coach-admin-nav.tsx` e dalla bottom nav per lo stesso problema.
 *
 * I titoli di gruppo ("Gioca", "Impara") sono la parte che spiega la struttura
 * del prodotto: senza, sei voci in colonna restano un elenco piatto.
 */
export function SidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const groups = primaryNavGroups(role);
  const coach = coachCallToAction(role);
  const CoachIcon = coach.icon;
  const coachActive = isActivePath(pathname, coach.href);

  return (
    <>
      <nav
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1.5 pb-2"
        aria-label="Navigazione principale"
      >
        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="px-1 pb-1.5 text-center font-heading text-[9px] font-bold tracking-[0.14em] text-game-cyan uppercase">
              {group.title}
            </h2>
            <ul className="flex flex-col gap-0.5">
              {group.entries.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-[3.25rem] flex-col items-center justify-center gap-1 border-r-2 px-0.5 py-2 text-center font-heading text-[10px] leading-tight font-bold tracking-[0.04em] uppercase transition-[background-color,color,border-color] duration-150",
                        "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-game-cyan",
                        active
                          ? "border-game-ball bg-game-blue/22 text-game-ball"
                          : "border-transparent text-game-white/80 hover:bg-game-blue/16 hover:text-game-cyan"
                      )}
                    >
                      <item.icon className="size-5 shrink-0" aria-hidden />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* CTA in fondo: unica porta desktop verso l'area coach. Anche qui
          l'etichetta è visibile, non un tooltip: era un quadrato giallo muto. */}
      <div className="mt-auto border-t border-game-cyan/20 px-1.5 pt-3">
        <Link
          href={coach.href}
          aria-current={coachActive ? "page" : undefined}
          className="relative flex min-h-[3.5rem] flex-col items-center justify-center gap-1 border border-game-ball bg-game-ball px-0.5 py-2 text-center font-heading text-[10px] leading-tight font-bold tracking-[0.04em] text-game-ink uppercase transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-game-cyan"
        >
          <CoachIcon className="size-4 shrink-0" aria-hidden />
          <span>{coach.label}</span>
          <PadelBallMark className="absolute -right-1 -bottom-1 size-4" />
        </Link>
      </div>
    </>
  );
}
