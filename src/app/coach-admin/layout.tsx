import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getPendingRequestCount } from "@/lib/queries";
import { CoachAdminNav } from "@/components/coach-admin-nav";
import { GameAsset } from "@/components/design";

export default async function CoachAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "coach") redirect("/diventa-coach");

  const pendingCount = await getPendingRequestCount(user.id);

  return (
    <div>
      <div className="hex-tex relative overflow-hidden bg-court text-court-foreground">
        <GameAsset name="crossedRackets" decorative sizes="220px" className="pointer-events-none absolute -right-4 -bottom-20 hidden max-h-64 w-auto opacity-45 md:block" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-6">
          <p className="ui-kicker">Coach control room</p>
          <h1 className="mt-2 font-heading text-headline-lg-mobile md:text-headline-lg">
            Area coach
          </h1>
          <p className="mt-1 font-sans text-body-md text-court-foreground/70">
            Gestisci il tuo profilo, i campi e gli orari di allenamento.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <CoachAdminNav pendingCount={pendingCount} />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
