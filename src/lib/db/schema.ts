import { sql } from "drizzle-orm";
import { pgTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  // null per gli account demo seedati senza un vero utente Clerk collegato
  clerkId: text("clerk_id").unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["player", "coach"] }).notNull(),
  createdAt: text("created_at").notNull(),
});

export const coachProfiles = pgTable("coach_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio").notNull().default(""),
  // JSON-encoded string[] — e.g. ["principiante","intermedio"]
  levels: text("levels").notNull().default("[]"),
  // JSON-encoded string[] — subset of ["singolo","gruppo"]
  trainingTypes: text("training_types").notNull().default("[]"),
  // URL Vercel Blob; null finché il coach non carica una foto (fallback iniziali)
  avatarUrl: text("avatar_url"),
  // Prezzo per lezione in euro interi; null = non indicato
  pricePerLesson: integer("price_per_lesson"),
  // Posti totali di una lezione di gruppo, configurato dal coach. Le lezioni
  // singole prendono il campo in esclusiva e ignorano questo valore.
  groupCapacity: integer("group_capacity").notNull().default(4),
});

export const locations = pgTable("locations", {
  id: text("id").primaryKey(),
  coachId: text("coach_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  // Coordinate opzionali per la ricerca per posizione; null finché il coach non
  // le imposta (geocoding manuale per ora, vedi coach-admin/campi).
  lat: real("lat"),
  lng: real("lng"),
});

export const availabilitySlots = pgTable("availability_slots", {
  id: text("id").primaryKey(),
  coachId: text("coach_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  locationId: text("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  // 0 = domenica ... 6 = sabato
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(), // "HH:MM"
  endTime: text("end_time").notNull(), // "HH:MM"
});

export const bookings = pgTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    playerId: text("player_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    coachId: text("coach_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Nullable: se il coach elimina il campo, la prenotazione sopravvive
    // (annullata da removeLocation) con locationId azzerato dalla FK.
    locationId: text("location_id").references(() => locations.id, { onDelete: "set null" }),
    date: text("date").notNull(), // "YYYY-MM-DD"
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    type: text("type", { enum: ["singolo", "gruppo"] }).notNull(),
    level: text("level").notNull(),
    status: text("status", {
      enum: ["richiesta", "confermata", "rifiutata", "annullata"],
    })
      .notNull()
      .default("richiesta"),
    notes: text("notes").notNull().default(""),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    // Una lezione singola occupa il campo in esclusiva: al massimo una attiva
    // per slot. Indice parziale, quindi rifiutate/annullate non bloccano nulla.
    uniqueIndex("bookings_active_single_slot_idx")
      .on(table.coachId, table.locationId, table.date, table.startTime)
      .where(sql`status IN ('richiesta', 'confermata') AND type = 'singolo'`),
    // Le lezioni di gruppo condividono lo slot, ma un giocatore non può
    // occupare due posti nella stessa lezione. La capienza massima non è
    // esprimibile come indice: la impone `createBooking` sotto advisory lock.
    uniqueIndex("bookings_active_player_slot_idx")
      .on(table.coachId, table.locationId, table.date, table.startTime, table.playerId)
      .where(sql`status IN ('richiesta', 'confermata')`),
  ]
);

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  // una recensione per prenotazione
  bookingId: text("booking_id")
    .notNull()
    .unique()
    .references(() => bookings.id, { onDelete: "cascade" }),
  playerId: text("player_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  coachId: text("coach_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment").notNull().default(""),
  createdAt: text("created_at").notNull(),
});

export const favorites = pgTable(
  "favorites",
  {
    id: text("id").primaryKey(),
    playerId: text("player_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    coachId: text("coach_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("favorites_player_coach_idx").on(table.playerId, table.coachId)]
);

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookingId: text("booking_id").references(() => bookings.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["booking_created", "booking_cancelled"] }).notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    href: text("href").notNull(),
    readAt: text("read_at"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("notifications_user_created_idx").on(table.userId, table.createdAt),
    index("notifications_user_read_idx").on(table.userId, table.readAt),
  ]
);

export const productFeedback = pgTable(
  "product_feedback",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    category: text("category", {
      enum: ["nuova_feature", "miglioramento", "bug", "altro"],
    }).notNull(),
    message: text("message").notNull(),
    status: text("status", { enum: ["nuovo", "valutato", "pianificato", "chiuso"] })
      .notNull()
      .default("nuovo"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("product_feedback_email_created_idx").on(table.email, table.createdAt),
    index("product_feedback_status_idx").on(table.status),
  ]
);
