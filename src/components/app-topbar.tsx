import Image from "next/image";
import Link from "next/link";
import { Bell, User } from "@/components/icons/paideio-icons";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/session";
import { getUnreadNotificationCount } from "@/lib/queries";
import { ThemeToggle } from "@/components/theme-toggle";

export async function AppTopbar() {
  const user = await getCurrentUser();
  const unreadCount = user ? await getUnreadNotificationCount(user.id) : 0;

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-game-cyan/20 bg-game-ink/95 px-4 backdrop-blur-md md:px-8 md:pl-28">
      <Link
        href="/"
        className="flex h-14 items-center md:hidden"
        aria-label="Paideio - Home"
      >
        <Image
          src="/brand/paideio-wordmark-2026.png"
          alt="Paideio"
          width={120}
          height={48}
          priority
          className="h-12 w-auto object-contain"
        />
      </Link>
      {/* `ml-auto`: su desktop il logo qui sopra è nascosto e senza questo le
          azioni scivolerebbero a sinistra. */}
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        {user && (
          <Link
            href="/notifiche"
            className="relative flex size-11 items-center justify-center text-game-white/65 transition-colors hover:text-game-cyan focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-game-cyan"
            aria-label={unreadCount > 0 ? `Notifiche: ${unreadCount} non lette` : "Notifiche"}
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1 flex min-w-4 items-center justify-center bg-game-ball px-1 font-heading text-[9px] font-bold text-game-ink">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        )}
        {user ? (
          <UserButton />
        ) : (
          <SignInButton mode="modal">
            <button className="flex size-11 items-center justify-center text-game-white/65 hover:text-game-cyan" aria-label="Accedi">
              <User className="size-5" />
            </button>
          </SignInButton>
        )}
      </div>
    </header>
  );
}
