import { randomUUID } from "node:crypto";
import { isNull } from "drizzle-orm";
import { db } from "./index";
import { users, coachProfiles, locations, availabilitySlots } from "./schema";

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
      city: "Milano",
      locations: [
        { name: "Padel Club Milano Nord", address: "Via dei Platani 12, Milano", lat: 45.5145, lng: 9.1755 },
      ],
      slots: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
        { dayOfWeek: 1, startTime: "17:00", endTime: "21:00" },
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

  for (const c of coachesData) {
    const coachId = id();
    await db.insert(users).values({ id: coachId, name: c.name, email: c.email, role: "coach", createdAt: now });
    await db.insert(coachProfiles).values({
      userId: coachId,
      bio: c.bio,
      levels: JSON.stringify(c.levels),
      trainingTypes: JSON.stringify(c.trainingTypes),
    });

    for (const loc of c.locations) {
      const locationId = id();
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

  console.log("Seed completato.");
  console.log(`Coach demo: ${coachesData.map((c) => c.email).join(", ")}`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
