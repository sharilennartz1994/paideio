import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, CalendarCheck2, CalendarX2 } from "@/components/icons/paideio-icons";
import { getCurrentUser } from "@/lib/session";
import { getNotificationsForUser } from "@/lib/queries";
import { MarkNotificationsReadButton } from "@/components/mark-notifications-read-button";
import { GameEmptyState } from "@/components/design";

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function NotifichePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  const items = await getNotificationsForUser(user.id);
  const hasUnread = items.some((item) => !item.readAt);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ui-kicker">Centro notifiche</p>
          <h1 className="editorial-title mt-2 text-headline-lg-mobile text-calce md:text-headline-lg">
            Aggiornamenti dal campo
          </h1>
        </div>
        {hasUnread && <MarkNotificationsReadButton />}
      </div>

      <div className="mt-8 grid gap-3">
        {items.length === 0 && (
          <GameEmptyState
            asset="ballBasket"
            title="Nessuna notifica"
            description="Quando prenoti o annulli una lezione, qui trovi subito l’aggiornamento."
          />
        )}
        {items.map((item) => {
          const Icon = item.type === "booking_cancelled" ? CalendarX2 : CalendarCheck2;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="group grid grid-cols-[44px_1fr_auto] gap-4 border border-nebbia/22 bg-carta-alta p-4 transition-colors hover:border-accent-cyan-ink/55 hover:bg-accent-cyan-ink/6"
            >
              <span className="flex size-11 items-center justify-center border border-accent-cyan-ink/35 text-accent-cyan-ink">
                <Icon className="size-5" aria-hidden />
              </span>
              <span>
                <span className="flex items-center gap-2 font-heading font-bold text-calce">
                  {item.title}
                  {!item.readAt && <span className="size-2 bg-accent-ball-ink" aria-label="Non letta" />}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-nebbia">{item.message}</span>
              </span>
              <time className="font-heading text-[10px] text-nebbia uppercase" dateTime={item.createdAt}>
                {formatNotificationDate(item.createdAt)}
              </time>
            </Link>
          );
        })}
      </div>
      <p className="mt-6 flex items-center gap-2 text-sm text-nebbia">
        <Bell className="size-4" aria-hidden /> Le notifiche restano disponibili nella tua cronologia.
      </p>
    </div>
  );
}
