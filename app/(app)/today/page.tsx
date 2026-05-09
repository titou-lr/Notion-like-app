import { createClient } from "@/lib/supabase/server";
import { getUserReminders } from "@/lib/data/reminders";
import { getRecentPages } from "@/lib/data/pages";
import { getUserEvents } from "@/lib/data/events";
import { getGreeting } from "@/lib/today";
import { startOfDay, endOfDay } from "@/lib/calendar-utils";
import { TodayShell } from "@/components/today/TodayShell";

export default async function TodayPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const [reminders, pages, events] = await Promise.all([
    getUserReminders(user.id, user.email!, { todayFilter: true }),
    getRecentPages(user.id, user.email!, 5),
    getUserEvents(user.id, user.email!, { from: todayStart, to: todayEnd }),
  ]);

  const serializedReminders = reminders.map((r) => ({
    ...r,
    dueAt: r.dueAt ? r.dueAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  const serializedPages = pages.map((p) => ({
    ...p,
    updatedAt: p.updatedAt.toISOString(),
  }));

  const serializedEvents = events.map((e) => ({
    ...e,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <TodayShell
      initialReminders={serializedReminders}
      recentPages={serializedPages}
      events={serializedEvents}
      greeting={getGreeting(now)}
      formattedDate={formattedDate}
    />
  );
}
