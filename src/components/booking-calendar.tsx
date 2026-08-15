"use client";

import { useMemo, useState, useTransition } from "react";
import { SignInButton } from "@clerk/nextjs";
import { CalendarDays, Check, Clock3, MapPin, MessageSquareText } from "@/components/icons/paideio-icons";
import { toast } from "sonner";
import { useOutcome } from "@/components/outcome-dialog";
import { createBooking } from "@/lib/actions/bookings";
import { celebrate } from "@/lib/confetti";
import type { CalendarWindow } from "@/lib/queries";
import type { TrainingType, BookedLesson } from "@/lib/constants";
import {
  LESSON_DURATIONS,
  allowedStarts,
  computeLessonAvailability,
  minutesFromTime,
  timeFromMinutes,
} from "@/lib/constants";

/** Lezione candidata: un ritaglio concreto dentro una finestra del coach. */
type Candidate = {
  window: CalendarWindow;
  start: number;
  end: number;
  startTime: string;
  endTime: string;
  seatsTaken: number;
  capacity: number;
  bookedType: TrainingType | null;
  availableTypes: TrainingType[];
  joinable: boolean;
};
import { Textarea } from "@/components/ui/textarea";
import { FavoriteButton } from "@/components/favorite-button";
import { FullScreenGameLoader, GameBadge, GameCta, GameEmptyState } from "@/components/design";
import { cn } from "@/lib/utils";

const SUCCESS_MESSAGES = [
  "Punto! Richiesta inviata al coach 🎾",
  "Ottimo colpo! Il coach dovrà confermare.",
  "Servizio vincente: richiesta partita!",
];

const MONTHS_SHORT = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
const DAYS_SHORT = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Etichetta che spiega perché una lezione è (o non è) prenotabile. */
function candidateStatus(c: Candidate): string {
  if (c.bookedType === "gruppo") {
    return c.joinable
      ? `Gruppo aperto · ${c.seatsTaken}/${c.capacity} posti`
      : `Gruppo al completo · ${c.seatsTaken}/${c.capacity}`;
  }
  return c.availableTypes.includes("gruppo") && !c.availableTypes.includes("singolo")
    ? `Libero · gruppo fino a ${c.capacity}`
    : "Libero";
}

function dateStamp(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return { day: DAYS_SHORT[date.getDay()], num: date.getDate(), month: MONTHS_SHORT[date.getMonth()] };
}

export function BookingCalendar({
  coachId,
  windows,
  trainingTypes,
  groupCapacity,
  levels,
  viewerRole,
  pricePerLesson,
  initialFavorite = false,
  offersLessons = true,
}: {
  coachId: string;
  windows: CalendarWindow[];
  trainingTypes: string[];
  groupCapacity: number;
  levels: string[];
  viewerRole: "player" | "coach" | null;
  pricePerLesson?: number | null;
  /** Serve solo allo stato vuoto, che propone di salvare il coach. */
  initialFavorite?: boolean;
  /** Il coach ha dichiarato tipi di lezione e livelli. */
  offersLessons?: boolean;
}) {
  const dates = useMemo(() => Array.from(new Set(windows.map((w) => w.date))), [windows]);
  const [activeDate, setActiveDate] = useState(
    dates.find((date) => windows.some((w) => w.date === date && !w.full)) ?? dates[0] ?? ""
  );
  const [duration, setDuration] = useState<number>(LESSON_DURATIONS[0]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [type, setType] = useState<string>(trainingTypes[0] ?? "singolo");
  const [level, setLevel] = useState(levels[0] ?? "");
  const [notes, setNotes] = useState("");
  const [tutteLeDate, setTutteLeDate] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showOutcome = useOutcome();

  // Le date vanno a capo invece di scorrere, quindi mostrarle tutte subito
  // allungava il passo 1 a 5 righe su mobile. Si parte dalla prima settimana,
  // ma la data selezionata resta sempre visibile anche se si richiude.
  const DATE_INIZIALI = 7;
  const visibleDates = tutteLeDate
    ? dates
    : dates.slice(0, Math.max(DATE_INIZIALI, dates.indexOf(activeDate) + 1));

  // Le lezioni possibili si derivano qui con le stesse funzioni che usa
  // `createBooking`: se divergessero, il giocatore sceglierebbe un orario che
  // l'action poi rifiuta.
  const dayCandidates: Candidate[] = useMemo(() => {
    const out: Candidate[] = [];
    for (const w of windows.filter((x) => x.date === activeDate)) {
      const windowInterval = { start: minutesFromTime(w.startTime), end: minutesFromTime(w.endTime) };
      for (const start of allowedStarts(windowInterval, w.busy, duration)) {
        const end = start + duration;
        const av = computeLessonAvailability({ start, end }, w.busy, groupCapacity, trainingTypes);
        if (av.blocked) continue;
        out.push({
          window: w,
          start,
          end,
          startTime: timeFromMinutes(start),
          endTime: timeFromMinutes(end),
          seatsTaken: av.seatsTaken,
          capacity: av.capacity,
          bookedType: av.bookedType,
          availableTypes: av.availableTypes,
          joinable: av.availableTypes.length > 0,
        });
      }
    }
    return out.sort((a, b) => a.start - b.start);
  }, [windows, activeDate, duration, groupCapacity, trainingTypes]);

  const step = selected ? 2 : 1;

  // Su uno slot già aperto come gruppo si può solo entrare nel gruppo: i tipi
  // offerti dal coach vanno intersecati con quelli ancora possibili lì.
  const selectableTypes: TrainingType[] = selected
    ? selected.availableTypes.filter((t) => trainingTypes.includes(t))
    : (trainingTypes.filter((t) => t === "singolo" || t === "gruppo") as TrainingType[]);

  function selectCandidate(candidate: Candidate) {
    setSelected(candidate);
    const allowed = candidate.availableTypes.filter((t) => trainingTypes.includes(t));
    if (!allowed.includes(type as TrainingType)) setType(allowed[0] ?? "");
  }

  function handleSubmit() {
    if (!selected || !level) return;
    startTransition(async () => {
      const result = await createBooking({
        coachId,
        locationId: selected.window.locationId,
        date: selected.window.date,
        startTime: selected.startTime,
        endTime: selected.endTime,
        type: type as "singolo" | "gruppo",
        level,
        notes,
      });
      if (result.ok) {
        celebrate();
        // Modale e non toast: la richiesta non è confermata, e il giocatore
        // deve capire che ora aspetta il coach. Un avviso di tre secondi in
        // cima allo schermo non basta a dirlo.
        showOutcome({
          kicker: SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)],
          title: "Richiesta inviata al coach",
          description: `Hai chiesto ${formatDate(selected.window.date)} dalle ${selected.startTime} alle ${selected.endTime}, ${selected.window.locationName}.`,
          next: "La lezione non è ancora confermata: il coach deve accettarla. Ti arriva una notifica appena risponde, e la trovi in ogni momento nelle tue lezioni.",
          closeLabel: "Ho capito",
        });
        setSelected(null);
        setNotes("");
      } else {
        // Gli errori restano toast: sono transitori e si risolvono qui, senza
        // dover chiudere una modale per riprovare.
        toast.error(result.error);
      }
    });
  }

  // Senza tipi di lezione e livelli ogni slot risulterebbe pieno: meglio uno
  // stato vuoto esplicito che un calendario di caselle tutte grigie.
  if (windows.length === 0 || !offersLessons) {
    return (
      <GameEmptyState
        asset="pickupTube"
        title={offersLessons ? "Nuovi orari in arrivo" : "Prenotazioni non ancora aperte"}
        description={
          offersLessons
            ? "Il coach non ha ancora pubblicato disponibilità. Salvalo tra i preferiti: lo ritrovi nella tua lista e puoi tornare a controllare."
            : "Il coach deve ancora indicare che tipo di lezioni tiene e per quali livelli. Salvalo tra i preferiti: lo ritrovi nella tua lista e puoi tornare a controllare."
        }
        action={
          <FavoriteButton
            coachId={coachId}
            initialFavorite={initialFavorite}
            viewerRole={viewerRole}
            variant="cta"
          />
        }
      />
    );
  }

  return (
    <section className="overflow-hidden border border-nebbia/25 bg-carta-alta">
      {isPending && <FullScreenGameLoader label="Invio della richiesta al coach" />}
      <header className="grid gap-5 border-b border-nebbia/20 bg-game-ink p-5 text-game-white md:grid-cols-[1fr_auto] md:items-center md:p-7">
        <div>
          <GameBadge tone="info">Prenotazione guidata</GameBadge>
          <h2 className="mt-3 font-heading text-2xl font-bold">Prepara la tua lezione</h2>
          <p className="mt-1 text-sm text-game-white/70">
            Nessun pagamento ora. Il coach riceverà la richiesta e dovrà confermarla.
          </p>
        </div>
        <ol className="flex items-center gap-2" aria-label="Avanzamento prenotazione">
          {[
            ["1", "Orario"],
            ["2", "Dettagli"],
            ["3", "Conferma"],
          ].map(([number, label], index) => {
            const complete = index + 1 < step;
            const current = index + 1 === step;
            return (
              <li key={number} className="flex items-center gap-2">
                <span
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    "flex size-7 items-center justify-center border text-xs font-bold",
                    complete && "border-game-cyan bg-game-cyan text-game-ink",
                    current && "border-game-ball bg-game-ball text-game-ink",
                    !complete && !current && "border-game-white/25 text-game-white/50"
                  )}
                >
                  {complete ? <Check className="size-4" /> : number}
                </span>
                <span className={cn("hidden text-xs sm:inline", current ? "text-game-white" : "text-game-white/50")}>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </header>

      <div className="grid lg:grid-cols-2">
        {/* `min-w-0`: un elemento di griglia ha `min-width: auto`, quindi non
            scende sotto la larghezza min-content del contenuto. Senza, la
            striscia dei giorni (che è già `overflow-x-auto`) non scorreva:
            allargava l'intero pannello a 452px dentro 337px disponibili, e il
            resto dello step veniva tagliato dall'`overflow-hidden` esterno. */}
        <div className="min-w-0 border-b border-nebbia/20 p-5 md:p-7 lg:border-r lg:border-b-0">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-calce">1. Quando vuoi allenarti?</p>
              <p className="mt-1 text-sm text-nebbia">
                Scegli il giorno, poi la durata e l’orario
              </p>
            </div>
            {pricePerLesson != null && (
              <p className="text-right">
                <span className="block text-xs text-nebbia">Da</span>
                <strong className="font-heading text-xl text-calce">€{pricePerLesson}</strong>
              </p>
            )}
          </div>

          {/* Niente `overflow-x-auto`: con il mouse serve shift+rotella e su
              macOS la scrollbar è a scomparsa, quindi le date oltre la sesta
              erano irraggiungibili senza alcun indizio. Stessa scelta fatta per
              i tab di `coach-admin-nav`: si va a capo, così ogni data resta
              visibile e cliccabile a qualunque larghezza. */}
          <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-2" aria-label="Giorni disponibili">
            {visibleDates.map((date) => {
              const stamp = dateStamp(date);
              const dayFull = windows.filter((w) => w.date === date).every((w) => w.full);
              return (
                <button
                  key={date}
                  type="button"
                  aria-pressed={activeDate === date}
                  aria-label={`${formatDate(date)}, ${dayFull ? "nessun orario disponibile" : "orari disponibili"}`}
                  onClick={() => {
                    setActiveDate(date);
                    if (selected?.window.date !== date) setSelected(null);
                  }}
                  className={cn(
                    "min-h-20 border px-2 py-2 text-center transition-[background-color,color,border-color,transform] duration-150",
                    activeDate === date
                      ? "border-vetro bg-vetro text-carta"
                      : "border-nebbia/25 bg-carta-bassa text-calce hover:border-vetro"
                  )}
                >
                  <span className="block text-[10px] font-semibold">{stamp.day}</span>
                  <span className="block font-heading text-2xl leading-tight">{stamp.num}</span>
                  <span className="block text-[10px]">{dayFull ? "pieno" : "libero"}</span>
                </button>
              );
            })}
          </div>

          {dates.length > visibleDates.length || tutteLeDate ? (
            <button
              type="button"
              onClick={() => setTutteLeDate((v) => !v)}
              className="mt-3 min-h-11 text-sm font-semibold text-vetro underline underline-offset-4 hover:text-calce"
            >
              {tutteLeDate
                ? "Mostra solo i prossimi giorni"
                : `Mostra tutte le ${dates.length} date disponibili`}
            </button>
          ) : null}

          <div className="mt-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-calce">
              <Clock3 className="size-4 text-vetro" /> {activeDate ? formatDate(activeDate) : "Scegli un giorno"}
            </p>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-nebbia">Durata</span>
              {LESSON_DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={duration === d}
                  onClick={() => {
                    setDuration(d);
                    setSelected(null);
                  }}
                  className={cn(
                    "min-h-11 border px-4 text-sm font-semibold transition-colors",
                    duration === d
                      ? "border-vetro bg-vetro text-carta"
                      : "border-nebbia/25 bg-carta-bassa text-calce hover:border-vetro"
                  )}
                >
                  {d === 60 ? "1 ora" : "1 ora e 30"}
                </button>
              ))}
            </div>

            {dayCandidates.length === 0 ? (
              <p className="border border-nebbia/25 bg-carta-bassa p-4 text-sm text-nebbia">
                Nessuna lezione di questa durata entra ancora in questa giornata. Prova l’altra
                durata o un altro giorno.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {dayCandidates.map((c) => {
                  const isSelected =
                    selected?.window.locationId === c.window.locationId &&
                    selected?.start === c.start &&
                    selected?.end === c.end;
                  const label = candidateStatus(c);
                  return (
                    <button
                      key={`${c.window.locationId}-${c.start}-${c.end}`}
                      disabled={!c.joinable}
                      onClick={() => selectCandidate(c)}
                      aria-pressed={isSelected}
                      aria-label={`${c.startTime}–${c.endTime}, ${c.window.locationName}, ${label}`}
                      className={cn(
                        "min-h-16 border p-3 text-left transition-[background-color,color,border-color,transform] duration-150 disabled:cursor-not-allowed disabled:opacity-40",
                        isSelected
                          ? "border-vetro bg-vetro/12 text-calce"
                          : "border-nebbia/25 bg-carta-bassa text-calce hover:border-vetro"
                      )}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <strong className="font-heading">{c.startTime}–{c.endTime}</strong>
                        {isSelected && <Check className="size-4 text-vetro" />}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-xs text-nebbia">
                        <MapPin className="size-3.5" /> {c.window.locationName}
                      </span>
                      <span
                        className={cn(
                          "mt-1.5 block font-heading text-[11px] font-bold tracking-[0.04em] uppercase",
                          c.joinable ? "text-accent-cyan-ink" : "text-nebbia"
                        )}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col p-5 md:p-7">
          <div>
            <p className="text-sm font-semibold text-calce">2. Personalizza l’allenamento</p>
            <p className="mt-1 text-sm text-nebbia">Il coach userà questi dettagli per prepararsi.</p>
          </div>

          {!selected ? (
            <div className="my-auto flex min-h-64 flex-col items-center justify-center text-center">
              <CalendarDays className="size-10 text-vetro/65" />
              <p className="mt-4 font-heading text-lg text-calce">Prima scegli un orario</p>
              <p className="mt-2 max-w-xs text-sm text-nebbia">
                Tocca uno slot libero: qui compariranno livello, tipo di lezione e riepilogo.
              </p>
              <GameCta disabled tone="ball" showBall className="mt-6 w-full max-w-xs">
                Seleziona uno slot
              </GameCta>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {selectableTypes.length > 0 && (
                <fieldset>
                  <legend className="mb-2 text-xs font-semibold text-nebbia">Tipo di lezione</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {selectableTypes.map((trainingType) => (
                      <button
                        key={trainingType}
                        type="button"
                        onClick={() => setType(trainingType)}
                        aria-pressed={type === trainingType}
                        className={cn(
                          "min-h-11 border px-3 text-sm font-semibold capitalize",
                          type === trainingType
                            ? "border-vetro bg-vetro text-carta"
                            : "border-nebbia/30 text-calce hover:border-vetro"
                        )}
                      >
                        {trainingType}
                      </button>
                    ))}
                  </div>
                  {selected.bookedType === "gruppo" ? (
                    <p className="mt-2 text-xs text-nebbia">
                      Su questo orario è già aperta una lezione di gruppo: restano{" "}
                      {selected.capacity - selected.seatsTaken} posti su {selected.capacity}.
                    </p>
                  ) : type === "gruppo" ? (
                    <p className="mt-2 text-xs text-nebbia">
                      Apri una lezione di gruppo: altri giocatori potranno unirsi fino a{" "}
                      {selected.capacity} partecipanti.
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-nebbia">
                      La lezione singola occupa il campo in esclusiva: nessun altro potrà
                      prenotare questo orario.
                    </p>
                  )}
                </fieldset>
              )}

              {levels.length > 0 && (
                <fieldset>
                  <legend className="mb-2 text-xs font-semibold text-nebbia">Il tuo livello</legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {levels.map((item) => (
                      <label
                        key={item}
                        className={cn(
                          "flex min-h-11 cursor-pointer items-center justify-center border px-3 text-sm capitalize",
                          level === item
                            ? "border-accent-cyan-ink bg-accent-cyan-ink/10 text-calce"
                            : "border-nebbia/30 text-nebbia hover:border-accent-cyan-ink"
                        )}
                      >
                        <input
                          type="radio"
                          name="booking-level"
                          value={item}
                          checked={level === item}
                          onChange={() => setLevel(item)}
                          className="peer sr-only"
                        />
                        <span className="flex min-h-11 w-full items-center justify-center peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-vetro">
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <div>
                <label htmlFor="booking-notes" className="mb-2 flex items-center gap-2 text-xs font-semibold text-nebbia">
                  <MessageSquareText className="size-4" /> Cosa vuoi migliorare? <span className="font-normal">(opzionale)</span>
                </label>
                <Textarea
                  id="booking-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value.slice(0, 500))}
                  rows={3}
                  maxLength={500}
                  aria-describedby="booking-notes-count"
                  placeholder="Es. vorrei lavorare su uscita dal vetro e posizione a rete."
                  className="border-nebbia/30 bg-carta-bassa text-calce"
                />
                <p id="booking-notes-count" className="mt-1 text-right text-xs text-nebbia" aria-live="polite">
                  {notes.length}/500 caratteri
                </p>
              </div>

              <div className="border-y border-nebbia/20 py-4">
                <p className="text-xs font-semibold text-nebbia">Riepilogo</p>
                <p className="mt-2 font-heading text-calce capitalize">{formatDate(selected.window.date)}</p>
                <p className="mt-1 text-sm text-nebbia">
                  {selected.startTime}–{selected.endTime} · {selected.window.locationName}
                </p>
                <p className="mt-1 text-sm capitalize text-nebbia">{type} · livello {level}</p>
              </div>

              {viewerRole !== "player" && (
                <p className="border border-accent-cyan-ink/35 bg-accent-cyan-ink/7 p-3 text-sm text-nebbia">
                  {viewerRole === "coach"
                    ? "Un account coach non può prenotare una lezione."
                    : "Accedi come giocatore per inviare la richiesta al coach."}
                </p>
              )}

              {/* Prezzo e CTA affiancati non stanno in 297px: la CTA ha
                  `whitespace-nowrap` e non si comprime. Su mobile vanno
                  impilati, con il bottone a piena larghezza. */}
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div>
                  <span className="block text-xs text-nebbia">Totale stimato</span>
                  <strong className="font-heading text-2xl text-calce">
                    {pricePerLesson != null ? `€${pricePerLesson},00` : "Da concordare"}
                  </strong>
                </div>
                {viewerRole === null ? (
                  <SignInButton mode="modal">
                    <GameCta tone="ball" showBall arrow className="w-full sm:w-auto">
                      Accedi e prenota
                    </GameCta>
                  </SignInButton>
                ) : (
                  <GameCta
                    onClick={handleSubmit}
                    disabled={viewerRole !== "player" || !level || isPending}
                    tone="ball"
                    showBall
                    arrow
                    className="w-full sm:w-auto"
                  >
                    Invia richiesta
                  </GameCta>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
