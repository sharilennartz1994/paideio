import "server-only";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "./db";
import { users, coachProfiles, locations, availabilitySlots, availabilityClosures, bookings, reviews, favorites, notifications } from "./db/schema";

export { LEVELS, TRAINING_TYPES, dayName, parseJsonArray, levelBadgeClass, BOOKING_STATUS_CONFIG } from "./constants";
export type { Level, TrainingType } from "./constants";
import type { Level, TrainingType } from "./constants";
import {
  parseJsonArray,
  toLocalDateString,
  haversineDistanceKm,
  computeSlotOccupancy,
  coachOffersLessons,
  closureKey,
  isSlotClosed,
  canReviewBooking,
  DEFAULT_GROUP_CAPACITY,
} from "./constants";

const DEFAULT_SEARCH_RADIUS_KM = 50;

export async function getNotificationsForUser(userId: string) {
  return db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: [desc(notifications.createdAt)],
    limit: 50,
  });
}

export async function getUnreadNotificationCount(userId: string) {
  const unread = await db.query.notifications.findMany({
    where: and(eq(notifications.userId, userId), isNull(notifications.readAt)),
    columns: { id: true },
  });
  return unread.length;
}

export type RatingSummary = { average: number | null; count: number };

export async function getCoachRatingSummary(coachId: string): Promise<RatingSummary> {
  const rows = await db.query.reviews.findMany({ where: eq(reviews.coachId, coachId) });
  if (rows.length === 0) return { average: null, count: 0 };
  const sum = rows.reduce((acc, r) => acc + r.rating, 0);
  return { average: sum / rows.length, count: rows.length };
}

export type CoachSearchResult = {
  coach: typeof users.$inferSelect;
  profile: typeof coachProfiles.$inferSelect;
  locations: (typeof locations.$inferSelect)[];
  distanceKm: number | null;
  rating: RatingSummary;
  /** Ha almeno un turno settimanale pubblicato. */
  hasPublishedAvailability: boolean;
  /** Ha dichiarato tipi di lezione e livelli: senza, nulla è prenotabile. */
  offersLessons: boolean;
};

/**
 * Coach che hanno pubblicato almeno un turno. Una sola query per tutta la
 * ricerca invece di un conteggio per coach: la lista è piccola e questo evita
 * di aggiungere un N+1 a quello già presente in `loadCoachCard`.
 */
async function loadCoachIdsWithAvailability(): Promise<Set<string>> {
  const rows = await db.query.availabilitySlots.findMany({ columns: { coachId: true } });
  return new Set(rows.map((row) => row.coachId));
}

export async function coachHasPublishedAvailability(coachId: string): Promise<boolean> {
  const slot = await db.query.availabilitySlots.findFirst({
    where: eq(availabilitySlots.coachId, coachId),
    columns: { id: true },
  });
  return slot != null;
}

async function loadCoachCard(
  coach: typeof users.$inferSelect,
  near?: { lat: number; lng: number },
  hasPublishedAvailability = false
): Promise<(CoachSearchResult & { locations: (typeof locations.$inferSelect)[] }) | null> {
  // Il profilo decide se il coach è mostrabile; locations e rating sono
  // indipendenti tra loro e dal profilo, quindi si caricano in parallelo.
  const [profile, coachLocations, rating] = await Promise.all([
    db.query.coachProfiles.findFirst({ where: eq(coachProfiles.userId, coach.id) }),
    db.query.locations.findMany({ where: eq(locations.coachId, coach.id) }),
    getCoachRatingSummary(coach.id),
  ]);
  if (!profile) return null;

  let distanceKm: number | null = null;
  if (near) {
    const distances = coachLocations
      .filter((l) => l.lat != null && l.lng != null)
      .map((l) => haversineDistanceKm(near.lat, near.lng, l.lat!, l.lng!));
    distanceKm = distances.length > 0 ? Math.min(...distances) : null;
  }

  return {
    coach,
    profile,
    locations: coachLocations,
    distanceKm,
    rating,
    hasPublishedAvailability,
    offersLessons: coachOffersLessons(
      parseJsonArray(profile.levels),
      parseJsonArray(profile.trainingTypes)
    ),
  };
}

export type CoachSort = "rating" | "distance" | "price";

export async function searchCoaches(filters: {
  city?: string;
  type?: TrainingType;
  level?: Level;
  near?: { lat: number; lng: number; radiusKm?: number };
  sort?: CoachSort;
  maxPrice?: number;
}): Promise<CoachSearchResult[]> {
  const [allCoaches, coachIdsWithAvailability] = await Promise.all([
    db.query.users.findMany({ where: eq(users.role, "coach") }),
    loadCoachIdsWithAvailability(),
  ]);
  const radiusKm = filters.near?.radiusKm ?? DEFAULT_SEARCH_RADIUS_KM;

  const results: CoachSearchResult[] = [];
  for (const coach of allCoaches) {
    // Un coach senza turni pubblicati non è prenotabile: mostrarlo in ricerca
    // con la CTA "Prenota" porta il giocatore su un calendario vuoto. Resta
    // raggiungibile dal link diretto e dai preferiti già salvati.
    if (!coachIdsWithAvailability.has(coach.id)) continue;

    const card = await loadCoachCard(coach, filters.near, true);
    if (!card) continue;
    // Stesso motivo, caso più insidioso: con i turni pubblicati ma senza tipi
    // di lezione e livelli il calendario si popola di slot tutti non
    // disponibili. Da fuori sembra un guasto.
    if (!card.offersLessons) continue;

    if (filters.near) {
      if (card.distanceKm == null || card.distanceKm > radiusKm) continue;
    } else if (
      filters.city &&
      !card.locations.some((l) => l.city.toLowerCase().includes(filters.city!.toLowerCase()))
    ) {
      continue;
    }

    if (filters.type && !parseJsonArray(card.profile.trainingTypes).includes(filters.type)) continue;
    if (filters.level && !parseJsonArray(card.profile.levels).includes(filters.level)) continue;
    if (filters.maxPrice != null && card.profile.pricePerLesson != null && card.profile.pricePerLesson > filters.maxPrice) {
      continue;
    }

    results.push(card);
  }

  if (filters.sort === "rating") {
    results.sort(
      (a, b) => (b.rating.average ?? -Infinity) - (a.rating.average ?? -Infinity)
    );
  } else if (filters.sort === "price") {
    results.sort(
      (a, b) => (a.profile.pricePerLesson ?? Infinity) - (b.profile.pricePerLesson ?? Infinity)
    );
  } else if (filters.near) {
    // Modalità "vicino a me" (anche con sort === "distance" esplicito o assente)
    results.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }

  return results;
}

export async function getFavoriteCoaches(playerId: string): Promise<CoachSearchResult[]> {
  const [favoriteRows, coachIdsWithAvailability] = await Promise.all([
    db.query.favorites.findMany({ where: eq(favorites.playerId, playerId) }),
    loadCoachIdsWithAvailability(),
  ]);
  const results: CoachSearchResult[] = [];
  for (const fav of favoriteRows) {
    const coach = await db.query.users.findFirst({ where: eq(users.id, fav.coachId) });
    if (!coach) continue;
    // Al contrario della ricerca, qui i coach senza turni restano visibili: è
    // esattamente il motivo per cui il giocatore li ha salvati.
    const card = await loadCoachCard(coach, undefined, coachIdsWithAvailability.has(coach.id));
    if (card) results.push(card);
  }
  return results;
}

export async function getFavoriteCoachIds(playerId: string): Promise<Set<string>> {
  const rows = await db.query.favorites.findMany({ where: eq(favorites.playerId, playerId) });
  return new Set(rows.map((r) => r.coachId));
}

export async function getCoachDetail(coachId: string) {
  const coach = await db.query.users.findFirst({ where: eq(users.id, coachId) });
  if (!coach || coach.role !== "coach") return null;

  const profile = await db.query.coachProfiles.findFirst({
    where: eq(coachProfiles.userId, coachId),
  });
  if (!profile) return null;

  const [coachLocations, slots, rating, coachBookings] = await Promise.all([
    db.query.locations.findMany({ where: eq(locations.coachId, coachId) }),
    db.query.availabilitySlots.findMany({ where: eq(availabilitySlots.coachId, coachId) }),
    getCoachRatingSummary(coachId),
    db.query.bookings.findMany({
      where: and(eq(bookings.coachId, coachId), eq(bookings.status, "confermata")),
    }),
  ]);

  // Stessa semantica di "lezione completata" usata per traguardi e recensioni:
  // confermata con data di oggi o passata.
  const today = toLocalDateString(new Date());
  const lessonsCompleted = coachBookings.filter((b) => b.date <= today).length;

  return { coach, profile, locations: coachLocations, slots, rating, lessonsCompleted };
}

export async function getCoachReviews(coachId: string) {
  const rows = await db.query.reviews.findMany({ where: eq(reviews.coachId, coachId) });
  const withPlayer = await Promise.all(
    rows.map(async (r) => {
      const player = await db.query.users.findFirst({ where: eq(users.id, r.playerId) });
      return { review: r, player };
    })
  );
  return withPlayer.sort((a, b) => b.review.createdAt.localeCompare(a.review.createdAt));
}

export type CalendarSlot = {
  date: string; // YYYY-MM-DD
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  locationId: string;
  locationName: string;
  /** Non prenotabile: singola in esclusiva, gruppo al completo o niente offerto. */
  booked: boolean;
  bookedType: TrainingType | null;
  seatsTaken: number;
  capacity: number;
  availableTypes: TrainingType[];
};

/** Chiave di uno slot-istanza: giorno concreto + campo + fascia oraria. */
export function slotKey(date: string, locationId: string | null, startTime: string, endTime: string) {
  return `${date}|${locationId}|${startTime}|${endTime}`;
}

/** Istanza concreta di uno slot, con lo stato di chiusura per l'area coach. */
export type ScheduleSlot = CalendarSlot & {
  closed: boolean;
  /** Chiusa perché è chiusa l'intera giornata, non il singolo turno. */
  closedWholeDay: boolean;
  /** Prenotazioni ancora attive su questa istanza. */
  activeBookings: number;
};

/**
 * Genera le istanze concrete dei turni ricorrenti nella finestra richiesta,
 * annotate con occupazione e chiusure. `getCoachCalendar` scarta le chiuse
 * (il giocatore non deve vederle), `getCoachSchedule` le tiene (il coach deve
 * poterle riaprire): stessa sorgente per non farle divergere.
 */
async function buildCoachSchedule(coachId: string, daysAhead: number): Promise<ScheduleSlot[]> {
  const coachLocations = await db.query.locations.findMany({
    where: eq(locations.coachId, coachId),
  });
  const locationById = new Map(coachLocations.map((l) => [l.id, l]));

  const slots = await db.query.availabilitySlots.findMany({
    where: eq(availabilitySlots.coachId, coachId),
  });

  const profile = await db.query.coachProfiles.findFirst({
    where: eq(coachProfiles.userId, coachId),
  });
  const groupCapacity = profile?.groupCapacity ?? DEFAULT_GROUP_CAPACITY;
  const coachTrainingTypes = parseJsonArray(profile?.trainingTypes ?? "[]");

  const closures = await db.query.availabilityClosures.findMany({
    where: eq(availabilityClosures.coachId, coachId),
  });
  const closedKeys = new Set(
    closures.map((c) => closureKey(c.date, c.locationId, c.startTime))
  );
  const wholeDayClosed = new Set(
    closures.filter((c) => c.locationId == null).map((c) => c.date)
  );

  const existingBookings = await db.query.bookings.findMany({
    where: and(eq(bookings.coachId, coachId), inArray(bookings.status, ["richiesta", "confermata"])),
  });
  // Uno slot può ospitare più prenotazioni (gruppo), quindi non basta un Set di
  // chiavi occupate: serve la lista dei tipi attivi per calcolare i posti.
  const activeTypesByKey = new Map<string, string[]>();
  for (const booking of existingBookings) {
    const key = slotKey(booking.date, booking.locationId, booking.startTime, booking.endTime);
    const current = activeTypesByKey.get(key);
    if (current) current.push(booking.type);
    else activeTypesByKey.set(key, [booking.type]);
  }

  const result: ScheduleSlot[] = [];
  // Dati storici o richieste concorrenti possono aver prodotto turni
  // ricorrenti identici. Il calendario pubblico deve comunque mostrare un
  // solo slot prenotabile, evitando anche chiavi React duplicate.
  const generatedKeys = new Set<string>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    const dateStr = toLocalDateString(date);

    for (const slot of slots) {
      if (slot.dayOfWeek !== dayOfWeek) continue;
      const location = locationById.get(slot.locationId);
      if (!location) continue;

      const key = slotKey(dateStr, slot.locationId, slot.startTime, slot.endTime);
      if (generatedKeys.has(key)) continue;
      generatedKeys.add(key);

      const activeTypes = activeTypesByKey.get(key) ?? [];
      const occupancy = computeSlotOccupancy(activeTypes, groupCapacity, coachTrainingTypes);
      result.push({
        date: dateStr,
        dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        locationId: slot.locationId,
        locationName: location.name,
        booked: occupancy.full,
        bookedType: occupancy.bookedType,
        seatsTaken: occupancy.seatsTaken,
        capacity: occupancy.capacity,
        availableTypes: occupancy.availableTypes,
        closed: isSlotClosed(closedKeys, dateStr, slot.locationId, slot.startTime),
        closedWholeDay: wholeDayClosed.has(dateStr),
        activeBookings: activeTypes.length,
      });
    }
  }

  return result.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
}

export async function getCoachCalendar(coachId: string, daysAhead = 21): Promise<CalendarSlot[]> {
  const schedule = await buildCoachSchedule(coachId, daysAhead);
  return schedule.filter((slot) => !slot.closed);
}

/** Vista del coach: include le istanze chiuse, che deve poter riaprire. */
export async function getCoachSchedule(coachId: string, daysAhead = 28): Promise<ScheduleSlot[]> {
  return buildCoachSchedule(coachId, daysAhead);
}

/**
 * Giornate chiuse per intero, comprese quelle in cui il coach non ha turni
 * ricorrenti: senza questa lista sparirebbero dall'interfaccia e non si
 * potrebbero più riaprire.
 */
export async function getCoachClosedDays(coachId: string, daysAhead = 28): Promise<string[]> {
  const today = toLocalDateString(new Date());
  const limit = new Date();
  limit.setHours(0, 0, 0, 0);
  limit.setDate(limit.getDate() + daysAhead - 1);
  const rows = await db.query.availabilityClosures.findMany({
    where: eq(availabilityClosures.coachId, coachId),
  });
  const limitStr = toLocalDateString(limit);
  return rows
    .filter((r) => r.locationId == null && r.date >= today && r.date <= limitStr)
    .map((r) => r.date)
    .sort();
}

export async function getBookingsForPlayer(playerId: string) {
  const rows = await db.query.bookings.findMany({ where: eq(bookings.playerId, playerId) });
  const reviewedBookingIds = new Set(
    (await db.query.reviews.findMany({ where: eq(reviews.playerId, playerId) })).map((r) => r.bookingId)
  );
  const today = toLocalDateString(new Date());
  const withDetails = await Promise.all(
    rows.map(async (b) => {
      const coach = await db.query.users.findFirst({ where: eq(users.id, b.coachId) });
      const coachProfile = await db.query.coachProfiles.findFirst({ where: eq(coachProfiles.userId, b.coachId) });
      const location = b.locationId
        ? await db.query.locations.findFirst({ where: eq(locations.id, b.locationId) })
        : undefined;
      const canReview = canReviewBooking(b, today, reviewedBookingIds.has(b.id));
      return {
        booking: b,
        coach,
        coachAvatarUrl: coachProfile?.avatarUrl ?? null,
        location,
        canReview,
        isReviewed: reviewedBookingIds.has(b.id),
      };
    })
  );
  return withDetails.sort((a, b) => (a.booking.date + a.booking.startTime).localeCompare(b.booking.date + b.booking.startTime));
}

/**
 * Quante lezioni svolte con questo coach il giocatore può ancora recensire.
 * Serve al profilo pubblico: la sezione "Recensioni" invitava a lasciarne una
 * senza offrire alcun modo di farlo.
 */
export async function countReviewableBookingsWithCoach(playerId: string, coachId: string): Promise<number> {
  const rows = await db.query.bookings.findMany({
    where: and(eq(bookings.playerId, playerId), eq(bookings.coachId, coachId)),
  });
  if (rows.length === 0) return 0;
  const reviewedBookingIds = new Set(
    (await db.query.reviews.findMany({ where: eq(reviews.playerId, playerId) })).map((r) => r.bookingId)
  );
  const today = toLocalDateString(new Date());
  return rows.filter((b) => canReviewBooking(b, today, reviewedBookingIds.has(b.id))).length;
}

export async function getBookingsForCoach(coachId: string) {
  const rows = await db.query.bookings.findMany({ where: eq(bookings.coachId, coachId) });
  const withDetails = await Promise.all(
    rows.map(async (b) => {
      const player = await db.query.users.findFirst({ where: eq(users.id, b.playerId) });
      const location = b.locationId
        ? await db.query.locations.findFirst({ where: eq(locations.id, b.locationId) })
        : undefined;
      return { booking: b, player, location };
    })
  );
  return withDetails.sort((a, b) => (a.booking.date + a.booking.startTime).localeCompare(b.booking.date + b.booking.startTime));
}

export async function getPendingRequestCount(coachId: string): Promise<number> {
  const rows = await db.query.bookings.findMany({
    where: and(eq(bookings.coachId, coachId), eq(bookings.status, "richiesta")),
  });
  return rows.length;
}

export type CoachAdminStats = {
  pendingRequests: number;
  confirmedThisWeek: number;
  rating: RatingSummary;
};

export async function getCoachAdminStats(coachId: string): Promise<CoachAdminStats> {
  const [rows, rating] = await Promise.all([
    db.query.bookings.findMany({ where: eq(bookings.coachId, coachId) }),
    getCoachRatingSummary(coachId),
  ]);

  const pendingRequests = rows.filter((b) => b.status === "richiesta").length;

  // Settimana corrente lun-dom (stessa convenzione dello streak dei traguardi)
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const mondayStr = toLocalDateString(monday);
  const sundayStr = toLocalDateString(sunday);
  const confirmedThisWeek = rows.filter(
    (b) => b.status === "confermata" && b.date >= mondayStr && b.date <= sundayStr
  ).length;

  return { pendingRequests, confirmedThisWeek, rating };
}

export type Achievement = {
  id: string;
  label: string;
  description: string;
  earned: boolean;
};

export async function getPlayerAchievements(playerId: string): Promise<Achievement[]> {
  const rows = await db.query.bookings.findMany({ where: eq(bookings.playerId, playerId) });
  const today = toLocalDateString(new Date());
  const completed = rows.filter((b) => b.status === "confermata" && b.date <= today);

  const byCoach = new Map<string, number>();
  for (const b of completed) {
    byCoach.set(b.coachId, (byCoach.get(b.coachId) ?? 0) + 1);
  }
  const maxWithSameCoach = Math.max(0, ...byCoach.values());

  // settimane consecutive (lun-dom) con almeno una lezione completata
  const weekKeys = new Set(
    completed.map((b) => {
      const d = new Date(`${b.date}T00:00:00`);
      const day = (d.getDay() + 6) % 7; // 0 = lunedì
      const monday = new Date(d);
      monday.setDate(d.getDate() - day);
      return toLocalDateString(monday);
    })
  );
  let streak = 0;
  const cursor = new Date();
  const cursorDay = (cursor.getDay() + 6) % 7;
  cursor.setDate(cursor.getDate() - cursorDay); // lunedì di questa settimana
  while (weekKeys.has(toLocalDateString(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }

  const total = completed.length;

  return [
    {
      id: "prima-lezione",
      label: "Prima lezione",
      description: "Completa la tua prima lezione",
      earned: total >= 1,
    },
    {
      id: "cinque-lezioni",
      label: "5 lezioni",
      description: "Completa 5 lezioni",
      earned: total >= 5,
    },
    {
      id: "dieci-lezioni",
      label: "10 lezioni",
      description: "Completa 10 lezioni",
      earned: total >= 10,
    },
    {
      id: "venticinque-lezioni",
      label: "25 lezioni",
      description: "Completa 25 lezioni",
      earned: total >= 25,
    },
    {
      id: "fedelissimo",
      label: "Fedelissimo",
      description: "3 lezioni con lo stesso coach",
      earned: maxWithSameCoach >= 3,
    },
    {
      id: "streak",
      label: "In forma",
      description: "Una lezione a settimana per 3 settimane di fila",
      earned: streak >= 3,
    },
  ];
}
