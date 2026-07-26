import Link from "next/link";
import { Trophy } from "@/components/icons/paideio-icons";
import { SidebarNav } from "@/components/sidebar-nav";
import { getCurrentUser } from "@/lib/session";
import { PadelBallMark } from "@/components/padel-ball-mark";

export async function AppSidebar() {
  const user = await getCurrentUser();

  return (
    <aside className="fixed top-0 left-0 z-[60] hidden h-full w-20 flex-col overflow-visible border-r border-game-cyan/25 bg-game-ink py-5 md:flex">
      <Link href="/" className="mb-8 flex h-14 items-center justify-center" aria-label="Paideio — Home">
        <span className="font-heading text-3xl font-bold text-game-blue" aria-hidden>P</span>
      </Link>
      <SidebarNav role={user?.role ?? null} />
      <div className="mt-auto flex justify-center px-3">
        <Link
          href={user?.role === "coach" ? "/coach-admin" : "/diventa-coach"}
          aria-label={user?.role === "coach" ? "Apri area coach" : "Diventa coach"}
          className="group/coach relative flex size-12 items-center justify-center border border-game-ball bg-game-ball text-game-ink transition-transform hover:-translate-y-0.5"
        >
          <Trophy className="size-4 shrink-0" />
          <PadelBallMark className="absolute -right-1 -bottom-1 size-4" />
          <span className="pointer-events-none absolute bottom-1 left-[calc(100%+12px)] hidden border border-game-cyan/30 bg-game-ink px-3 py-2 text-xs font-semibold whitespace-nowrap text-game-white group-hover/coach:block group-focus-visible/coach:block">
            {user?.role === "coach" ? "Area coach" : "Diventa Coach"}
          </span>
        </Link>
      </div>
    </aside>
  );
}
