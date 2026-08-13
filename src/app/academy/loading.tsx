import { RouteSkeleton } from "@/components/design";

/** Copre anche le sottosezioni (`/academy/tecnica`, `/strategia`, ...). */
export default function AcademyLoading() {
  return <RouteSkeleton variant="editorial" nav label="Apriamo l’Academy" />;
}
