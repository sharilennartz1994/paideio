import { ClerkProvider } from "@clerk/nextjs";
import { itIT } from "@clerk/localizations";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Hanken_Grotesk, Oxanium } from "next/font/google";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { AppBottomNav } from "@/components/app-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { ArenaMotionDirector, GameRouteStage } from "@/components/design";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paideio - Trova il tuo coach di padel",
  description: "Trova allenatori di padel nella tua zona e prenota lezioni singole o di gruppo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      data-theme="light"
      suppressHydrationWarning
      className={`${hankenGrotesk.variable} ${oxanium.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("paideio-theme");var d=t==="dark";document.documentElement.classList.toggle("dark",d);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full bg-background">
        <ClerkProvider appearance={{ theme: shadcn }} localization={itIT}>
          <a
            href="#contenuto-principale"
            className="fixed top-2 left-2 z-[100] -translate-y-20 border border-game-ink bg-game-ball px-4 py-3 font-heading font-bold text-game-ink transition-transform focus:translate-y-0"
          >
            Vai al contenuto principale
          </a>
          <AppTopbar />
          <AppSidebar />
          <ArenaMotionDirector />
          <main
            id="contenuto-principale"
            tabIndex={-1}
            className="min-h-screen pt-16 md:pl-20"
          >
            <GameRouteStage>{children}</GameRouteStage>
          </main>
          <SiteFooter />
          <AppBottomNav />
          <Toaster position="top-center" />
        </ClerkProvider>
      </body>
    </html>
  );
}
