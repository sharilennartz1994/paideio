"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateBookingStatus } from "@/lib/actions/bookings";
import {
  proposeBookingTime,
  rejectBookingRequest,
} from "@/lib/actions/booking-proposals";
import { celebrate } from "@/lib/confetti";
import { FullScreenGameLoader } from "@/components/design";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  LESSON_DURATIONS,
  MAX_COACH_MESSAGE_LENGTH,
  MIN_COACH_MESSAGE_LENGTH,
  minutesFromTime,
  timeFromMinutes,
  proposableStarts,
} from "@/lib/constants";
import type { BookedLesson, TrainingType } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Finestra concreta del coach, come la serve `/coach-admin/richieste`. È il
 * sottoinsieme serializzabile di `ScheduleSlot`: al form servono solo gli
 * estremi della fascia e ciò che c'è già dentro.
 */
export type ProposalWindow = {
  date: string;
  startTime: string;
  endTime: string;
  locationId: string;
  locationName: string;
  busy: BookedLesson[];
  closed: boolean;
};

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function BookingRequestActions({
  bookingId,
  playerId,
  playerName,
  date,
  startTime,
  endTime,
  type,
  locationId,
  windows,
  groupCapacity,
  trainingTypes,
}: {
  bookingId: string;
  playerId: string;
  playerName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: TrainingType;
  locationId: string | null;
  /** Finestre pubblicate del coach nelle prossime settimane. */
  windows: ProposalWindow[];
  groupCapacity: number;
  trainingTypes: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState<number>(
    LESSON_DURATIONS.includes((minutesFromTime(endTime) - minutesFromTime(startTime)) as 60 | 90)
      ? minutesFromTime(endTime) - minutesFromTime(startTime)
      : LESSON_DURATIONS[0]
  );
  const [proposedDate, setProposedDate] = useState(date);
  const [proposedStart, setProposedStart] = useState<number | null>(null);

  // Gli orari proponibili si derivano con `proposableStarts`, la stessa
  // funzione che valida la proposta lato server: se divergessero, il coach
  // proporrebbe orari che il giocatore non può accettare.
  const startsByDate = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const window of windows) {
      if (window.locationId !== locationId || window.closed) continue;
      const interval = {
        start: minutesFromTime(window.startTime),
        end: minutesFromTime(window.endTime),
      };
      // La lezione che stiamo spostando non occupa: la sua fascia si libera.
      const busy = window.busy.filter(
        (b) =>
          !(
            window.date === date &&
            b.playerId === playerId &&
            b.start === minutesFromTime(startTime) &&
            b.end === minutesFromTime(endTime)
          )
      );
      const starts = proposableStarts(
        interval,
        busy,
        duration,
        type,
        groupCapacity,
        trainingTypes
        // L'orario già richiesto non è una proposta: quello si conferma e
        // basta. Cambiare la sola durata invece è una proposta legittima.
      ).filter(
        (start) =>
          !(
            window.date === date &&
            timeFromMinutes(start) === startTime &&
            timeFromMinutes(start + duration) === endTime
          )
      );
      if (starts.length === 0) continue;
      map.set(window.date, [...(map.get(window.date) ?? []), ...starts].sort((a, b) => a - b));
    }
    return map;
  }, [
    windows,
    locationId,
    duration,
    type,
    groupCapacity,
    trainingTypes,
    date,
    playerId,
    startTime,
    endTime,
  ]);

  const dates = [...startsByDate.keys()].sort();
  const activeDate = startsByDate.has(proposedDate) ? proposedDate : dates[0] ?? "";
  const starts = startsByDate.get(activeDate) ?? [];
  const canPropose =
    proposedStart != null &&
    starts.includes(proposedStart) &&
    message.trim().length >= MIN_COACH_MESSAGE_LENGTH;

  function handleConfirm() {
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, "confermata");
      if (result.ok) {
        celebrate();
        toast.success("Lezione confermata! Il giocatore riceverà l'ok.");
      } else {
        toast.error(result.error);
      }
    });
  }

  async function handleReject(): Promise<boolean> {
    const result = await rejectBookingRequest({ bookingId, reason });
    if (result.ok) {
      toast("Richiesta rifiutata: il giocatore legge la tua motivazione.");
      setReason("");
      return true;
    }
    toast.error(result.error);
    return false;
  }

  async function handlePropose(): Promise<boolean> {
    if (proposedStart == null) return false;
    const result = await proposeBookingTime({
      bookingId,
      date: activeDate,
      startTime: timeFromMinutes(proposedStart),
      endTime: timeFromMinutes(proposedStart + duration),
      message,
    });
    if (result.ok) {
      toast.success(`Proposta inviata a ${playerName}. Ora tocca a lui.`);
      setMessage("");
      setProposedStart(null);
      return true;
    }
    toast.error(result.error);
    return false;
  }

  return (
    <>
      {isPending && <FullScreenGameLoader label="Aggiorniamo la richiesta" />}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={isPending}
          onClick={handleConfirm}
          className="bg-ball font-mono text-xs font-bold tracking-wider text-ball-foreground uppercase hover:bg-ball/90"
        >
          Accetta
        </Button>

        <ConfirmDialog
          kicker="Proposta di orario"
          title="Vuoi proporre un altro orario?"
          description={
            locationId == null
              ? "Il campo di questa lezione non esiste più: non puoi spostarla."
              : dates.length === 0
                ? `Non hai fasce libere per una lezione ${type === "gruppo" ? "di gruppo" : "singola"} di questa durata nelle prossime settimane. Prova a cambiare durata o pubblica nuovi orari.`
                : `${playerName} ha chiesto ${formatDate(date)} alle ${startTime}. Scegli quando puoi davvero, e spiegaglielo.`
          }
          body={
            locationId == null ? null : (
              <div className="grid max-h-[46vh] gap-4 overflow-y-auto pr-1">
                <div>
                  <span className="mb-1.5 block font-heading text-[10px] font-bold text-nebbia uppercase">
                    Durata
                  </span>
                  <div className="flex gap-2">
                    {LESSON_DURATIONS.map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={duration === value}
                        onClick={() => {
                          setDuration(value);
                          setProposedStart(null);
                        }}
                        className={cn(
                          "min-h-11 flex-1 border px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-vetro",
                          duration === value
                            ? "border-vetro bg-vetro text-carta"
                            : "border-nebbia/30 bg-carta-bassa text-calce hover:border-vetro"
                        )}
                      >
                        {value === 60 ? "1 ora" : "1 ora e 30"}
                      </button>
                    ))}
                  </div>
                </div>

                {dates.length > 0 && (
                  <fieldset>
                    {/* Chip e non un Select: il popup di un Select Base UI sta
                        a `z-50`, il popup del dialog a `z-[220]`, quindi la
                        tendina finirebbe dietro al dialog. */}
                    <legend className="mb-1.5 font-heading text-[10px] font-bold text-nebbia uppercase">
                      Giorno
                    </legend>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2">
                      {dates.map((value) => {
                        const stamp = new Date(`${value}T00:00:00`);
                        return (
                          <button
                            key={value}
                            type="button"
                            aria-pressed={activeDate === value}
                            aria-label={formatDate(value)}
                            onClick={() => {
                              setProposedDate(value);
                              setProposedStart(null);
                            }}
                            className={cn(
                              "min-h-11 border px-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-vetro",
                              activeDate === value
                                ? "border-vetro bg-vetro text-carta"
                                : "border-nebbia/30 bg-carta-bassa text-calce hover:border-vetro"
                            )}
                          >
                            {stamp.toLocaleDateString("it-IT", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                )}

                {starts.length > 0 && (
                  <fieldset>
                    <legend className="mb-1.5 font-heading text-[10px] font-bold text-nebbia uppercase">
                      Orario di inizio
                    </legend>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
                      {starts.map((value) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={proposedStart === value}
                          onClick={() => setProposedStart(value)}
                          className={cn(
                            "min-h-11 border px-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-vetro",
                            proposedStart === value
                              ? "border-vetro bg-vetro text-carta"
                              : "border-nebbia/30 bg-carta-bassa text-calce hover:border-vetro"
                          )}
                        >
                          {timeFromMinutes(value)}–{timeFromMinutes(value + duration)}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}

                <div>
                  <label
                    htmlFor={`proposal-message-${bookingId}`}
                    className="mb-1.5 block font-heading text-[10px] font-bold text-nebbia uppercase"
                  >
                    Perché sposti la lezione
                  </label>
                  <Textarea
                    id={`proposal-message-${bookingId}`}
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value.slice(0, MAX_COACH_MESSAGE_LENGTH))
                    }
                    rows={3}
                    maxLength={MAX_COACH_MESSAGE_LENGTH}
                    placeholder="Es. a quell'ora ho già un corso sul campo 2, ma subito dopo sono libero."
                    className="border-nebbia/30 bg-carta-bassa text-calce"
                  />
                  <p className="mt-1 text-right text-xs text-nebbia" aria-live="polite">
                    {message.trim().length}/{MAX_COACH_MESSAGE_LENGTH} caratteri
                  </p>
                </div>
              </div>
            )
          }
          reassurance="La proposta non blocca il campo: l'orario resta prenotabile finché il giocatore non accetta. Se nel frattempo qualcuno lo prende, glielo diciamo con chiarezza."
          confirmLabel="Invia la proposta"
          confirmDisabled={!canPropose}
          disabled={isPending || locationId == null}
          onConfirm={handlePropose}
          trigger={
            <Button size="sm" variant="outline" className="font-mono text-xs tracking-wider uppercase">
              Proponi un altro orario
            </Button>
          }
        />

        <ConfirmDialog
          kicker="Rifiuto della richiesta"
          title="Vuoi davvero rifiutare questa richiesta?"
          description={`${playerName} ha chiesto ${formatDate(date)} alle ${startTime}. Scrivi perché non puoi: è l'unica cosa che leggerà.`}
          body={
            <div>
              <label
                htmlFor={`reject-reason-${bookingId}`}
                className="mb-1.5 block font-heading text-[10px] font-bold text-nebbia uppercase"
              >
                Motivazione
              </label>
              <Textarea
                id={`reject-reason-${bookingId}`}
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value.slice(0, MAX_COACH_MESSAGE_LENGTH))
                }
                rows={3}
                maxLength={MAX_COACH_MESSAGE_LENGTH}
                placeholder="Es. quel giorno sono fuori città per un torneo."
                className="border-nebbia/30 bg-carta-bassa text-calce"
              />
              <p className="mt-1 text-right text-xs text-nebbia" aria-live="polite">
                {reason.trim().length}/{MAX_COACH_MESSAGE_LENGTH} caratteri
              </p>
            </div>
          }
          warning="Il rifiuto chiude la richiesta: per tornare in campo il giocatore dovrà inviarne una nuova. Se il problema è solo l'orario, proponigliene un altro."
          confirmLabel="Rifiuta la richiesta"
          confirmDisabled={reason.trim().length < MIN_COACH_MESSAGE_LENGTH}
          disabled={isPending}
          onConfirm={handleReject}
          trigger={
            <Button size="sm" variant="outline" className="font-mono text-xs tracking-wider uppercase">
              Rifiuta
            </Button>
          }
        />
      </div>
    </>
  );
}
