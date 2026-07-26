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
    <nav className="flex gap-1 overflow-x-auto border-b border-nebbia/25" aria-label="Configurazione coach">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold transition-colors",
            pathname === tab.href
              ? "border-ball text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="size-4" aria-hidden />
          {tab.label}
          {tab.href === "/coach-admin/richieste" && pendingCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-ball px-1 text-[10px] font-bold tabular-nums text-ball-foreground">
              {pendingCount}
            </span>
          )}
        </Link>
      )})}
    </nav>
  );
}
