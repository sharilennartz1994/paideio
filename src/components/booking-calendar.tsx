"use client";

import { useMemo, useState, useTransition } from "react";
import { SignInButton } from "@clerk/nextjs";
import { CalendarDays, Check, Clock3, MapPin, MessageSquareText } from "@/components/icons/paideio-icons";
import { toast } from "sonner";
import { createBooking } from "@/lib/actions/bookings";
import { celebrate } from "@/lib/confetti";
import type { CalendarSlot } from "@/lib/queries";
import type { TrainingType } from "@/lib/constants";
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

/** Etichetta che spiega perché uno slot è (o non è) prenotabile. */
function slotStatus(slot: CalendarSlot): { label: string } {
  if (slot.bookedType === "singolo") return { label: "Occupato · lezione singola" };
  if (slot.bookedType === "gruppo") {
    return slot.booked
      ? { label: `Gruppo al completo · ${slot.seatsTaken}/${slot.capacity}` }
      : { label: `Gruppo aperto · ${slot.seatsTaken}/${slot.capacity} posti` };
  }
  if (slot.booked) return { label: "Non disponibile" };
  return slot.availableTypes.includes("gruppo") && !slot.availableTypes.includes("singolo")
    ? { label: `Libero · gruppo fino a ${slot.capacity}` }
    : { label: "Libero" };
}

function dateStamp(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return { day: DAYS_SHORT[date.getDay()], num: date.getDate(), month: MONTHS_SHORT[date.getMonth()] };
}

export function BookingCalendar({
  coachId,
  slots,
  trainingTypes,
  levels,
  viewerRole,
  pricePerLesson,
  initialFavorite = false,
}: {
  coachId: string;
  slots: CalendarSlot[];
  trainingTypes: string[];
  levels: string[];
  viewerRole: "player" | "coach" | null;
  pricePerLesson?: number | null;
  /** Serve solo allo stato vuoto, che propone di salvare il coach. */
  initialFavorite?: boolean;
}) {
  const availableSlots = useMemo(() => slots.filter((slot) => !slot.booked), [slots]);
  const dates = useMemo(
    () => Array.from(new Set(slots.map((slot) => slot.date))),
    [slots]
  );
  const [activeDate, setActiveDate] = useState(dates.find((date) => slots.some((slot) => slot.date === date && !slot.booked)) ?? dates[0] ?? "");
  const [selected, setSelected] = useState<CalendarSlot | null>(null);
  const [type, setType] = useState<string>(trainingTypes[0] ?? "singolo");
  const [level, setLevel] = useState(levels[0] ?? "");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const daySlots = slots.filter((slot) => slot.date === activeDate);
  const step = selected ? 2 : 1;

  // Su uno slot già aperto come gruppo si può solo entrare nel gruppo: i tipi
  // offerti dal coach vanno intersecati con quelli ancora possibili lì.
  const selectableTypes: TrainingType[] = selected
    ? selected.availableTypes.filter((t) => trainingTypes.includes(t))
    : (trainingTypes.filter((t) => t === "singolo" || t === "gruppo") as TrainingType[]);

  function selectSlot(slot: CalendarSlot) {
    setSelected(slot);
    // Se il tipo scelto prima non è più possibile su questo slot, ricade sul
    // primo ammesso: così il riepilogo non promette mai qualcosa di rifiutabile.
    const allowed = slot.availableTypes.filter((t) => trainingTypes.includes(t));
    if (!allowed.includes(type as TrainingType)) setType(allowed[0] ?? "");
  }

  function handleSubmit() {
    if (!selected || !level) return;
    startTransition(async () => {
      const result = await createBooking({
        coachId,
        locationId: selected.locationId,
        date: selected.date,
        startTime: selected.startTime,
        endTime: selected.endTime,
        type: type as "singolo" | "gruppo",
        level,
        notes,
      });
      if (result.ok) {
        celebrate();
        toast.success(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]);
        setSelected(null);
        setNotes("");
      } else {
        toast.error(result.error);
      }
    });
  }

  if (slots.length === 0) {
    return (
      <GameEmptyState
        asset="pickupTube"
        title="Nuovi orari in arrivo"
        description="Il coach non ha ancora pubblicato disponibilità. Salvalo tra i preferiti: lo ritrovi nella tua lista e puoi tornare a controllare."
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
        <div className="border-b border-nebbia/20 p-5 md:p-7 lg:border-r lg:border-b-0">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-calce">1. Quando vuoi allenarti?</p>
              <p className="mt-1 text-sm text-nebbia">
                {availableSlots.length} {availableSlots.length === 1 ? "orario disponibile" : "orari disponibili"} nei prossimi giorni
              </p>
            </div>
            {pricePerLesson != null && (
              <p className="text-right">
                <span className="block text-xs text-nebbia">Da</span>
                <strong className="font-heading text-xl text-calce">€{pricePerLesson}</strong>
              </p>
            )}
          </div>

          <div className="-mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-2" aria-label="Giorni disponibili">
            {dates.map((date) => {
              const stamp = dateStamp(date);
              const available = slots.filter((slot) => slot.date === date && !slot.booked).length;
              return (
                <button
                  key={date}
                  type="button"
                  aria-pressed={activeDate === date}
                  aria-label={`${formatDate(date)}, ${
                    available === 1
                      ? "1 orario disponibile"
                      : available > 1
                        ? `${available} orari disponibili`
                        : "nessun orario disponibile"
                  }`}
                  onClick={() => {
                    setActiveDate(date);
                    if (selected?.date !== date) setSelected(null);
                  }}
                  className={cn(
                    "min-h-20 min-w-[76px] shrink-0 border px-3 py-2 text-center transition-[background-color,color,border-color,transform] duration-150",
                    activeDate === date
                      ? "border-vetro bg-vetro text-carta"
                      : "border-nebbia/25 bg-carta-bassa text-calce hover:border-vetro"
                  )}
                >
                  <span className="block text-[10px] font-semibold">{stamp.day}</span>
                  <span className="block font-heading text-2xl leading-tight">{stamp.num}</span>
                  <span className="block text-[10px]">{available ? `${available} slot` : "pieno"}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-calce">
              <Clock3 className="size-4 text-vetro" /> {activeDate ? formatDate(activeDate) : "Scegli un giorno"}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {daySlots.map((slot) => {
                const isSelected =
                  selected?.date === slot.date &&
                  selected?.locationId === slot.locationId &&
                  selected?.startTime === slot.startTime;
                const status = slotStatus(slot);
                return (
                  <button
                    key={`${slot.locationId}-${slot.startTime}-${slot.endTime}`}
                    disabled={slot.booked}
                    onClick={() => selectSlot(slot)}
                    aria-pressed={isSelected}
                    aria-label={`${slot.startTime}–${slot.endTime}, ${slot.locationName}, ${status.label}`}
                    className={cn(
                      "min-h-16 border p-3 text-left transition-[background-color,color,border-color,transform] duration-150 disabled:cursor-not-allowed disabled:opacity-40",
                      isSelected
                        ? "border-vetro bg-vetro/12 text-calce"
                        : "border-nebbia/25 bg-carta-bassa text-calce hover:border-vetro"
                    )}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <strong className="font-heading">{slot.startTime}–{slot.endTime}</strong>
                      {isSelected && <Check className="size-4 text-vetro" />}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-xs text-nebbia">
                      <MapPin className="size-3.5" /> {slot.locationName}
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 block font-heading text-[11px] font-bold tracking-[0.04em] uppercase",
                        slot.booked ? "text-nebbia" : "text-accent-cyan-ink"
                      )}
                    >
                      {status.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col p-5 md:p-7">
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
                <p className="mt-2 font-heading text-calce capitalize">{formatDate(selected.date)}</p>
                <p className="mt-1 text-sm text-nebbia">
                  {selected.startTime}–{selected.endTime} · {selected.locationName}
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

              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="block text-xs text-nebbia">Totale stimato</span>
                  <strong className="font-heading text-2xl text-calce">
                    {pricePerLesson != null ? `€${pricePerLesson},00` : "Da concordare"}
                  </strong>
                </div>
                {viewerRole === null ? (
                  <SignInButton mode="modal">
                    <GameCta tone="ball" showBall arrow>Accedi e prenota</GameCta>
                  </SignInButton>
                ) : (
                  <GameCta
                    onClick={handleSubmit}
                    disabled={viewerRole !== "player" || !level || isPending}
                    tone="ball"
                    showBall
                    arrow
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
