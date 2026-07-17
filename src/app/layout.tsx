import { ClerkProvider } from "@clerk/nextjs";
import { itIT } from "@clerk/localizations";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Anybody, Hanken_Grotesk, Space_Mono } from "next/font/google";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { AppBottomNav } from "@/components/app-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const anybody = Anybody({
  variable: "--font-anybody",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Paideio — Trova il tuo coach di padel",
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
      className={`dark ${hankenGrotesk.variable} ${spaceMono.variable} ${anybody.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background">
        <ClerkProvider appearance={{ theme: shadcn }} localization={itIT}>
          <AppTopbar />
          <AppSidebar />
          <main className="min-h-screen pt-16 pb-24 md:pb-0 md:pl-20">{children}</main>
          <SiteFooter />
          <AppBottomNav />
          <Toaster position="top-center" />
        </ClerkProvider>
      </body>
    </html>
  );
}
