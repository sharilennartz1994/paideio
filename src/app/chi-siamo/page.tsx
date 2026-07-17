import Link from "next/link";
import type { Metadata } from "next";
import { ScrollText, Swords, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourtLines } from "@/components/court-lines";
import { PadelBallMark } from "@/components/padel-ball-mark";

export const metadata: Metadata = {
  title: "Il concept — Paideio",
  description: "Perché si chiama Paideio: dal greco antico παιδεία alla formazione del giocatore di padel di oggi.",
};

const CHAPTERS = [
  {
    icon: ScrollText,
    title: "Nella Grecia antica",
    body: "Παιδεία non significava semplicemente \"istruzione\". Era il percorso attraverso cui un giovane diventava una persona compiuta — non solo sui libri, ma nel ginnasio, sotto la guida di un maestro che insegnava tecnica, disciplina e rispetto per l'avversario. Il corpo e il carattere si allenavano insieme.",
  },
  {
    icon: Swords,
    title: "Nel padel di oggi",
    body: "Sul campo succede la stessa cosa. Non migliori da solo: ti serve qualcuno che corregga il tuo colpo, che ti spinga oltre il tuo limite, che ti insegni a leggere il gioco prima ancora dei fondamentali. Ogni lezione è una piccola paideia — un pezzo di formazione che si aggiunge al prossimo.",
  },
  {
    icon: Sparkles,
    title: "Perché un'app",
    body: "Paideio esiste per rendere più facile trovare quella guida. Per chi inizia, per chi vuole migliorare, per chi cerca solo un motivo in più per scendere in campo questa settimana. Il nome è un promemoria: non stai solo prenotando una lezione, stai continuando una tradizione lunga più di duemila anni.",
  },
];

export default function ChiSiamoPage() {
  return (
    <div>
      <section className="hex-tex relative overflow-hidden bg-court text-court-foreground">
        <CourtLines className="pointer-events-none absolute -bottom-10 -right-14 h-[70%] w-[55%] text-primary/20" />
        <div className="relative mx-auto max-w-2xl px-4 py-20 text-center sm:py-28">
          <div className="mx-auto flex w-fit items-center gap-2 border border-court-foreground/20 bg-white/5 px-3.5 py-1.5 font-mono text-xs tracking-widest text-ball uppercase">
            <PadelBallMark className="size-4" />
            Il nome, la storia
          </div>
          <h1 className="mt-6 text-balance font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            Perché Paideio?
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-lg text-court-foreground/75">
            Non è un nome a caso. È un&apos;idea antica quanto lo sport, applicata al modo in cui oggi
            impariamo a giocare.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="font-heading text-6xl font-black tracking-tight text-ball sm:text-7xl">παιδεία</p>
        <p className="mt-3 font-mono text-xs tracking-wide text-muted-foreground uppercase">
          paideia — sostantivo, greco antico
        </p>
        <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
          La formazione della persona nel suo insieme: corpo, carattere, comunità.
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-16">
        <div className="flex flex-col gap-10">
          {CHAPTERS.map((chapter, i) => (
            <div key={chapter.title} className="flex gap-5 border-l-2 border-border pl-5">
              <chapter.icon className="mt-1 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-mono text-xs tracking-widest text-primary">0{i + 1}</p>
                <h2 className="mt-1 font-heading text-xl font-bold">{chapter.title}</h2>
                <p className="mt-2 text-muted-foreground">{chapter.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="hex-tex border-t border-border bg-court text-court-foreground">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Il tuo <span className="text-ball">paidotribes</span> ti aspetta.
          </h2>
          <p className="mt-3 text-court-foreground/70">
            Trova un coach vicino a te e inizia la tua paideia da padel.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              nativeButton={false}
              render={<Link href="/cerca" />}
              className="cut-cta bg-ball font-mono text-xs font-bold tracking-wider text-ball-foreground uppercase hover:bg-ball/90"
            >
              Trova un coach
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/diventa-coach" />}
              className="border-court-foreground/25 bg-white/5 font-mono text-xs tracking-wider text-court-foreground uppercase hover:bg-white/10 hover:text-court-foreground"
            >
              Diventa coach
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
