"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  GraduationCap,
  Home,
  LayoutDashboard,
  Rows3,
  Search,
} from "@/components/icons/paideio-icons";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { isActivePath, moreSheetGroups, type NavEntry, type NavGroup, type Role } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const tabClass =
  "flex min-h-11 min-w-14 flex-col items-center justify-center gap-0.5 font-heading text-[10px] font-bold tracking-[0.06em] uppercase transition-colors";

/** La terza scheda cambia con il ruolo: il resto della navigazione vive nello sheet "Altro". */
function primaryTab(role: Role): NavEntry {
  if (role === "coach") return { href: "/coach-admin", label: "Coach", icon: LayoutDashboard };
  if (role === "player") return { href: "/prenotazioni", label: "Lezioni", icon: CalendarDays };
  return { href: "/academy", label: "Academy", icon: GraduationCap };
}

export function MobileNav({ role, unreadCount }: { role: Role; unreadCount: number }) {
  const pathname = usePathname();
  const primary = primaryTab(role);
  const tabs: NavEntry[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/cerca", label: "Cerca", icon: Search },
    primary,
  ];
  // I gruppi arrivano da `lib/navigation.ts`, la stessa sorgente della rail
  // desktop: è così che si tiene la promessa "nessuna rotta raggiungibile da
  // una sola superficie" senza doverla ricontrollare a mano ogni volta.
  const groups = moreSheetGroups(role, unreadCount, primary.href);
  const inSheet = groups.some((group) => group.entries.some((entry) => isActivePath(pathname, entry.href)));

  return (
    <nav
      aria-label="Navigazione mobile"
      className="fixed bottom-0 left-0 z-50 flex h-[calc(5rem+env(safe-area-inset-bottom))] w-full items-start justify-around border-t border-game-cyan/25 bg-game-ink/96 px-4 pt-3 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      {tabs.map((tab) => {
        const active = isActivePath(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(tabClass, active ? "text-game-ball" : "text-game-white/80 hover:text-game-ball")}
          >
            <tab.icon className="size-5" aria-hidden />
            <span className="text-xs">{tab.label}</span>
          </Link>
        );
      })}

      <Sheet>
        <SheetTrigger
          render={
            <button
              type="button"
              className={cn(tabClass, "relative", inSheet ? "text-game-ball" : "text-game-white/80")}
            />
          }
        >
          <Rows3 className="size-5" aria-hidden />
          <span className="text-xs">Altro</span>
          {unreadCount > 0 && (
            <span
              aria-hidden
              className="absolute top-0 right-1 size-2 bg-game-ball"
            />
          )}
        </SheetTrigger>

        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="max-h-[min(86dvh,720px)] overflow-y-auto border-t-2 border-game-cyan/45 bg-game-ink px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-game-white"
        >
          <SheetHeader className="flex-row items-start justify-between gap-4 px-0">
            <div className="flex flex-col gap-0.5">
              <SheetTitle className="font-heading text-2xl font-extrabold tracking-[-0.02em] text-game-white uppercase">
                Naviga
              </SheetTitle>
              <SheetDescription className="text-sm text-game-white/75">
                Tutto il campo Paideio, a portata di pollice.
              </SheetDescription>
            </div>
            <SheetClose
              render={
                <button
                  type="button"
                  className="flex min-h-11 min-w-11 items-center justify-center border border-game-cyan/40 font-heading text-xs font-bold text-game-white/85 uppercase transition-colors hover:border-game-cyan hover:text-game-white"
                />
              }
            >
              Chiudi
            </SheetClose>
          </SheetHeader>

          {groups.map((group) => (
            <SheetGroup key={group.title} group={group} pathname={pathname} />
          ))}
        </SheetContent>
      </Sheet>
    </nav>
  );
}

function SheetGroup({ group, pathname }: { group: NavGroup; pathname: string }) {
  return (
    <section className="border-t border-game-cyan/20 pt-4">
      <h3 className="font-heading text-[11px] font-bold tracking-[0.14em] text-game-cyan uppercase">
        {group.title}
      </h3>
      <ul className="mt-2 grid gap-1">
        {group.entries.map((entry) => {
          const active = isActivePath(pathname, entry.href);
          return (
            <li key={entry.href}>
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    href={entry.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 w-full items-center gap-3 border-l-2 px-3 font-heading text-base font-semibold transition-colors",
                      active
                        ? "border-game-ball bg-game-blue/22 text-game-ball"
                        : "border-transparent text-game-white/85 hover:bg-game-blue/16 hover:text-game-cyan"
                    )}
                  />
                }
              >
                <entry.icon className="size-5 shrink-0" aria-hidden />
                <span>{entry.longLabel ?? entry.label}</span>
                {entry.badge !== undefined && entry.badge > 0 && (
                  <span className="ml-auto flex min-w-5 items-center justify-center bg-game-ball px-1 font-heading text-[10px] font-bold text-game-ink">
                    {entry.badge > 9 ? "9+" : entry.badge}
                  </span>
                )}
              </SheetClose>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
