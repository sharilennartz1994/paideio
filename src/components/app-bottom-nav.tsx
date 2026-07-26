import { MobileNav } from "@/components/mobile-nav";
import { getCurrentUser } from "@/lib/session";
import { getUnreadNotificationCount } from "@/lib/queries";

export async function AppBottomNav() {
  const user = await getCurrentUser();
  const unreadCount = user ? await getUnreadNotificationCount(user.id) : 0;

  return <MobileNav role={user?.role ?? null} unreadCount={unreadCount} />;
}
