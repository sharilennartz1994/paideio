import { RouteSkeleton } from "@/components/design";

/**
 * Fallback di ultima istanza: vale per la home e per ogni rotta che non abbia
 * un `loading.tsx` più vicino (incluse `sign-in`/`sign-up`). Forma generica
 * "hero scuro + griglia di card", che è la struttura più diffusa nel prodotto.
 */
export default function RootLoading() {
  return <RouteSkeleton variant="editorial" label="Prepariamo il campo" />;
}
