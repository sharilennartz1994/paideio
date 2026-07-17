"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/coach-admin", label: "Panoramica" },
  { href: "/coach-admin/profilo", label: "Profilo" },
  { href: "/coach-admin/campi", label: "Campi" },
  { href: "/coach-admin/orari", label: "Orari" },
  { href: "/coach-admin/richieste", label: "Richieste" },
];

export function CoachAdminNav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 font-mono text-xs tracking-wider uppercase transition-colors",
            pathname === tab.href
              ? "border-ball text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
          {tab.href === "/coach-admin/richieste" && pendingCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-ball px-1 text-[10px] font-bold tabular-nums text-ball-foreground">
              {pendingCount}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
