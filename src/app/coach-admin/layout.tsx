import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getPendingRequestCount } from "@/lib/queries";
import { CoachAdminNav } from "@/components/coach-admin-nav";
import { CourtLines } from "@/components/court-lines";

export default async function CoachAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "coach") redirect("/diventa-coach");

  const pendingCount = await getPendingRequestCount(user.id);

  return (
    <div>
      <div className="hex-tex relative overflow-hidden bg-court text-court-foreground">
        <CourtLines className="pointer-events-none absolute -bottom-14 -right-10 h-[80%] w-[45%] text-primary/20" />
        <div className="relative mx-auto max-w-3xl px-4 py-10">
          <p className="font-mono text-xs tracking-[0.14em] text-ball uppercase">Area riservata</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">Area coach</h1>
          <p className="mt-1 text-court-foreground/70">
            Gestisci il tuo profilo, i campi e gli orari di allenamento.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <CoachAdminNav pendingCount={pendingCount} />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
