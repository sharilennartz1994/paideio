import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, MapPin, Search, User, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getFavoriteCoaches, parseJsonArray, levelBadgeClass } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CoachAvatar } from "@/components/coach-avatar";
import { StarRatingDisplay } from "@/components/star-rating";
import { FavoriteButton } from "@/components/favorite-button";

export default async function PreferitiPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "player") redirect("/");

  const favorites = await getFavoriteCoaches(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="font-mono text-xs tracking-[0.14em] text-primary uppercase">Salvati</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">I miei preferiti</h1>
      <p className="mt-1.5 text-muted-foreground">I coach che hai salvato per dopo.</p>

      <div className="mt-8 grid gap-4">
        {favorites.length === 0 && (
          <Card className="items-center py-12 text-center">
            <CardContent className="flex flex-col items-center gap-3">
              <div className="flex size-12 items-center justify-center bg-primary/10 text-primary">
                <Heart className="size-6" />
              </div>
              <p className="text-muted-foreground">Non hai ancora salvato nessun coach.</p>
              <Button
                nativeButton={false}
                render={<Link href="/cerca" />}
                className="cut-cta bg-ball font-mono text-xs font-bold tracking-wider text-ball-foreground uppercase hover:bg-ball/90"
              >
                <Search /> Trova un coach
              </Button>
            </CardContent>
          </Card>
        )}
        {favorites.map(({ coach, profile, locations, rating }) => (
          <Card key={coach.id} className="group overflow-hidden py-5 transition-colors hover:border-primary">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <CoachAvatar name={coach.name} src={profile.avatarUrl} />
                  <div>
                    <CardTitle className="text-lg">{coach.name}</CardTitle>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {locations.map((l) => l.city).join(", ")}
                    </p>
                    <div className="mt-1">
                      <StarRatingDisplay rating={rating.average} count={rating.count} />
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {profile.pricePerLesson != null && (
                    <Badge variant="secondary" className="rounded-full font-mono font-semibold">
                      €{profile.pricePerLesson}/lezione
                    </Badge>
                  )}
                  <FavoriteButton coachId={coach.id} initialFavorite isPlayer />
                </div>
              </div>
              <CardDescription className="pt-1">{profile.bio}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {parseJsonArray(profile.trainingTypes).map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1 rounded-full font-mono text-[11px] uppercase">
                    {t === "singolo" ? <User className="size-3" /> : <Users className="size-3" />}
                    {t === "singolo" ? "Singolo" : "Gruppo"}
                  </Badge>
                ))}
                {parseJsonArray(profile.levels).map((l) => (
                  <Badge key={l} className={`${levelBadgeClass(l)} rounded-full border-transparent font-mono text-[11px] capitalize`}>
                    {l}
                  </Badge>
                ))}
              </div>
              <Button
                size="sm"
                className="w-fit font-mono text-xs tracking-wide uppercase"
                nativeButton={false}
                render={<Link href={`/coach/${coach.id}`} />}
              >
                Vedi profilo e calendario
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
