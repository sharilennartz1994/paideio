export const LEVELS = ["principiante", "intermedio", "avanzato"] as const;
export type Level = (typeof LEVELS)[number];

export const TRAINING_TYPES = ["singolo", "gruppo"] as const;
export type TrainingType = (typeof TRAINING_TYPES)[number];

export const DEFAULT_GROUP_CAPACITY = 4;
export const MIN_GROUP_CAPACITY = 2;
export const MAX_GROUP_CAPACITY = 12;

/**
 * Durate prenotabili, in minuti. Il coach pubblica una **finestra** ampia (es.
 * 9-20) e il giocatore ci ritaglia dentro una lezione di una di queste durate.
 */
export const LESSON_DURATIONS = [60, 90] as const;
export type LessonDuration = (typeof LESSON_DURATIONS)[number];
const SHORTEST_LESSON = Math.min(...LESSON_DURATIONS);

export function minutesFromTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function timeFromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Intervallo occupato, in minuti dalla mezzanotte. `[start, end)`. */
export type Interval = { start: number; end: number };

export function intervalsOverlap(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

export function sameInterval(a: Interval, b: Interval): boolean {
  return a.start === b.start && a.end === b.end;
}

/**
 * Inizi ammessi dentro una finestra, dato ciò che è già occupato.
 *
 * Non è una griglia fissa a mezz'ora: sono gli inizi **raggiungibili
 * impacchettando lezioni** da `LESSON_DURATIONS` a partire dall'inizio di ogni
 * tratto libero. Così non si può mai creare un buco più corto della lezione
 * più breve, che resterebbe invendibile per il coach, ma il giocatore conserva
 * quasi tutta la libertà di scelta (con 60 e 90 gli inizi cadono di mezz'ora
 * in mezz'ora dopo la prima ora).
 *
 * Il tratto libero si ricalcola dopo ogni prenotazione, quindi gli inizi
 * "scalano" dietro alle lezioni già fissate.
 */
export function allowedStarts(
  window: Interval,
  busy: readonly Interval[],
  duration: number
): number[] {
  const gaps = freeGaps(window, busy);
  const starts = new Set<number>();

  for (const gap of gaps) {
    const span = gap.end - gap.start;
    if (span < duration) continue;
    // Offset raggiungibili dall'inizio del tratto sommando durate intere.
    const reachable = reachableOffsets(span);
    for (const offset of reachable) {
      const start = gap.start + offset;
      const end = start + duration;
      if (end > gap.end) continue;
      const remainder = gap.end - end;
      // Un residuo più corto della lezione minima non sarà mai prenotabile.
      if (remainder !== 0 && remainder < SHORTEST_LESSON) continue;
      starts.add(start);
    }
  }
  return [...starts].sort((a, b) => a - b);
}

/** Offset raggiungibili sommando durate intere, entro `span`. Include 0. */
function reachableOffsets(span: number): number[] {
  const found = new Set<number>([0]);
  const queue = [0];
  while (queue.length) {
    const current = queue.shift()!;
    for (const d of LESSON_DURATIONS) {
      const next = current + d;
      if (next <= span && !found.has(next)) {
        found.add(next);
        queue.push(next);
      }
    }
  }
  return [...found].sort((a, b) => a - b);
}

/** Tratti liberi della finestra, tolti gli intervalli occupati. */
export function freeGaps(window: Interval, busy: readonly Interval[]): Interval[] {
  const sorted = [...busy]
    .filter((b) => intervalsOverlap(b, window))
    .sort((a, b) => a.start - b.start);

  const gaps: Interval[] = [];
  let cursor = window.start;
  for (const block of sorted) {
    if (block.start > cursor) gaps.push({ start: cursor, end: Math.min(block.start, window.end) });
    cursor = Math.max(cursor, block.end);
    if (cursor >= window.end) break;
  }
  if (cursor < window.end) gaps.push({ start: cursor, end: window.end });
  return gaps.filter((g) => g.end - g.start >= SHORTEST_LESSON);
}

/**
 * Un coach è prenotabile solo se ha dichiarato **almeno un tipo di lezione e
 * almeno un livello**: `becomeCoach()` crea un `coachProfiles` vuoto, e finché
 * resta tale `computeSlotOccupancy()` marca ogni slot come pieno
 * (`full: offered.length === 0`) e `createBooking()` rifiuta qualunque livello.
 *
 * Senza questo controllo il coach pubblica gli orari, li vede nel calendario e
 * il giocatore li trova tutti non disponibili, senza che nessuno dei due capisca
 * perché. Regola condivisa: la usano la ricerca, il profilo pubblico e l'area
 * coach, così dicono tutte la stessa cosa.
 */
export function coachOffersLessons(
  levels: readonly string[],
  trainingTypes: readonly string[]
): boolean {
  return levels.length > 0 && trainingTypes.length > 0;
}

/**
 * Chiavi di chiusura del calendario. Come `computeSlotOccupancy`, questa è la
 * regola *unica*: la usano `getCoachCalendar` (per non disegnare gli slot
 * chiusi) e `createBooking` (per rifiutarli). Se divergono, il giocatore
 * prenota una data che il coach ha chiuso.
 *
 * Una chiusura di giornata usa `*` al posto di campo e orario, così copre
 * anche i turni pubblicati dopo la chiusura.
 */
export function closureKey(
  date: string,
  locationId: string | null,
  startTime: string | null
): string {
  return `${date}|${locationId ?? "*"}|${startTime ?? "*"}`;
}

export function isSlotClosed(
  closedKeys: ReadonlySet<string>,
  date: string,
  locationId: string,
  startTime: string
): boolean {
  return (
    closedKeys.has(closureKey(date, null, null)) ||
    closedKeys.has(closureKey(date, locationId, startTime))
  );
}

export type SlotOccupancy = {
  /** Posti già occupati sullo slot. Una singola vale sempre 1. */
  seatsTaken: number;
  /** Posti totali: 1 se lo slot è (o diventerà) una lezione singola. */
  capacity: number;
  /** Cosa occupa lo slot adesso; null se è ancora libero. */
  bookedType: TrainingType | null;
  /** Non più prenotabile da nessuno. */
  full: boolean;
  /** Cosa si può ancora prenotare su questo slot. */
  availableTypes: TrainingType[];
};

/**
 * Regola unica di occupazione di uno slot, condivisa da `getCoachCalendar`
 * (per disegnare il calendario) e da `createBooking` (per validare). Tenerle
 * allineate è il punto: se divergono, il calendario mostra prenotabile
 * qualcosa che poi l'action rifiuta.
 *
 * - una lezione **singola** prende il campo in esclusiva: nessun altro entra;
 * - le lezioni di **gruppo** condividono lo slot fino a `groupCapacity`;
 * - uno slot già aperto come gruppo resta di gruppo (niente singola sopra).
 */
export function computeSlotOccupancy(
  activeBookingTypes: readonly string[],
  groupCapacity: number,
  coachTrainingTypes: readonly string[]
): SlotOccupancy {
  const offered = coachTrainingTypes.filter((t): t is TrainingType =>
    (TRAINING_TYPES as readonly string[]).includes(t)
  );

  if (activeBookingTypes.includes("singolo")) {
    return { seatsTaken: 1, capacity: 1, bookedType: "singolo", full: true, availableTypes: [] };
  }

  const seatsTaken = activeBookingTypes.filter((t) => t === "gruppo").length;
  if (seatsTaken > 0) {
    const full = seatsTaken >= groupCapacity;
    return {
      seatsTaken,
      capacity: groupCapacity,
      bookedType: "gruppo",
      full,
      availableTypes: full || !offered.includes("gruppo") ? [] : ["gruppo"],
    };
  }

  return {
    seatsTaken: 0,
    capacity: offered.includes("gruppo") ? groupCapacity : 1,
    bookedType: null,
    full: offered.length === 0,
    availableTypes: offered,
  };
}

const LEVEL_BADGE_CLASSES: Record<string, string> = {
  principiante: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  intermedio: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  avanzato: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};

/** Lezione già fissata dentro una finestra, come la vede il calendario. */
export type BookedLesson = Interval & { type: string; playerId?: string };

export type LessonAvailability = SlotOccupancy & {
  /** Si sovrappone a una lezione diversa: non è ritagliabile qui. */
  blocked: boolean;
};

/**
 * Regola unica di prenotabilità di una lezione candidata dentro una finestra.
 * La usano `getCoachCalendar`/il client (per disegnare gli inizi possibili) e
 * `createBooking` (per validare): se divergono, il giocatore prenota qualcosa
 * che l'action rifiuta.
 *
 * Due lezioni **identiche** (stesso inizio e stessa fine) sono la stessa
 * lezione: è l'unico caso in cui più giocatori possono coesistere, e solo se
 * è di gruppo. Qualunque altra sovrapposizione è un conflitto, perché il campo
 * è occupato.
 */
export function computeLessonAvailability(
  candidate: Interval,
  existing: readonly BookedLesson[],
  groupCapacity: number,
  coachTrainingTypes: readonly string[]
): LessonAvailability {
  const identical = existing.filter((e) => sameInterval(e, candidate));
  const conflicting = existing.filter(
    (e) => intervalsOverlap(e, candidate) && !sameInterval(e, candidate)
  );

  if (conflicting.length > 0) {
    return {
      seatsTaken: 0,
      capacity: 0,
      bookedType: null,
      full: true,
      availableTypes: [],
      blocked: true,
    };
  }

  return {
    ...computeSlotOccupancy(
      identical.map((e) => e.type),
      groupCapacity,
      coachTrainingTypes
    ),
    blocked: false,
  };
}

export function levelBadgeClass(level: string) {
  return LEVEL_BADGE_CLASSES[level] ?? "bg-muted text-muted-foreground";
}

export const BOOKING_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  richiesta: {
    label: "In attesa",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  },
  confermata: {
    label: "Confermata",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  rifiutata: {
    label: "Rifiutata",
    className: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  },
  annullata: {
    label: "Annullata",
    className: "bg-muted text-muted-foreground",
  },
};

/**
 * Recensibilità di una prenotazione. Come per `computeSlotOccupancy()`, la
 * regola sta in **un solo posto**: la usano `getBookingsForPlayer()` (per
 * decidere se mostrare il form), `createReview()` (per validare) e il filtro
 * "Da recensire" di `/prenotazioni`. Se divergono, la pagina offre una
 * recensione che l'action poi rifiuta, o - come è successo - la calcola e non
 * la mostra a nessuno.
 */
export function canReviewBooking(
  booking: { status: string; date: string },
  today: string,
  alreadyReviewed: boolean
): boolean {
  return booking.status === "confermata" && booking.date <= today && !alreadyReviewed;
}

export const BOOKING_PERIODS = ["prossime", "passate", "da-recensire", "tutte"] as const;
export type BookingPeriod = (typeof BOOKING_PERIODS)[number];

export const BOOKING_PERIOD_LABELS: Record<BookingPeriod, string> = {
  prossime: "Prossime lezioni",
  passate: "Lezioni passate",
  "da-recensire": "Da recensire",
  tutte: "Tutte le date",
};

/**
 * Filtro "Periodo" di `/prenotazioni`.
 *
 * **Attenzione al rapporto con `canReviewBooking()`**: il default `prossime` è
 * `date >= today`, la recensibilità è `date <= today`. I due insiemi si
 * toccano solo nel giorno stesso della lezione, quindi dal giorno dopo il
 * pulsante "Lascia una recensione" esisteva ma non era su nessuna schermata
 * raggiungibile senza cambiare il filtro a mano. Da qui il periodo dedicato
 * `da-recensire` e il richiamo in cima alla pagina.
 */
export function matchesBookingPeriod(
  item: { date: string; canReview: boolean },
  period: BookingPeriod,
  today: string
): boolean {
  switch (period) {
    case "prossime":
      return item.date >= today;
    case "passate":
      return item.date < today;
    case "da-recensire":
      return item.canReview;
    case "tutte":
      return true;
  }
}

const DAY_NAMES = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

export function dayName(dayOfWeek: number) {
  return DAY_NAMES[dayOfWeek];
}

export function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
