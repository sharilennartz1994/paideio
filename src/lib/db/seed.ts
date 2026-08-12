import { randomUUID } from "node:crypto";
import { isNull } from "drizzle-orm";
import { db } from "./index";
import {
  users,
  coachProfiles,
  locations,
  availabilitySlots,
  bookings,
  reviews,
  favorites,
} from "./schema";
import { toLocalDateString } from "../constants";

function id() {
  return randomUUID();
}

async function seed() {
  console.log("Svuoto i coach demo (solo utenti senza account Clerk collegato)...");
  // Elimina solo gli utenti demo del seed (clerkId nullo). Le righe collegate a
  // account Clerk reali (bookings, reviews, favorites inclusi) restano intatte:
  // la cascade su onDelete cancella comunque i dati dipendenti dei soli demo.
  await db.delete(users).where(isNull(users.clerkId));

  const now = new Date().toISOString();

  console.log("Creo coach demo (annunci pubblici, senza account Clerk collegato)...");
  const coachesData = [
    {
      name: "Elena Ferraro",
      email: "elena@example.com",
      bio: "Ex agonista, specializzata in perfezionamento tecnico e preparazione tattica.",
      levels: ["intermedio", "avanzato"],
      trainingTypes: ["singolo", "gruppo"],
      pricePerLesson: 52,
      groupCapacity: 4,
      city: "Milano",
      locations: [
        { name: "Padel Club Milano Nord", address: "Via dei Platani 12, Milano", lat: 45.5145, lng: 9.1755 },
      ],
      // Fasce, non lezioni: il giocatore ci ritaglia dentro 60 o 90 minuti.
      // La prima è volutamente lunga, per vedere il caso "giornata intera".
      slots: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "20:00" },
        { dayOfWeek: 3, startTime: "17:00", endTime: "21:00" },
        { dayOfWeek: 6, startTime: "09:00", endTime: "13:00" },
      ],
    },
    {
      name: "Davide Conti",
      email: "davide@example.com",
      bio: "Istruttore FIT, lavoro molto con principianti e gruppi amatoriali.",
      levels: ["principiante", "intermedio"],
      trainingTypes: ["gruppo"],
      pricePerLesson: 35,
      // Capienza bassa apposta: rende facile verificare il "gruppo al completo".
      groupCapacity: 2,
      city: "Milano",
      locations: [
        { name: "Smash Padel Arena", address: "Viale Certosa 88, Milano", lat: 45.495, lng: 9.15 },
      ],
      slots: [
        { dayOfWeek: 2, startTime: "18:00", endTime: "22:00" },
        { dayOfWeek: 4, startTime: "18:00", endTime: "22:00" },
        { dayOfWeek: 0, startTime: "10:00", endTime: "13:00" },
      ],
    },
    {
      name: "Giulia Romano",
      email: "giulia@example.com",
      bio: "Coach personal training, allenamenti individuali su misura per tutti i livelli.",
      levels: ["principiante", "intermedio", "avanzato"],
      trainingTypes: ["singolo"],
      pricePerLesson: 45,
      groupCapacity: 4,
      city: "Torino",
      locations: [
        { name: "Padel Center Torino", address: "Corso Francia 200, Torino", lat: 45.08, lng: 7.63 },
      ],
      slots: [
        { dayOfWeek: 1, startTime: "08:00", endTime: "13:00" },
        { dayOfWeek: 5, startTime: "08:00", endTime: "13:00" },
      ],
    },
  ];

  const seededCoaches: Array<{ id: string; locationId: string }> = [];
  for (const c of coachesData) {
    const coachId = id();
    await db.insert(users).values({ id: coachId, name: c.name, email: c.email, role: "coach", createdAt: now });
    await db.insert(coachProfiles).values({
      userId: coachId,
      bio: c.bio,
      levels: JSON.stringify(c.levels),
      trainingTypes: JSON.stringify(c.trainingTypes),
      pricePerLesson: c.pricePerLesson,
      groupCapacity: c.groupCapacity,
    });

    for (const loc of c.locations) {
      const locationId = id();
      seededCoaches.push({ id: coachId, locationId });
      await db.insert(locations).values({
        id: locationId,
        coachId,
        name: loc.name,
        address: loc.address,
        city: c.city,
        lat: loc.lat,
        lng: loc.lng,
      });

      for (const slot of c.slots) {
        await db.insert(availabilitySlots).values({
          id: id(),
          coachId,
          locationId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
      }
    }
  }

  console.log("Creo giocatori e scenari di prenotazione demo...");
  const playerOneId = id();
  const playerTwoId = id();
  await db.insert(users).values([
    {
      id: playerOneId,
      name: "Luca Bianchi",
      email: "luca.player@example.com",
      role: "player",
      createdAt: now,
    },
    {
      id: playerTwoId,
      name: "Marta Esposito",
      email: "marta.player@example.com",
      role: "player",
      createdAt: now,
    },
  ]);

  const dateFromToday = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return toLocalDateString(date);
  };

  const completedBookingId = id();
  const pendingBookingId = id();
  await db.insert(bookings).values([
    {
      id: pendingBookingId,
      playerId: playerOneId,
      coachId: seededCoaches[0].id,
      locationId: seededCoaches[0].locationId,
      date: dateFromToday(5),
      startTime: "17:00",
      endTime: "21:00",
      type: "singolo",
      level: "intermedio",
      status: "richiesta",
      notes: "Vorrei lavorare su uscita dal vetro e transizione verso la rete.",
      createdAt: now,
    },
    {
      id: id(),
      playerId: playerTwoId,
      coachId: seededCoaches[0].id,
      locationId: seededCoaches[0].locationId,
      date: dateFromToday(8),
      startTime: "09:00",
      endTime: "12:00",
      type: "gruppo",
      level: "avanzato",
      status: "confermata",
      notes: "Preparazione tattica per un torneo.",
      createdAt: now,
    },
    {
      id: completedBookingId,
      playerId: playerOneId,
      coachId: seededCoaches[1].id,
      locationId: seededCoaches[1].locationId,
      date: dateFromToday(-12),
      startTime: "18:00",
      endTime: "22:00",
      type: "gruppo",
      level: "principiante",
      status: "confermata",
      notes: "",
      createdAt: now,
    },
    {
      id: id(),
      playerId: playerTwoId,
      coachId: seededCoaches[2].id,
      locationId: seededCoaches[2].locationId,
      date: dateFromToday(-20),
      startTime: "08:00",
      endTime: "13:00",
      type: "singolo",
      level: "intermedio",
      status: "annullata",
      notes: "",
      createdAt: now,
    },
  ]);

  await db.insert(reviews).values({
    id: id(),
    bookingId: completedBookingId,
    playerId: playerOneId,
    coachId: seededCoaches[1].id,
    rating: 5,
    comment: "Spiegazioni chiare e progressioni adatte al mio livello.",
    createdAt: now,
  });
  await db.insert(favorites).values({
    id: id(),
    playerId: playerOneId,
    coachId: seededCoaches[0].id,
    createdAt: now,
  });

  console.log("Seed completato.");
  console.log(`Coach demo: ${coachesData.map((c) => c.email).join(", ")}`);
  console.log("Scenari: richiesta, confermata futura, completata con recensione, annullata e preferito.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
