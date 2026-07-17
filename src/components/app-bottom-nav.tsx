import Link from "next/link";
import { Home, Search, CalendarDays, LayoutDashboard, User } from "lucide-react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/session";

const linkClass = "flex flex-col items-center justify-center gap-0.5 text-outline transition-all active:scale-90 hover:text-primary";

export async function AppBottomNav() {
  const user = await getCurrentUser();
  const thirdItem =
    user?.role === "coach"
      ? { href: "/coach-admin", label: "Coach", icon: LayoutDashboard }
      : { href: "/prenotazioni", label: "Lezioni", icon: CalendarDays };

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-around border-t border-primary/20 bg-surface-container/80 px-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.5)] backdrop-blur-lg md:hidden">
      <Link href="/" className={linkClass}>
        <Home className="size-5" />
        <span className="font-mono text-[10px] uppercase">Home</span>
      </Link>
      <Link href="/cerca" className={linkClass}>
        <Search className="size-5" />
        <span className="font-mono text-[10px] uppercase">Cerca</span>
      </Link>
      {user && (
        <Link href={thirdItem.href} className={linkClass}>
          <thirdItem.icon className="size-5" />
          <span className="font-mono text-[10px] uppercase">{thirdItem.label}</span>
        </Link>
      )}
      {user ? (
        <UserButton />
      ) : (
        <SignInButton mode="modal">
          <button className={linkClass}>
            <User className="size-5" />
            <span className="font-mono text-[10px] uppercase">Profilo</span>
          </button>
        </SignInButton>
      )}
    </nav>
  );
}
