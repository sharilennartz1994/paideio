"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, CircleUserRound, LayoutDashboard, MapPinned, MessagesSquare } from "@/components/icons/paideio-icons";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/coach-admin", label: "Panoramica", icon: LayoutDashboard },
  { href: "/coach-admin/profilo", label: "Profilo", icon: CircleUserRound },
  { href: "/coach-admin/campi", label: "Campi", icon: MapPinned },
  { href: "/coach-admin/orari", label: "Orari", icon: CalendarClock },
  { href: "/coach-admin/richieste", label: "Richieste", icon: MessagesSquare },
];

export function CoachAdminNav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();

  return (
    // Su mobile una riga scorrevole nascondeva "Orari" e "Richieste" fuori
    // schermo (519px di tab in ~342px disponibili, senza scrollbar visibile su
    // iOS): le ultime due schede erano di fatto irraggiungibili. Griglia a 5
    // colonne con icona sopra l'etichetta, così tutte restano visibili.
    <nav
      className="grid grid-cols-5 border-b border-nebbia/25 md:flex md:gap-1"
      aria-label="Configurazione coach"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        const showBadge = tab.href === "/coach-admin/richieste" && pendingCount > 0;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-h-14 shrink-0 flex-col items-center justify-center gap-1 border-b-2 px-0.5 py-2 text-center text-[10px] font-semibold leading-tight hyphens-auto transition-colors",
              "md:min-h-12 md:flex-row md:gap-2 md:px-3 md:text-sm md:hyphens-none",
              isActive
                ? "border-ball text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="relative">
              <Icon className="size-5 md:size-4" aria-hidden />
              {showBadge && (
                <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ball px-1 text-[10px] font-bold tabular-nums text-ball-foreground md:hidden">
                  {pendingCount}
                </span>
              )}
            </span>
            {tab.label}
            {showBadge && (
              <span className="hidden h-4 min-w-4 items-center justify-center rounded-full bg-ball px-1 text-[10px] font-bold tabular-nums text-ball-foreground md:flex">
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
