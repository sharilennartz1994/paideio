import Link from "next/link";
import { Home, Search, CalendarDays, LayoutDashboard, User } from "@/components/icons/paideio-icons";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/session";

const linkClass = "flex min-h-11 min-w-14 flex-col items-center justify-center gap-0.5 font-heading text-[10px] font-bold tracking-[0.06em] text-game-white/65 uppercase transition-colors hover:text-game-ball";

export async function AppBottomNav() {
  const user = await getCurrentUser();
  const thirdItem =
    user?.role === "coach"
      ? { href: "/coach-admin", label: "Coach", icon: LayoutDashboard }
      : { href: "/prenotazioni", label: "Lezioni", icon: CalendarDays };

  return (
    <nav aria-label="Navigazione mobile" className="fixed bottom-0 left-0 z-50 flex h-[calc(5rem+env(safe-area-inset-bottom))] w-full items-start justify-around border-t border-game-cyan/25 bg-game-ink/96 px-4 pt-3 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <Link href="/" className={linkClass}>
        <Home className="size-5" aria-hidden />
        <span className="text-xs">Home</span>
      </Link>
      <Link href="/cerca" className={linkClass}>
        <Search className="size-5" aria-hidden />
        <span className="text-xs">Cerca</span>
      </Link>
      {user && (
        <Link href={thirdItem.href} className={linkClass}>
          <thirdItem.icon className="size-5" aria-hidden />
          <span className="text-xs">{thirdItem.label}</span>
        </Link>
      )}
      {user ? (
        <div className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-vetro/50 bg-carta-alta">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8 rounded-full ring-0",
                userButtonTrigger: "focus-visible:outline-2 focus-visible:outline-vetro focus-visible:outline-offset-2",
              },
            }}
          />
        </div>
      ) : (
        <SignInButton mode="modal">
          <button className={linkClass}>
            <User className="size-5" aria-hidden />
            <span className="text-xs">Profilo</span>
          </button>
        </SignInButton>
      )}
    </nav>
  );
}
