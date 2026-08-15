import { RouteSkeleton } from "@/components/design";

/**
 * Il catalogo è un blocco unico e molto lungo: uno scheletro fedele sarebbe più
 * rumoroso della pagina. Qui la pallina centrata dice quel che serve.
 */
export default function DesignSystemLoading() {
  return <RouteSkeleton variant="block" label="Carichiamo il catalogo visuale" />;
}
