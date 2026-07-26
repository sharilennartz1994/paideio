import {
  BookOpen,
  Brain,
  Dumbbell,
  Gavel,
  History,
  PackageOpen,
  Swords,
  Trophy,
} from "@/components/icons/paideio-icons";

export const ACADEMY_SECTIONS = [
  {
    href: "/academy/tecnica",
    title: "Tecnica",
    description: "Fondamentali, pareti e colpi avanzati organizzati per momento di gioco.",
    icon: Swords,
    accent: "cyan" as const,
  },
  {
    href: "/academy/strategia",
    title: "Strategia",
    description: "Posizione, movimento di coppia e scelte ad alta percentuale.",
    icon: Brain,
    accent: "ball" as const,
  },
  {
    href: "/academy/regole",
    title: "Regole 2026",
    description: "La guida verificata sulle fonti ufficiali FIP e FITP.",
    icon: Gavel,
    accent: "cyan" as const,
  },
  {
    href: "/academy/training",
    title: "Training",
    description: "Forza, mobilità, cambi di direzione, recupero e sicurezza.",
    icon: Dumbbell,
    accent: "cyan" as const,
  },
  {
    href: "/academy/attrezzatura",
    title: "Attrezzatura",
    description: "Racchetta, scarpe, palline e accessori scelti per necessità reali.",
    icon: PackageOpen,
    accent: "ball" as const,
  },
  {
    href: "/academy/storia-cultura",
    title: "Storia e cultura",
    description: "Dalle origini in Messico alla cultura contemporanea del padel.",
    icon: History,
    accent: "ball" as const,
  },
];

export const CIRCUIT_SECTIONS = [
  {
    href: "/circuito/classifiche",
    title: "Classifiche FIP",
    description: "Ranking mondiale e Race 2026, con data e fonte di aggiornamento.",
    icon: Trophy,
    accent: "ball" as const,
  },
  {
    href: "/circuito/calendario",
    title: "Calendario",
    description: "Major, P1 e P2 della stagione professionistica.",
    icon: BookOpen,
    accent: "cyan" as const,
  },
  {
    href: "/circuito/come-funziona-il-ranking",
    title: "Come funziona il ranking",
    description: "Migliori 22 risultati, finestra mobile e differenza dalla Race.",
    icon: Brain,
    accent: "orange" as const,
  },
];

export const SHOTS = [
  ["Posizione d’attesa", "Fondamentale", "La base da cui leggere e raggiungere ogni palla."],
  ["Diritto da fondo", "Fondamentale", "Compatto, stabile e orientato alla continuità."],
  ["Rovescio da fondo", "Fondamentale", "Preparazione corta e recupero immediato della posizione."],
  ["Servizio", "Fondamentale", "Avviare il punto e avanzare insieme verso la rete."],
  ["Lob", "Intermedio", "Il colpo di costruzione che sposta gli avversari dalla rete."],
  ["Volée", "Intermedio", "Controllare la rete con gesto corto e punto d’impatto avanti."],
  ["Uscita di parete", "Intermedio", "Usare il vetro per guadagnare tempo invece di subirlo."],
  ["Bandeja", "Intermedio", "Mantenere la rete dopo un lob senza cercare il vincente."],
  ["Víbora", "Avanzato", "Colpo sopra la testa con effetto laterale, pensato per mantenere pressione e produrre un rimbalzo scomodo."],
  ["Bajada", "Avanzato", "Trasformare una palla alta dopo il vetro in pressione offensiva."],
  ["Smash piatto", "Avanzato", "Chiusura potente quando posizione e altezza lo consentono."],
  ["Smash per tre", "Avanzato", "Uscita laterale della palla con tecnica e lettura precise."],
] as const;
