import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PadelBallMark } from "@/components/padel-ball-mark";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <PadelBallMark className="animate-ball-bounce size-14" />
      <div className="mx-auto mt-1 h-2.5 w-9 animate-ball-shadow rounded-full bg-foreground/20 blur-[2px]" />
      <p className="mt-6 font-mono text-xs tracking-widest text-primary uppercase">Errore 404</p>
      <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">Fuori campo!</h1>
      <p className="mt-3 text-muted-foreground">
        Questa pagina non esiste o è stata spostata — hai mandato la pallina fuori.
      </p>
      <Button
        className="cut-cta mt-6 bg-ball font-mono text-xs font-bold tracking-wider text-ball-foreground uppercase hover:bg-ball/90"
        nativeButton={false}
        render={<Link href="/" />}
      >
        Torna in campo
      </Button>
    </div>
  );
}
