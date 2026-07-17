import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { Trophy } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { becomeCoach } from "@/lib/actions/account";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function DiventaCoachPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Card className="border-t-2 border-t-ball">
        <CardHeader>
          <div className="flex size-11 items-center justify-center bg-ball text-ball-foreground">
            <Trophy className="size-5" />
          </div>
          <CardTitle className="mt-3 font-heading text-xl">Diventa coach su Paideio</CardTitle>
          <CardDescription>
            Apri la tua area riservata per impostare i campi in cui alleni, i tuoi orari, il tipo di
            allenamento che offri e i livelli che segui.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user?.role === "coach" ? (
            <Button
              nativeButton={false}
              render={<Link href="/coach-admin" />}
              className="cut-cta bg-ball font-mono text-xs font-bold tracking-wider text-ball-foreground uppercase hover:bg-ball/90"
            >
              Vai alla tua area coach
            </Button>
          ) : user ? (
            <form action={becomeCoach}>
              <Button
                type="submit"
                className="cut-cta bg-ball font-mono text-xs font-bold tracking-wider text-ball-foreground uppercase hover:bg-ball/90"
              >
                Diventa coach
              </Button>
            </form>
          ) : (
            <SignInButton mode="modal">
              <Button className="cut-cta bg-ball font-mono text-xs font-bold tracking-wider text-ball-foreground uppercase hover:bg-ball/90">
                Accedi per iniziare
              </Button>
            </SignInButton>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
