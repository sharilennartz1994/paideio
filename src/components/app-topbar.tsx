import Link from "next/link";
import { Bell, User } from "lucide-react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/session";

export async function AppTopbar() {
  const user = await getCurrentUser();

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant/30 bg-surface/70 px-4 shadow-[0_0_20px_rgba(182,196,255,0.1)] backdrop-blur-xl md:px-16">
      <Link
        href="/"
        className="font-heading text-headline-md tracking-tighter text-primary uppercase italic md:hidden"
      >
        Paideio
      </Link>
      <div className="hidden md:block" />
      <div className="flex items-center gap-4">
        <Bell className="size-5 text-primary transition-transform active:scale-95" />
        {user ? (
          <UserButton />
        ) : (
          <SignInButton mode="modal">
            <button className="text-primary transition-transform active:scale-95" aria-label="Accedi">
              <User className="size-5" />
            </button>
          </SignInButton>
        )}
      </div>
    </header>
  );
}
