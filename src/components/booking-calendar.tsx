"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { createBooking } from "@/lib/actions/bookings";
import { celebrate } from "@/lib/confetti";
import type { CalendarSlot } from "@/lib/queries";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SUCCESS_MESSAGES = [
  "Punto! Richiesta inviata al coach 🎾",
  "Ottimo colpo! Il coach dovrà confermare.",
  "Servizio vincente: richiesta partita!",
];

const MONTHS_SHORT = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
const DAYS_SHORT = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];

function formatDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
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
  isPlayer,
  pricePerLesson,
}: {
  coachId: string;
  slots: CalendarSlot[];
  trainingTypes: string[];
  levels: string[];
  isPlayer: boolean;
  pricePerLesson?: number | null;
}) {
  const [selected, setSelected] = useState<CalendarSlot | null>(null);
  const [type, setType] = useState(trainingTypes[0] ?? "singolo");
  const [level, setLevel] = useState(levels[0] ?? "");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarSlot[]>();
    for (const slot of slots) {
      const list = map.get(slot.date) ?? [];
      list.push(slot);
      map.set(slot.date, list);
    }
    return Array.from(map.entries());
  }, [slots]);

  function handleSubmit() {
    if (!selected) return;
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

  return (
    <div className="space-y-8 lg:sticky lg:top-24">
      <section className="border border-outline-variant/30 bg-surface-container p-8 shadow-2xl">
        <h3 className="mb-6 font-heading text-headline-md text-on-background uppercase">Disponibilità</h3>
        {byDate.length === 0 && <p className="text-sm text-on-surface-variant">Nessuna disponibilità nei prossimi giorni.</p>}
        <div className="space-y-4">
          {byDate.map(([date, daySlots]) => {
            const stamp = dateStamp(date);
            return (
              <div key={date} className="flex gap-4">
                <div className="flex w-14 shrink-0 flex-col items-center border-b-4 border-secondary-fixed bg-surface-container-highest px-2 py-3">
                  <span className="font-mono text-[10px] text-secondary-fixed">{stamp.day}</span>
                  <span className="font-heading text-headline-md text-on-surface">{stamp.num}</span>
                  <span className="font-mono text-[10px] text-on-surface-variant">{stamp.month}</span>
                </div>
                <div className="flex flex-1 flex-wrap items-start gap-2 pt-1">
                  {daySlots.map((slot) => {
                    const isSelected =
                      selected?.date === slot.date &&
                      selected?.locationId === slot.locationId &&
                      selected?.startTime === slot.startTime;
                    return (
                      <button
                        key={`${slot.locationId}-${slot.startTime}`}
                        disabled={slot.booked}
                        onClick={() => setSelected(slot)}
                        className={`border py-2 px-3 font-mono text-xs transition-all disabled:cursor-not-allowed disabled:opacity-30 ${
                          isSelected
                            ? "border-secondary-fixed bg-secondary-fixed text-on-secondary-fixed font-bold"
                            : "border-outline-variant text-on-surface hover:bg-primary-container hover:text-on-primary-container"
                        }`}
                      >
                        {slot.startTime}–{slot.endTime} · {slot.locationName}
                        {slot.booked ? " (occupato)" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border border-outline-variant/30 bg-surface-container p-8 shadow-2xl">
        <h3 className="mb-6 font-heading text-headline-md text-on-background uppercase">Richiedi prenotazione</h3>
        {!isPlayer && (
          <Alert className="mb-4 border-outline-variant bg-surface-container-high">
            <AlertDescription className="text-on-surface-variant">
              Accedi come giocatore per prenotare una lezione.
            </AlertDescription>
          </Alert>
        )}
        {!selected && <p className="text-sm text-on-surface-variant">Seleziona uno slot dal calendario qui sopra.</p>}
        {selected && (
          <div className="space-y-6">
            <p className="font-sans text-sm text-on-surface capitalize">
              {formatDate(selected.date)}, {selected.startTime}–{selected.endTime} · {selected.locationName}
            </p>

            {trainingTypes.length > 0 && (
              <div>
                <p className="mb-2 font-mono text-[10px] tracking-widest text-on-surface-variant uppercase">
                  Tipo di allenamento
                </p>
                <div className="flex gap-2">
                  {trainingTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`flex-1 border py-2 font-mono text-xs uppercase transition-all ${
                        type === t
                          ? "border-secondary-fixed bg-secondary-fixed/10 text-secondary-fixed"
                          : "border-outline-variant text-on-surface-variant"
                      }`}
                    >
                      {t === "singolo" ? "Singolo" : "Gruppo"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {levels.length > 0 && (
              <div>
                <p className="mb-2 font-mono text-[10px] tracking-widest text-on-surface-variant uppercase">
                  Il tuo livello
                </p>
                <div className="flex flex-col gap-2">
                  {levels.map((l) => (
                    <label key={l} className="flex cursor-pointer items-center gap-3">
                      <input
                        type="radio"
                        checked={level === l}
                        onChange={() => setLevel(l)}
                        className="peer hidden"
                      />
                      <div
                        onClick={() => setLevel(l)}
                        className={`size-4 shrink-0 border-2 transition-all ${
                          level === l ? "border-secondary-fixed bg-secondary-fixed" : "border-outline"
                        }`}
                      />
                      <span className="font-sans text-sm text-on-surface capitalize">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 font-mono text-[10px] tracking-widest text-on-surface-variant uppercase">
                Note per il coach (opzionale)
              </p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="border-outline-variant bg-surface-container-highest text-on-surface"
              />
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-6">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase">Totale stimato</span>
                <span className="font-heading text-headline-md leading-none text-secondary-fixed">
                  {pricePerLesson != null ? `€${pricePerLesson},00` : "—"}
                </span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!isPlayer || isPending}
                className="neo-shadow bg-secondary-fixed px-10 py-4 font-mono text-lg text-on-secondary-fixed uppercase transition-all hover:-translate-y-1 hover:translate-x-1 active:translate-y-0 active:translate-x-0 disabled:opacity-40"
              >
                {isPending ? "Invio…" : "Prenota ora"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
