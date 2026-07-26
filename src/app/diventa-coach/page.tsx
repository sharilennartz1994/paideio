import { SignInButton } from "@clerk/nextjs";
import { Trophy } from "@/components/icons/paideio-icons";
import { getCurrentUser } from "@/lib/session";
import { BecomeCoachForm } from "@/components/become-coach-form";
import { GameAsset, GameCta, GamePanel } from "@/components/design";

export default async function DiventaCoachPage() {
  const user = await getCurrentUser();

  return (
    <div className="hex-texture min-h-[75vh] px-4 py-12 md:px-10 lg:px-16">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
      <GamePanel tone="cyan" className="p-7 md:p-10">
        <div className="flex size-11 items-center justify-center bg-game-ball text-game-ink">
          <Trophy className="size-5" />
        </div>
        <p className="ui-kicker mt-6">Coach mode</p>
        <h1 className="mt-3 font-heading text-headline-lg-mobile text-calce md:text-headline-lg">
          Entra nell’arena come coach
        </h1>
        <p className="mt-2 font-sans text-body-md text-on-surface-variant">
          Apri la tua area riservata per impostare i campi in cui alleni, i tuoi orari, il tipo di
          allenamento che offri e i livelli che segui.
        </p>
        <div className="mt-6">
          {user?.role === "coach" ? (
            <GameCta href="/coach-admin" tone="ball" showBall arrow>
              Vai alla tua area coach
            </GameCta>
          ) : user ? (
            <BecomeCoachForm />
          ) : (
            <SignInButton mode="modal">
              <GameCta tone="ball" showBall arrow>
                Accedi per iniziare
              </GameCta>
            </SignInButton>
          )}
        </div>
      </GamePanel>
      <div className="game-asset-stage flex min-h-[380px] items-end justify-center">
        <GameAsset name="playerSmash" decorative sizes="(max-width: 768px) 72vw, 420px" className="max-h-[520px] w-auto" />
      </div>
      </div>
    </div>
  );
}
