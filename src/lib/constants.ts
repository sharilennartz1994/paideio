export const LEVELS = ["principiante", "intermedio", "avanzato"] as const;
export type Level = (typeof LEVELS)[number];

export const TRAINING_TYPES = ["singolo", "gruppo"] as const;
export type TrainingType = (typeof TRAINING_TYPES)[number];

export const DEFAULT_GROUP_CAPACITY = 4;
export const MIN_GROUP_CAPACITY = 2;
export const MAX_GROUP_CAPACITY = 12;

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
