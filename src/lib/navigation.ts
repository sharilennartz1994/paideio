/**
 * Tassonomia di navigazione condivisa.
 *
 * Prima di questo file ogni superficie aveva la propria lista: la rail desktop
 * (`sidebar-nav.tsx`), lo sheet "Altro" (`mobile-nav.tsx`) e la nav di sezione
 * di Academy/Circuito (`editorial-layout.tsx`). Le tre liste erano divergenti -
 * `/prenotazioni` per un coach esisteva solo nello sheet mobile, e la sezione
 * Academy si chiamava "Attrezzatura" nell'hub ma "Gear" nella nav di sezione.
 *
 * Regola: le voci di navigazione si aggiungono **qui**, poi le superfici le
 * leggono. Vale anche il vincolo storico del progetto - nessuna rotta
 * raggiungibile da una sola superficie: `primaryNavGroups()` (desktop) e
 * `moreSheetGroups()` (mobile) insieme devono coprire lo stesso insieme di
 * rotte, e la copertura è verificabile leggendo questo solo file.
 */
import {
  Bell,
  CalendarDays,
  GraduationCap,
  Heart,
  Home,
  Info,
  LayoutDashboard,
  type LucideIcon,
  Search,
  Sparkles,
  Trophy,
} from "@/components/icons/paideio-icons";

export type Role = "player" | "coach" | null;

export type NavEntry = {
  href: string;
  /** Etichetta corta: sta nella rail da 80px e nelle tab. */
  label: string;
  /** Etichetta estesa per sheet e breadcrumb, quando quella corta è un'abbreviazione. */
  longLabel?: string;
  icon: LucideIcon;
  badge?: number;
};

export type NavGroup = { title: string; entries: NavEntry[] };

/** Vero anche per le sottorotte: `/academy/tecnica` accende `/academy`. */
export function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

const HOME: NavEntry = { href: "/", label: "Home", icon: Home };
const CERCA: NavEntry = { href: "/cerca", label: "Cerca", longLabel: "Cerca un coach", icon: Search };
/**
 * Solo per i player: `prenotazioni/page.tsx` fa `redirect("/")` per chiunque
 * non abbia quel ruolo. Lo sheet mobile la offriva anche ai coach ("Le mie
 * lezioni"), ed era un link che riportava in home senza spiegare perché.
 */
const LEZIONI: NavEntry = {
  href: "/prenotazioni",
  label: "Lezioni",
  longLabel: "Le mie lezioni",
  icon: CalendarDays,
};
const PREFERITI: NavEntry = { href: "/preferiti", label: "Preferiti", icon: Heart };
const ACADEMY: NavEntry = { href: "/academy", label: "Academy", icon: GraduationCap };
const CIRCUITO: NavEntry = { href: "/circuito", label: "Circuito", icon: Trophy };
const CONCEPT: NavEntry = { href: "/chi-siamo", label: "Il concept", icon: Info };
const RELEASE: NavEntry = { href: "/prossime-release", label: "Prossime release", icon: Sparkles };

function coachEntry(role: Role): NavEntry {
  return role === "coach"
    ? { href: "/coach-admin", label: "Area coach", icon: LayoutDashboard }
    : { href: "/diventa-coach", label: "Diventa coach", longLabel: "Diventa coach", icon: Trophy };
}

/**
 * Gruppi della rail desktop. I titoli sono corti apposta: nella rail da 80px
 * fanno da intestazione di gruppo a 9px, e sono ciò che spiega la struttura del
 * sito a chi arriva la prima volta.
 */
export function primaryNavGroups(role: Role): NavGroup[] {
  const gioca: NavEntry[] = [HOME, CERCA];
  if (role === "player") gioca.push(LEZIONI, PREFERITI);

  return [
    { title: "Gioca", entries: gioca },
    { title: "Impara", entries: [ACADEMY, CIRCUITO] },
  ];
}

/**
 * Contenuto dello sheet "Altro" della bottom nav. Home, Cerca e la terza scheda
 * sono già bottoni della barra, quindi qui compare tutto il resto - incluse le
 * voci che sulla rail desktop stanno nella topbar (notifiche) o nel footer
 * (concept, roadmap).
 */
export function moreSheetGroups(role: Role, unreadCount: number, primaryHref: string): NavGroup[] {
  const gioca = [CERCA, ...(role === "player" ? [LEZIONI, PREFERITI] : [])].filter(
    (entry) => entry.href !== primaryHref
  );
  const impara = [ACADEMY, CIRCUITO].filter((entry) => entry.href !== primaryHref);
  const paideio: NavEntry[] = [];
  if (role) paideio.push({ href: "/notifiche", label: "Notifiche", icon: Bell, badge: unreadCount });
  const coach = coachEntry(role);
  if (coach.href !== primaryHref) paideio.push(coach);
  paideio.push(CONCEPT, RELEASE);

  return [
    { title: "Gioca", entries: gioca },
    { title: "Impara", entries: impara },
    { title: "Paideio", entries: paideio },
  ].filter((group) => group.entries.length > 0);
}

/** CTA in fondo alla rail: unica porta d'accesso desktop all'area coach. */
export function coachCallToAction(role: Role) {
  return coachEntry(role);
}

/* ------------------------------------------------------------------------ */
/* Sezioni editoriali                                                        */
/* ------------------------------------------------------------------------ */

export type EditorialSection = {
  root: string;
  label: string;
  navLabel: string;
  children: ReadonlyArray<{ href: string; label: string }>;
};

/**
 * Le etichette qui sono quelle canoniche e in italiano. La nav di sezione
 * usava "Gear" e "Cultura" mentre le card dell'hub dicevano "Attrezzatura" e
 * "Storia e cultura": due nomi per la stessa pagina rendono impossibile capire
 * dove si è.
 */
export const EDITORIAL_SECTIONS: readonly EditorialSection[] = [
  {
    root: "/academy",
    label: "Academy",
    navLabel: "Panoramica",
    children: [
      { href: "/academy/tecnica", label: "Tecnica" },
      { href: "/academy/strategia", label: "Strategia" },
      { href: "/academy/regole", label: "Regole" },
      { href: "/academy/training", label: "Training" },
      { href: "/academy/attrezzatura", label: "Attrezzatura" },
      { href: "/academy/storia-cultura", label: "Storia e cultura" },
    ],
  },
  {
    root: "/circuito",
    label: "Circuito",
    navLabel: "Panoramica",
    children: [
      { href: "/circuito/classifiche", label: "Classifiche" },
      { href: "/circuito/calendario", label: "Calendario" },
      { href: "/circuito/come-funziona-il-ranking", label: "Ranking" },
    ],
  },
];

export function editorialSectionFor(pathname: string) {
  return EDITORIAL_SECTIONS.find((section) => isActivePath(pathname, section.root)) ?? null;
}

/* ------------------------------------------------------------------------ */
/* Breadcrumb                                                                */
/* ------------------------------------------------------------------------ */

/**
 * Etichetta di ogni rotta, per il percorso di navigazione. Le rotte non
 * elencate ricadono su un titolo derivato dallo slug, così una pagina nuova
 * non rompe il breadcrumb: al massimo mostra un nome grezzo finché non viene
 * registrata qui.
 */
const ROUTE_LABELS: Record<string, string> = {
  "/": "Home",
  "/cerca": "Cerca un coach",
  "/coach": "Coach",
  "/prenotazioni": "Le mie lezioni",
  "/preferiti": "Preferiti",
  "/notifiche": "Notifiche",
  "/academy": "Academy",
  "/circuito": "Circuito",
  "/circuito/come-funziona-il-ranking": "Come funziona il ranking",
  "/chi-siamo": "Il concept",
  "/prossime-release": "Prossime release",
  "/diventa-coach": "Diventa coach",
  "/coach-admin": "Area coach",
  "/coach-admin/profilo": "Profilo",
  "/coach-admin/campi": "Campi",
  "/coach-admin/orari": "Orari",
  "/coach-admin/richieste": "Richieste",
  "/design-system": "Design system",
  "/termini": "Termini di servizio",
  "/privacy": "Privacy",
};

/**
 * Segmenti tecnici che non hanno una pagina propria e vanno saltati nel
 * percorso: `/coach` non esiste come indice, esiste solo `/coach/[id]`, quindi
 * mostrarlo produrrebbe un anello morto ("Home / Coach / Profilo coach").
 */
const SKIPPED_PREFIXES = new Set(["/coach"]);

/** Etichetta di ripiego per i segmenti dinamici (id opachi negli URL). */
const DYNAMIC_FALLBACKS: Record<string, string> = {
  "/coach": "Profilo coach",
};

function humanize(segment: string) {
  const text = decodeURIComponent(segment).replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export type Crumb = { href: string | null; label: string };

/**
 * Costruisce il percorso a partire dal pathname. Ritorna array vuoto per la
 * home e per le rotte di autenticazione, dove un breadcrumb sarebbe rumore.
 */
export function buildBreadcrumb(pathname: string, currentLabel?: string): Crumb[] {
  if (pathname === "/" || pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    return [];
  }

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ href: "/", label: "Home" }];

  segments.forEach((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    if (SKIPPED_PREFIXES.has(href)) return;

    const isLast = index === segments.length - 1;
    const parent = `/${segments.slice(0, index).join("/")}`;
    // Un id dinamico (`/coach/<uuid>`) non ha etichetta propria: usa quella
    // passata dalla pagina, poi il ripiego della sezione padre, e solo in
    // ultima istanza lo slug reso leggibile.
    const label = (isLast && currentLabel) || ROUTE_LABELS[href] || DYNAMIC_FALLBACKS[parent] || humanize(segment);
    crumbs.push({ href: isLast ? null : href, label });
  });

  return crumbs;
}
