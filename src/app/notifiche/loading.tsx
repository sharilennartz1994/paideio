import { RouteSkeleton } from "@/components/design";

export default function NotificheLoading() {
  return <RouteSkeleton variant="list" rows={5} label="Carichiamo le notifiche" />;
}
