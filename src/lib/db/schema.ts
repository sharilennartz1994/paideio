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
  // JSON-encoded string[] - e.g. ["principiante","intermedio"]
  levels: text("levels").notNull().default("[]"),
  // JSON-encoded string[] - subset of ["singolo","gruppo"]
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

/**
 * Eccezioni al calendario ricorrente: il coach pubblica "ogni lunedì 18-19",
 * ma un lunedì preciso non può esserci. Una riga qui chiude una data.
 *
 * - `locationId`/`startTime`/`endTime` valorizzati → chiude quella singola
 *   istanza di slot (giorno + campo + fascia).
 * - tutti e tre `null` → chiude l'intera giornata, compresi i turni aggiunti
 *   dopo la chiusura.
 *
 * Non tocca `availability_slots`: la ricorrenza resta intatta e la chiusura si
 * può revocare senza doverla ricostruire.
 */
export const availabilityClosures = pgTable(
  "availability_closures",
  {
    id: text("id").primaryKey(),
    coachId: text("coach_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // "YYYY-MM-DD"
    locationId: text("location_id").references(() => locations.id, { onDelete: "cascade" }),
    startTime: text("start_time"),
    endTime: text("end_time"),
    reason: text("reason").notNull().default(""),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("availability_closures_coach_date_idx").on(table.coachId, table.date),
    // Due indici parziali invece di uno solo: in Postgres i NULL sono distinti
    // tra loro, quindi un unico indice su colonne nullable lascerebbe passare
    // chiusure giornaliere duplicate.
    uniqueIndex("availability_closures_day_idx")
      .on(table.coachId, table.date)
      .where(sql`location_id IS NULL`),
    uniqueIndex("availability_closures_slot_idx")
      .on(table.coachId, table.date, table.locationId, table.startTime)
      .where(sql`location_id IS NOT NULL`),
  ]
);

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
      enum: ["richiesta", "confermata", "rifiutata", "annullata", "controproposta"],
    })
      .notNull()
      .default("richiesta"),
    notes: text("notes").notNull().default(""),
    // Motivazione del coach quando rifiuta o quando propone un altro orario.
    // Una sola colonna per i due casi: è sempre "perché non va bene così".
    coachMessage: text("coach_message").notNull().default(""),
    // Orario alternativo proposto dal coach. Valorizzato solo mentre lo stato è
    // `controproposta`; si azzera quando il giocatore accetta o rifiuta.
    //
    // Sta qui e non in una tabella a parte apposta: la proposta non è una
    // seconda prenotazione, è la stessa lezione in attesa di un orario. Con una
    // riga separata ci sarebbero due macchine a stati da tenere allineate
    // (`bookings.status` e lo stato della proposta) e l'accettazione dovrebbe
    // comunque aggiornare questa riga. Vedi AGENTS.md, "Proposte di orario".
    proposedDate: text("proposed_date"), // "YYYY-MM-DD"
    proposedStartTime: text("proposed_start_time"),
    proposedEndTime: text("proposed_end_time"),
    createdAt: text("created_at").notNull(),
    // Colonne **generate**, derivate da `start_time`/`end_time`: esistono solo
    // per il vincolo di esclusione GiST `bookings_no_overlap`, che ha bisogno
    // di un `int4range` e di una chiave lezione confrontabili.
    //
    // Sono dichiarate qui, e non solo nello script SQL che crea il vincolo,
    // perché altrimenti `drizzle-kit push` le vede come colonne estranee e a
    // ogni push propone di cancellarle: il vincolo dipende da tutte e tre,
    // quindi la cancellazione o fallisce a metà o lascia la produzione senza
    // protezione contro le sovrapposizioni. Dichiararle rende il push muto.
    //
    // Il vincolo vero resta in `scripts/db-apply-overlap-constraint.mts`:
    // `drizzle-kit` non sa generare gli EXCLUDE.
    startMinutes: integer("start_minutes").generatedAlwaysAs(
      sql`substring(start_time from 1 for 2)::int * 60 + substring(start_time from 4 for 2)::int`
    ),
    endMinutes: integer("end_minutes").generatedAlwaysAs(
      sql`substring(end_time from 1 for 2)::int * 60 + substring(end_time from 4 for 2)::int`
    ),
    lessonKey: text("lesson_key").generatedAlwaysAs(sql`start_time || '-' || end_time`),
  },
  (table) => [
    // Una lezione singola occupa il campo in esclusiva: al massimo una attiva
    // con lo stesso inizio. Indice parziale, quindi rifiutate/annullate non
    // bloccano nulla. `controproposta` è fuori dall'insieme "attivo" apposta:
    // una proposta pendente non è ancora una prenotazione e non deve togliere
    // l'orario agli altri giocatori.
    uniqueIndex("bookings_active_single_slot_idx")
      .on(table.coachId, table.locationId, table.date, table.startTime)
      .where(sql`status IN ('richiesta', 'confermata') AND type = 'singolo'`),
    // Le lezioni di gruppo condividono la lezione, ma un giocatore non può
    // occupare due posti nella stessa. La capienza massima non è esprimibile
    // come indice: la impone `createBooking` sotto advisory lock.
    uniqueIndex("bookings_active_player_slot_idx")
      .on(table.coachId, table.locationId, table.date, table.startTime, table.playerId)
      .where(sql`status IN ('richiesta', 'confermata')`),
    // NOTA: il divieto di **sovrapposizione** tra lezioni di durata diversa non
    // è esprimibile con un indice unico (una singola 9:00-10:30 e una
    // 9:30-11:00 hanno inizi diversi ma si accavallano). Lo impone un vincolo
    // di esclusione GiST che drizzle-kit non sa generare: vive in
    // `scripts/db-apply-overlap-constraint.mts`, da rilanciare dopo ogni
    // `db:push`. Vedi AGENTS.md, sezione "Finestre di disponibilità".
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
    type: text("type", {
      enum: [
        "booking_created",
        "booking_cancelled",
        "booking_rejected",
        "booking_proposed",
        "booking_proposal_accepted",
        "booking_proposal_declined",
      ],
    }).notNull(),
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
