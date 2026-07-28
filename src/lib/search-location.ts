import "server-only";
import { cookies } from "next/headers";

/**
 * Posizione per la ricerca "vicino a me".
 *
 * Sta in un cookie e non nella query string: una coordinata GPS nell'URL
 * finisce nella cronologia del browser, nei log del server e nell'header
 * `Referer` verso qualunque terza parte. Il cookie è httpOnly (non leggibile
 * da JS), di sessione, e non viene mai salvato nel database.
 *
 * Le Server Action che lo scrivono stanno in `lib/actions/search-location.ts`:
 * un file `"use server"` può esportare solo funzioni async, quindi la costante
 * e la lettura vivono qui.
 */
export const SEARCH_LOCATION_COOKIE = "paideio_pos";

/**
 * Precisione volutamente ridotta a ~1,1 km (2 decimali). La ricerca lavora su
 * un raggio di decine di chilometri, quindi non serve di più — e una posizione
 * arrotondata non individua un indirizzo di casa.
 */
export const SEARCH_LOCATION_DECIMALI = 2;

/** Legge la posizione dal cookie. Per i Server Component. */
export async function readSearchLocation(): Promise<{ lat: number; lng: number } | undefined> {
  const raw = (await cookies()).get(SEARCH_LOCATION_COOKIE)?.value;
  if (!raw) return undefined;

  const [lat, lng] = raw.split(",").map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  return { lat, lng };
}
