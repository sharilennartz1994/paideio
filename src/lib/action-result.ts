// Le Server Action ritornano questo invece di lanciare eccezioni per gli
// errori "attesi" (validazione, permessi, limiti) — Next.js in produzione
// oscura il messaggio di un throw non gestito, ma non tocca un valore di
// ritorno normale. Vedi AGENTS.md.
export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function err(error: string): ActionResult<never> {
  return { ok: false, error };
}
