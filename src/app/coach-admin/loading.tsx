import { RouteSkeleton } from "@/components/design";

/**
 * Sta dentro `coach-admin/layout.tsx` (un `loading.tsx` non avvolge il layout
 * del proprio segmento), quindi durante il cambio di scheda l'intestazione
 * "Area coach" e la barra dei tab restano visibili: si ricarica solo il
 * pannello. Vale anche per `/campi`, `/orari`, `/profilo`, `/richieste`.
 */
export default function CoachAdminLoading() {
  return <RouteSkeleton variant="dashboard" label="Apriamo la control room" />;
}
