import { Sparkles, Medal, Award, Trophy, Heart, Flame, type LucideIcon } from "lucide-react";
import type { Achievement } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  "prima-lezione": Sparkles,
  "cinque-lezioni": Medal,
  "dieci-lezioni": Award,
  "venticinque-lezioni": Trophy,
  fedelissimo: Heart,
  streak: Flame,
};

export function AchievementsPanel({ achievements }: { achievements: Achievement[] }) {
  const earnedCount = achievements.filter((a) => a.earned).length;
  if (earnedCount === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
          I tuoi traguardi{" "}
          <span className="text-ball">
            {earnedCount}/{achievements.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-5">
          {achievements.map((a) => {
            const Icon = ICONS[a.id] ?? Sparkles;
            return (
              <div key={a.id} className="flex w-20 flex-col items-center gap-2 text-center" title={a.description}>
                <div
                  className={cn(
                    "flex size-14 items-center justify-center transition-transform",
                    a.earned
                      ? "animate-pop-in bg-ball text-ball-foreground"
                      : "bg-muted text-muted-foreground/40"
                  )}
                  style={{ clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)" }}
                >
                  <Icon className="size-6" />
                </div>
                <p className={cn("text-xs font-medium", !a.earned && "text-muted-foreground")}>{a.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
