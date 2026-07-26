"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarDays, Heart, LayoutDashboard, GraduationCap, Trophy } from "@/components/icons/paideio-icons";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: typeof Home };

export function SidebarNav({ role }: { role: "player" | "coach" | null }) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/cerca", label: "Cerca", icon: Search },
    { href: "/academy", label: "Academy", icon: GraduationCap },
    { href: "/circuito", label: "Circuito", icon: Trophy },
  ];
  if (role === "player") {
    items.push({ href: "/prenotazioni", label: "Prenotazioni", icon: CalendarDays });
    items.push({ href: "/preferiti", label: "Preferiti", icon: Heart });
  }
  if (role === "coach") {
    items.push({ href: "/coach-admin", label: "Area coach", icon: LayoutDashboard });
  }

  return (
    <nav className="flex flex-1 flex-col gap-1 px-2" aria-label="Navigazione principale">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
            className={cn(
              "group/nav relative flex min-h-12 items-center justify-center border-r-2 px-3 py-3 font-heading text-xs font-bold tracking-[0.06em] whitespace-nowrap uppercase transition-[background-color,color,border-color] duration-150",
              active
                ? "border-game-ball bg-game-blue/22 text-game-ball"
                : "border-transparent text-game-white/65 hover:bg-game-blue/16 hover:text-game-cyan"
            )}
          >
            <item.icon className="size-5 shrink-0" aria-hidden />
            <span aria-hidden className="pointer-events-none absolute left-[calc(100%+12px)] z-10 hidden border border-game-cyan/30 bg-game-ink px-3 py-2 text-xs text-game-white group-hover/nav:block group-focus-visible/nav:block">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
