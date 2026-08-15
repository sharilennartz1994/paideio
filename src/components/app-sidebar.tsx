import Link from "next/link";
import { SidebarNav } from "@/components/sidebar-nav";
import { getCurrentUser } from "@/lib/session";

export async function AppSidebar() {
  const user = await getCurrentUser();

  return (
    <aside className="fixed top-0 left-0 z-[60] hidden h-full w-20 flex-col overflow-visible border-r border-game-cyan/25 bg-game-ink py-4 md:flex">
      <Link href="/" className="mb-5 flex h-12 items-center justify-center" aria-label="Paideio - Home">
        <span className="font-heading text-3xl font-bold text-game-blue" aria-hidden>P</span>
      </Link>
      <SidebarNav role={user?.role ?? null} />
    </aside>
  );
}
