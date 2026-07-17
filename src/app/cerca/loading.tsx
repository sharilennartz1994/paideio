import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CercaLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-2 h-5 w-96 max-w-full" />

      <Skeleton className="mt-6 h-9 w-48" />

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        <Skeleton className="h-16 sm:col-span-2" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="mt-4 h-9 w-20" />

      <div className="mt-8 grid gap-4">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="size-11 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3.5 w-24" />
                </div>
              </div>
              <Skeleton className="mt-2 h-4 w-full max-w-md" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-8 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
