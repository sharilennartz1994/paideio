"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { closeAvailabilityDate, reopenAvailabilityDate } from "@/lib/actions/coach-admin";
import { dayName } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FullScreenGameLoader, GameBadge, GameEmptyState } from "@/components/design";
import { cn } from "@/lib/utils";

export type ScheduleSlotView = {
  date: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  locationId: string;
  locationName: string;
  closed: boolean;
  closedWholeDay: boolean;
  activeBookings: number;
};

function formatDay(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return `${dayName(d.getDay())} ${d.getDate()} ${d.toLocaleDateString("it-IT", { month: "long" })}`;
}

/**
 * I turni pubblicati sono ricorrenti; questo pannello lavora sulle *istanze*
 * concrete delle prossime settimane, così il coach può togliere un singolo
 * lunedì senza smontare la ricorrenza.
 */
export function ScheduleExceptions({
  slots,
  closedDays,
}: {
  slots: ScheduleSlotView[];
  closedDays: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);

  const days = useMemo(() => {
    const byDate = new Map<string, ScheduleSlotView[]>();
    for (const slot of slots) {
      const list = byDate.get(slot.date);
      if (list) list.push(slot);
      else byDate.set(slot.date, [slot]);
    }
    // Una giornata chiusa senza turni ricorrenti non comparirebbe tra gli slot,
    // e il coach non potrebbe più riaprirla.
    for (const date of closedDays) if (!byDate.has(date)) byDate.set(date, []);
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, list]) => ({
        date,
        slots: list.sort((a, b) => a.startTime.localeCompare(b.startTime)),
        wholeDayClosed: closedDays.includes(date),
      }));
  }, [slots, closedDays]);

  const visible = expanded ? days : days.slice(0, 7);

  function run(label: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await fn();
      if (result.ok) toast.success(label);
      else toast.error(result.error ?? "Operazione non riuscita.");
    });
  }

  /** Le chiusure sono confermate, quindi l'azione deve dire se ha funzionato. */
  async function confirmAndRun(
    label: string,
    fn: () => Promise<{ ok: boolean; error?: string }>
  ): Promise<boolean> {
    const result = await fn();
    if (result.ok) {
      toast.success(label);
      return true;
    }
    toast.error(result.error ?? "Operazione non riuscita.");
    return false;
  }

  function bookingsWarning(count: number) {
    if (count === 0) return undefined;
    return count === 1
      ? "C’è 1 lezione già prenotata su questa data: verrà annullata e il giocatore riceverà una notifica."
      : `Ci sono ${count} lezioni già prenotate su questa data: verranno annullate e i giocatori riceveranno una notifica.`;
  }

  if (days.length === 0) {
    return (
      <GameEmptyState
        asset="ballBasket"
        title="Nessuna data in arrivo"
        description="Pubblica un turno settimanale qui sopra: le prossime date compariranno qui, pronte da chiudere se ti serve."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {isPending && <FullScreenGameLoader label="Aggiorniamo il calendario" />}

      {visible.map(({ date, slots: slotsOfDay, wholeDayClosed }) => (
        <section
          key={date}
          className={cn(
            "grid gap-3 border-t border-nebbia/20 pt-4 sm:grid-cols-[170px_1fr]",
            wholeDayClosed && "opacity-75"
          )}
        >
          <div>
            <h4 className="font-heading text-base capitalize text-calce">{formatDay(date)}</h4>
            {wholeDayClosed ? (
              <Button
                size="sm"
                variant="ghost"
                disabled={isPending}
                className="mt-1 px-0 text-accent-cyan-ink"
                onClick={() =>
                  run("Giornata riaperta.", async () => {
                    const r = await reopenAvailabilityDate({ date });
                    return r.ok ? { ok: true } : { ok: false, error: r.error };
                  })
                }
              >
                Riapri la giornata
              </Button>
            ) : (
              slotsOfDay.length > 0 && (
                <ConfirmDialog
                  trigger={
                    <Button size="sm" variant="ghost" className="mt-1 px-0 text-nebbia">
                      Chiudi tutto il giorno
                    </Button>
                  }
                  disabled={isPending}
                  title="Chiudere l’intera giornata?"
                  description={
                    <>
                      <strong className="text-calce capitalize">{formatDay(date)}</strong> sparirà
                      dalle disponibilità dei giocatori, compresi eventuali turni che pubblicherai
                      dopo. I turni settimanali restano: potrai riaprire la giornata quando vuoi.
                    </>
                  }
                  warning={bookingsWarning(
                    slotsOfDay.reduce((sum, s) => sum + (s.closed ? 0 : s.activeBookings), 0)
                  )}
                  confirmLabel="Sì, chiudi la giornata"
                  onConfirm={() =>
                    confirmAndRun("Giornata chiusa.", async () => {
                      const r = await closeAvailabilityDate({ date });
                      return r.ok ? { ok: true } : { ok: false, error: r.error };
                    })
                  }
                />
              )
            )}
          </div>

          <div className="grid gap-2">
            {wholeDayClosed && slotsOfDay.length === 0 && (
              <p className="text-sm text-nebbia">Giornata chiusa, nessun turno ricorrente in questa data.</p>
            )}
            {slotsOfDay.map((slot) => (
              <div
                key={`${slot.locationId}-${slot.startTime}`}
                className="flex min-h-14 flex-wrap items-center justify-between gap-3 border border-nebbia/25 bg-carta-bassa px-4 py-2"
              >
                <div>
                  <p
                    className={cn(
                      "font-heading text-calce",
                      slot.closed && "text-nebbia line-through"
                    )}
                  >
                    {slot.startTime}–{slot.endTime}
                  </p>
                  <p className="text-xs text-nebbia">{slot.locationName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {slot.closed ? (
                    <GameBadge tone="neutral">Chiuso</GameBadge>
                  ) : (
                    slot.activeBookings > 0 && (
                      <GameBadge tone="info">
                        {slot.activeBookings} {slot.activeBookings === 1 ? "prenotata" : "prenotate"}
                      </GameBadge>
                    )
                  )}
                  {slot.closed ? (
                    slot.closedWholeDay ? (
                      <span className="text-xs text-nebbia">giornata chiusa</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() =>
                          run("Turno riaperto.", async () => {
                            const r = await reopenAvailabilityDate({
                              date: slot.date,
                              locationId: slot.locationId,
                              startTime: slot.startTime,
                            });
                            return r.ok ? { ok: true } : { ok: false, error: r.error };
                          })
                        }
                      >
                        Riapri
                      </Button>
                    )
                  ) : (
                    <ConfirmDialog
                      trigger={
                        <Button size="sm" variant="ghost">
                          Chiudi
                        </Button>
                      }
                      disabled={isPending}
                      title="Chiudere questo turno?"
                      description={
                        <>
                          Solo <strong className="text-calce">{slot.startTime}–{slot.endTime}</strong> del{" "}
                          <span className="capitalize">{formatDay(slot.date)}</span> sparirà dalle
                          disponibilità. Il turno settimanale resta attivo su tutte le altre date.
                        </>
                      }
                      warning={bookingsWarning(slot.activeBookings)}
                      confirmLabel="Sì, chiudi il turno"
                      onConfirm={() =>
                        confirmAndRun("Turno chiuso per questa data.", async () => {
                          const r = await closeAvailabilityDate({
                            date: slot.date,
                            locationId: slot.locationId,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                          });
                          return r.ok ? { ok: true } : { ok: false, error: r.error };
                        })
                      }
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {days.length > 7 && (
        <Button variant="outline" className="self-start" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Mostra solo i prossimi giorni" : `Mostra tutte le ${days.length} date`}
        </Button>
      )}
    </div>
  );
}
