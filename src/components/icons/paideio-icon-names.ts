export const PAIDEIO_ICON_NAMES = [
  "arrow", "trophy", "bell", "book", "brain", "calendar", "calendar-check",
  "calendar-x", "calendar-clock", "check", "check-circle", "chevron",
  "chevron-left", "chevron-right", "circle", "circle-dot", "user", "user-cog",
  "users", "clipboard", "clock", "dumbbell", "euro", "external", "eye", "flame",
  "gavel", "cap", "heart", "history", "home", "inbox", "info", "dashboard",
  "list", "rows", "bulb", "loader", "pin", "message", "moon", "sun", "network",
  "package", "quote", "search", "send", "filters", "sparkles", "star", "swords",
  "target", "trend", "warning", "triangle", "x",
] as const;

export type PaideioIconName = (typeof PAIDEIO_ICON_NAMES)[number];
