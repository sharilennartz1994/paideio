"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarDays, Heart, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: typeof Home };

export function SidebarNav({ role }: { role: "player" | "coach" | null }) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/cerca", label: "Cerca", icon: Search },
  ];
  if (role === "player") {
    items.push({ href: "/prenotazioni", label: "Prenotazioni", icon: CalendarDays });
    items.push({ href: "/preferiti", label: "Preferiti", icon: Heart });
  }
  if (role === "coach") {
    items.push({ href: "/coach-admin", label: "Area coach", icon: LayoutDashboard });
  }

  return (
    <nav className="flex flex-1 flex-col gap-2">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "mr-4 ml-0 flex items-center gap-4 py-3 px-6 whitespace-nowrap transition-all",
              active
                ? "rounded-r-full bg-secondary-container font-bold text-on-secondary-container"
                : "text-on-surface-variant hover:bg-surface-bright/50 hover:text-on-surface"
            )}
          >
            <item.icon className="size-5 shrink-0" />
            <span className="font-mono text-label-caps uppercase opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
