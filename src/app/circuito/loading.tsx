import { RouteSkeleton } from "@/components/design";

/** Copre anche `/circuito/classifiche`, `/calendario`, `/come-funziona-il-ranking`. */
export default function CircuitoLoading() {
  return <RouteSkeleton variant="editorial" nav label="Carichiamo il circuito" />;
}
