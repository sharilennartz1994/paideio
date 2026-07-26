import Image from "next/image";
import { cn } from "@/lib/utils";

export function PadelBallMark({ className }: { className?: string }) {
  return (
    <Image
      src="/design/game/micro/ball-micro.png"
      alt=""
      aria-hidden
      width={1254}
      height={1254}
      sizes="64px"
      className={cn("object-contain", className)}
    />
  );
}
