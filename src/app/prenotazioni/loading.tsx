import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PrenotazioniLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Skeleton className="h-9 w-64" />

      <div className="mt-6">
        <Skeleton className="h-28 w-full" />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3.5 w-56" />
                </div>
              </div>
              <Skeleton className="h-5 w-24 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
