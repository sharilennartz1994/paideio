import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CourtLines } from "@/components/court-lines";

export default function CoachDetailLoading() {
  return (
    <div>
      <div className="hex-tex relative overflow-hidden bg-court text-court-foreground">
        <CourtLines className="pointer-events-none absolute inset-0 h-full w-full text-court-foreground/[0.08]" />
        <div className="relative mx-auto max-w-4xl px-4 py-10">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full bg-white/10" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-52 bg-white/10" />
              <Skeleton className="h-4 w-32 bg-white/10" />
              <Skeleton className="h-4 w-40 bg-white/10" />
            </div>
          </div>
          <div className="mt-5 flex gap-5">
            <Skeleton className="h-5 w-32 bg-white/10" />
            <Skeleton className="h-5 w-28 bg-white/10" />
            <Skeleton className="h-5 w-28 bg-white/10" />
          </div>
          <Skeleton className="mt-4 h-4 w-full max-w-xl bg-white/10" />
          <div className="mt-4 flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full bg-white/10" />
            <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
            <Skeleton className="h-5 w-24 rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <Skeleton className="h-4 w-72" />
        <Skeleton className="mt-2 h-4 w-64" />

        <Skeleton className="my-8 h-px w-full" />

        <Skeleton className="h-7 w-40" />
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-48" />
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-8 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="h-fit">
            <CardHeader>
              <Skeleton className="h-5 w-44" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-56" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
