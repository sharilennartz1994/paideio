"use client";

import type { ReactNode } from "react";
import { SlidersHorizontal } from "@/components/icons/paideio-icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileFilterSheet({
  children,
  summary,
}: {
  children: ReactNode;
  summary: string;
}) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <button className="flex min-h-11 items-center gap-2 border border-vetro px-4 font-semibold text-vetro lg:hidden" />
        }
      >
        <SlidersHorizontal className="size-4" />
        Filtri
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[min(88dvh,760px)] overflow-y-auto border-vetro bg-carta-alta px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="px-0">
          <SheetTitle className="font-heading text-[30px] text-calce">Filtra i coach</SheetTitle>
          <SheetDescription className="text-nebbia">{summary}</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
