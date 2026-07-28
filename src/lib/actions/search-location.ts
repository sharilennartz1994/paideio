"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { type ActionResult, ok, err } from "@/lib/action-result";
import { SEARCH_LOCATION_COOKIE, SEARCH_LOCATION_DECIMALI } from "@/lib/search-location";

// Un file "use server" può esportare solo funzioni async: costante di cookie e
// funzione di lettura stanno in `lib/search-location.ts`.

function arrotonda(valore: number) {
  return Number(valore.toFixed(SEARCH_LOCATION_DECIMALI));
}

export async function setSearchLocation(lat: number, lng: number): Promise<ActionResult> {
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return err("Coordinate non valide.");
  }

  const store = await cookies();
  store.set(SEARCH_LOCATION_COOKIE, `${arrotonda(lat)},${arrotonda(lng)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Cookie di sessione: sparisce alla chiusura del browser.
  });

  revalidatePath("/cerca");
  return ok(undefined);
}

export async function clearSearchLocation(): Promise<ActionResult> {
  const store = await cookies();
  store.delete(SEARCH_LOCATION_COOKIE);
  revalidatePath("/cerca");
  return ok(undefined);
}
