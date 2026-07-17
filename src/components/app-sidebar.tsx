import Link from "next/link";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/sidebar-nav";
import { PadelBallMark } from "@/components/padel-ball-mark";
import { getCurrentUser } from "@/lib/session";

export async function AppSidebar() {
  const user = await getCurrentUser();

  return (
    <aside className="group fixed top-0 left-0 z-[60] hidden h-full w-20 flex-col overflow-hidden border-r border-outline-variant/20 bg-surface-container-highest py-8 shadow-2xl transition-[width] duration-300 md:flex md:hover:w-64">
      <Link href="/" className="mb-12 flex items-center gap-2 px-6 whitespace-nowrap">
        <PadelBallMark className="size-6 shrink-0" />
        <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="font-heading text-headline-md tracking-tighter text-primary uppercase italic">Paideio</div>
          <p className="mt-1 font-mono text-[10px] text-on-surface-variant">Pronti al Gioco</p>
        </div>
      </Link>
      <SidebarNav role={user?.role ?? null} />
      <div className="mt-auto px-6">
        <Button
          nativeButton={false}
          render={<Link href={user?.role === "coach" ? "/coach-admin" : "/diventa-coach"} />}
          className="neon-glow-primary flex w-full items-center gap-3 rounded-lg bg-primary-container py-4 font-mono text-label-caps whitespace-nowrap text-on-primary-container uppercase hover:bg-primary-container/90"
        >
          <Trophy className="size-4 shrink-0" />
          <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {user?.role === "coach" ? "Area coach" : "Diventa Coach"}
          </span>
        </Button>
      </div>
    </aside>
  );
}
