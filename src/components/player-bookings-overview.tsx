"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LayoutList,
  MapPin,
  Rows3,
  Search,
  Users,
  UserRound,
  XCircle,
} from "@/components/icons/paideio-icons";
import { BOOKING_STATUS_CONFIG, toLocalDateString } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoachAvatar } from "@/components/coach-avatar";
import { CancelBookingButton } from "@/components/cancel-booking-button";
import { BookingProposalActions } from "@/components/booking-proposal-actions";
import { ReviewForm } from "@/components/review-form";
import { GameCta, GameEmptyState } from "@/components/design";

type BookingStatus = "richiesta" | "confermata" | "rifiutata" | "annullata" | "controproposta";
type BookingType = "singolo" | "gruppo";
type ViewMode = "lista" | "calendario" | "agenda";
type PeriodFilter = "prossime" | "passate" | "tutte";

export type PlayerBookingSummary = {
  id: string;
  coachName: string;
  coachAvatarUrl: string | null;
  locationName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: BookingType;
  level: string;
  status: BookingStatus;
  notes: string;
  canReview: boolean;
  isReviewed: boolean;
  /** Motivazione del coach quando rifiuta o propone un altro orario. */
  coachMessage: string;
  /** Orario alternativo proposto dal coach, solo mentre è in trattativa. */
  proposedDate: string | null;
  proposedStartTime: string | null;
  proposedEndTime: string | null;
};

const STATUS_ICON: Record<BookingStatus, typeof CheckCircle2> = {
  richiesta: Clock3,
  confermata: CheckCircle2,
  controproposta: CalendarClock,
  rifiutata: XCircle,
  annullata: XCircle,
};

const VIEW_OPTIONS: Array<{ value: ViewMode; label: string; icon: typeof LayoutList }> = [
  { value: "lista", label: "Lista", icon: LayoutList },
  { value: "calendario", label: "Calendario", icon: CalendarDays },
  { value: "agenda", label: "Agenda", icon: Rows3 },
];

const WEEKDAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

function dateFromString(value: string) {
  return new Date(`${value}T00:00:00`);
}

function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("it-IT", options ?? {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(dateFromString(value));
}

function monthKey(value: string) {
  return value.slice(0, 7);
}

function moveMonth(value: string, amount: number) {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(year, month - 1 + amount, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function LessonStatus({ status }: { status: BookingStatus }) {
  const config = BOOKING_STATUS_CONFIG[status];
  const Icon = STATUS_ICON[status];
  return (
    <Badge className={cn(config.className, "gap-1 rounded-full border-transparent font-heading text-[10px] uppercase")}>
      <Icon className="size-3" aria-hidden />
      {config.label}
    </Badge>
  );
}

function LessonCard({ item }: { item: PlayerBookingSummary }) {
  const active = item.status === "richiesta" || item.status === "confermata";
  const proposal =
    item.status === "controproposta" &&
    item.proposedDate &&
    item.proposedStartTime &&
    item.proposedEndTime
      ? {
          date: item.proposedDate,
          startTime: item.proposedStartTime,
          endTime: item.proposedEndTime,
        }
      : null;
  return (
    <article
      className={cn(
        "card-clip border-t-2 bg-carta-alta p-5 md:p-6",
        item.status === "confermata" ? "border-accent-ball-ink" : "border-accent-cyan-ink/65"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <CoachAvatar name={item.coachName} src={item.coachAvatarUrl} className="size-12 shrink-0" />
          <div className="min-w-0">
            <p className="font-heading text-xl font-bold text-calce">{item.coachName}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-nebbia">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4 text-accent-cyan-ink" aria-hidden />
                {formatDate(item.date, { weekday: "long", day: "numeric", month: "long" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock3 className="size-4 text-accent-cyan-ink" aria-hidden />
                {item.startTime}–{item.endTime}
              </span>
            </p>
          </div>
        </div>
        <LessonStatus status={item.status} />
      </div>

      <div className="mt-5 grid gap-3 border-y border-nebbia/18 py-4 text-sm sm:grid-cols-3">
        <p className="flex items-center gap-2 text-nebbia">
          <MapPin className="size-4 text-accent-cyan-ink" aria-hidden />
          {item.locationName}
        </p>
        <p className="flex items-center gap-2 text-nebbia capitalize">
          {item.type === "gruppo"
            ? <Users className="size-4 text-accent-cyan-ink" aria-hidden />
            : <UserRound className="size-4 text-accent-cyan-ink" aria-hidden />}
          Lezione {item.type === "gruppo" ? "di gruppo" : "singola"}
        </p>
        <p className="text-nebbia capitalize">Livello {item.level}</p>
      </div>

      {item.notes && <p className="mt-4 text-sm leading-relaxed text-nebbia">“{item.notes}”</p>}

      {proposal ? (
        <BookingProposalActions
          bookingId={item.id}
          coachName={item.coachName}
          originalDate={item.date}
          originalStartTime={item.startTime}
          proposedDate={proposal.date}
          proposedStartTime={proposal.startTime}
          proposedEndTime={proposal.endTime}
          coachMessage={item.coachMessage}
        />
      ) : (
        item.status === "rifiutata" &&
        item.coachMessage && (
          <p className="mt-4 border border-accent-orange-ink/45 bg-carta-bassa p-3 text-sm leading-relaxed text-calce">
            <span className="font-heading text-[10px] text-nebbia uppercase">
              Perché il coach ha rifiutato
            </span>
            <br />“{item.coachMessage}”
          </p>
        )
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          {item.canReview && <ReviewForm bookingId={item.id} coachName={item.coachName} />}
          {item.isReviewed && <p className="font-heading text-[10px] text-nebbia uppercase">Recensione inviata</p>}
        </div>
        {active && (
          <CancelBookingButton
            bookingId={item.id}
            coachName={item.coachName}
            date={item.date}
            startTime={item.startTime}
          />
        )}
      </div>
    </article>
  );
}

function CalendarView({
  items,
  visibleMonth,
  onMonthChange,
}: {
  items: PlayerBookingSummary[];
  visibleMonth: string;
  onMonthChange: (value: string) => void;
}) {
  const [year, month] = visibleMonth.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leading = (firstDay.getDay() + 6) % 7;
  const cells = Array.from({ length: leading + daysInMonth }, (_, index) => {
    if (index < leading) return null;
    return index - leading + 1;
  });
  while (cells.length % 7 !== 0) cells.push(null);

  const byDate = new Map<string, PlayerBookingSummary[]>();
  for (const item of items) {
    const list = byDate.get(item.date) ?? [];
    list.push(item);
    byDate.set(item.date, list);
  }

  return (
    <section aria-label="Calendario delle lezioni">
      <div className="mb-4 flex items-center justify-between gap-3 border border-nebbia/20 bg-carta-alta p-3">
        <Button variant="ghost" size="icon" onClick={() => onMonthChange(moveMonth(visibleMonth, -1))} aria-label="Mese precedente">
          <ChevronLeft />
        </Button>
        <h2 className="font-heading text-lg font-bold text-calce capitalize">
          {new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" }).format(firstDay)}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => onMonthChange(moveMonth(visibleMonth, 1))} aria-label="Mese successivo">
          <ChevronRight />
        </Button>
      </div>
      <div className="overflow-x-auto border border-nebbia/20 bg-carta-bassa">
        <div className="grid min-w-[760px] grid-cols-7">
          {WEEKDAYS.map((day) => (
            <div key={day} className="border-b border-r border-nebbia/18 bg-game-ink px-3 py-2 font-heading text-[10px] font-bold text-game-white/70 uppercase last:border-r-0">
              {day}
            </div>
          ))}
          {cells.map((day, index) => {
            const date = day ? `${visibleMonth}-${String(day).padStart(2, "0")}` : null;
            const lessons = date ? byDate.get(date) ?? [] : [];
            const isToday = date === toLocalDateString(new Date());
            return (
              <div
                key={`${date ?? "empty"}-${index}`}
                className={cn(
                  "min-h-32 border-r border-b border-nebbia/16 p-2",
                  !day && "bg-carta/45",
                  isToday && "bg-accent-cyan-ink/7"
                )}
              >
                {day && (
                  <span className={cn(
                    "flex size-7 items-center justify-center font-heading text-xs font-bold text-nebbia",
                    isToday && "bg-accent-cyan-ink text-carta"
                  )}>
                    {day}
                  </span>
                )}
                <div className="mt-2 grid gap-1.5">
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={cn(
                        "border-l-2 bg-carta-alta px-2 py-1.5 text-left",
                        lesson.status === "confermata" ? "border-accent-ball-ink" : "border-accent-cyan-ink"
                      )}
                    >
                      <p className="font-heading text-[10px] font-bold text-calce">{lesson.startTime} · {lesson.coachName}</p>
                      <p className="mt-0.5 truncate text-[10px] text-nebbia capitalize">
                        {lesson.type} · {BOOKING_STATUS_CONFIG[lesson.status].label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AgendaView({ items }: { items: PlayerBookingSummary[] }) {
  const groups = new Map<string, PlayerBookingSummary[]>();
  for (const item of items) {
    const list = groups.get(item.date) ?? [];
    list.push(item);
    groups.set(item.date, list);
  }

  return (
    <div className="grid gap-7">
      {[...groups.entries()].map(([date, lessons]) => (
        <section key={date} className="grid gap-3 md:grid-cols-[150px_1fr]">
          <div>
            <p className="font-heading text-xs font-bold text-accent-cyan-ink uppercase">
              {formatDate(date, { weekday: "long" })}
            </p>
            <p className="mt-1 font-heading text-2xl font-bold text-calce">
              {formatDate(date, { day: "2-digit", month: "short" })}
            </p>
          </div>
          <div className="relative grid gap-3 border-l border-accent-cyan-ink/35 pl-5">
            {lessons.map((item) => (
              <article key={item.id} className="relative border border-nebbia/20 bg-carta-alta p-4">
                <span className="absolute top-5 -left-[25px] size-2.5 bg-accent-ball-ink" aria-hidden />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-lg font-bold text-calce">{item.startTime} · {item.coachName}</p>
                    <p className="mt-1 text-sm text-nebbia">
                      {item.locationName} · lezione {item.type === "gruppo" ? "di gruppo" : "singola"}
                    </p>
                  </div>
                  <LessonStatus status={item.status} />
                </div>
                {item.status === "controproposta" &&
                  item.proposedDate &&
                  item.proposedStartTime &&
                  item.proposedEndTime && (
                    <BookingProposalActions
                      bookingId={item.id}
                      coachName={item.coachName}
                      originalDate={item.date}
                      originalStartTime={item.startTime}
                      proposedDate={item.proposedDate}
                      proposedStartTime={item.proposedStartTime}
                      proposedEndTime={item.proposedEndTime}
                      coachMessage={item.coachMessage}
                    />
                  )}
                {(item.status === "richiesta" || item.status === "confermata") && (
                  <div className="mt-4 flex justify-end">
                    <CancelBookingButton
                      bookingId={item.id}
                      coachName={item.coachName}
                      date={item.date}
                      startTime={item.startTime}
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function PlayerBookingsOverview({ items }: { items: PlayerBookingSummary[] }) {
  const today = toLocalDateString(new Date());
  const firstUpcoming = items.find((item) => item.date >= today);
  const [period, setPeriod] = useState<PeriodFilter>("prossime");
  const [status, setStatus] = useState<BookingStatus | "tutti">("tutti");
  const [type, setType] = useState<BookingType | "tutti">("tutti");
  const [view, setView] = useState<ViewMode>("lista");
  const [visibleMonth, setVisibleMonth] = useState(monthKey(firstUpcoming?.date ?? today));

  const filtered = useMemo(() => items
    .filter((item) => {
      const periodMatch = period === "tutte" || (period === "prossime" ? item.date >= today : item.date < today);
      return periodMatch && (status === "tutti" || item.status === status) && (type === "tutti" || item.type === type);
    })
    .sort((a, b) => {
      const order = (a.date + a.startTime).localeCompare(b.date + b.startTime);
      return period === "passate" ? -order : order;
    }), [items, period, status, type, today]);
  const filtersActive = period !== "prossime" || status !== "tutti" || type !== "tutti";

  function resetFilters() {
    setPeriod("prossime");
    setStatus("tutti");
    setType("tutti");
  }

  const stats = {
    upcoming: items.filter((item) => item.date >= today && !["annullata", "rifiutata"].includes(item.status)).length,
    pending: items.filter((item) => item.status === "richiesta").length,
    // Una proposta del coach aspetta una risposta *tua*: sta in un contatore
    // suo, altrimenti si confonde con le richieste in mano al coach.
    toDecide: items.filter((item) => item.status === "controproposta").length,
    confirmed: items.filter((item) => item.status === "confermata" && item.date >= today).length,
  };
  const statCards: Array<{ label: string; value: number; icon: typeof CalendarDays }> = [
    { label: "Prossime", value: stats.upcoming, icon: CalendarDays },
    { label: "In attesa", value: stats.pending, icon: Clock3 },
    ...(stats.toDecide > 0
      ? [{ label: "Da decidere", value: stats.toDecide, icon: CalendarClock }]
      : []),
    { label: "Confermate", value: stats.confirmed, icon: CheckCircle2 },
  ];

  if (items.length === 0) {
    return (
      <GameEmptyState
        asset="shoes"
        title="Allaccia le scarpe"
        description="Non hai ancora prenotato una lezione. Trova il coach giusto e porta il tuo gioco in campo."
        action={
          <GameCta href="/cerca" showBall arrow tone="ball">
            <Search /> Trova un coach
          </GameCta>
        }
      />
    );
  }

  return (
    <div>
      {/* `auto-fit` invece di tre colonne fisse: la scheda "Da decidere"
          compare solo quando c'è una proposta aperta, e con quattro card una
          griglia a 3 lascerebbe l'ultima sola su una riga. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border border-nebbia/20 bg-carta-alta p-4">
            <Icon className="size-5 text-accent-cyan-ink" aria-hidden />
            <p className="mt-3 font-heading text-3xl font-bold text-calce">{String(value).padStart(2, "0")}</p>
            <p className="font-heading text-[10px] font-bold text-nebbia uppercase">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border border-nebbia/22 bg-carta-bassa p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid gap-3 sm:grid-cols-3">
            <label>
              <span className="mb-1.5 block font-heading text-[10px] font-bold text-nebbia uppercase">Periodo</span>
              <Select value={period} onValueChange={(value) => setPeriod(value as PeriodFilter)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="prossime">Prossime lezioni</SelectItem>
                  <SelectItem value="passate">Lezioni passate</SelectItem>
                  <SelectItem value="tutte">Tutte le date</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label>
              <span className="mb-1.5 block font-heading text-[10px] font-bold text-nebbia uppercase">Stato</span>
              <Select value={status} onValueChange={(value) => setStatus(value as BookingStatus | "tutti")}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="tutti">Tutti gli stati</SelectItem>
                  <SelectItem value="richiesta">In attesa</SelectItem>
                  <SelectItem value="controproposta">Nuovo orario proposto</SelectItem>
                  <SelectItem value="confermata">Confermata</SelectItem>
                  <SelectItem value="rifiutata">Rifiutata</SelectItem>
                  <SelectItem value="annullata">Annullata</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label>
              <span className="mb-1.5 block font-heading text-[10px] font-bold text-nebbia uppercase">Formato</span>
              <Select value={type} onValueChange={(value) => setType(value as BookingType | "tutti")}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="tutti">Tutti i formati</SelectItem>
                  <SelectItem value="singolo">Lezione singola</SelectItem>
                  <SelectItem value="gruppo">Lezione di gruppo</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>

          <div className="flex border border-nebbia/22 bg-carta-alta p-1" aria-label="Scegli la visualizzazione">
            {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={view === value}
                onClick={() => setView(value)}
                className={cn(
                  "flex min-h-10 items-center gap-2 px-3 font-heading text-[10px] font-bold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-vetro",
                  view === value ? "bg-game-blue text-game-white" : "text-nebbia hover:text-calce"
                )}
              >
                <Icon className="size-4" aria-hidden />
                <span className="hidden xl:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex min-h-9 items-center justify-between gap-3">
          <p className="text-sm text-nebbia" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "lezione trovata" : "lezioni trovate"}
          </p>
          {filtersActive && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="font-heading text-[10px] uppercase">
              Azzera filtri
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <GameEmptyState
            asset="pickupTube"
            title="Nessuna lezione con questi filtri"
            description="Prova a cambiare periodo, stato o formato per ritrovare le tue prenotazioni."
            action={
              <GameCta
                tone="quiet"
                onClick={resetFilters}
              >
                Azzera filtri
              </GameCta>
            }
          />
        ) : view === "lista" ? (
          <div className="grid gap-4">{filtered.map((item) => <LessonCard key={item.id} item={item} />)}</div>
        ) : view === "calendario" ? (
          <CalendarView items={filtered} visibleMonth={visibleMonth} onMonthChange={setVisibleMonth} />
        ) : (
          <AgendaView items={filtered} />
        )}
      </div>
    </div>
  );
}
