import { createClient } from "@/lib/supabase/server";
import { getUserReminders } from "@/lib/data/reminders";
import { getRecentPages } from "@/lib/data/pages";
import { getGreeting } from "@/lib/today";
import { TodayShell } from "@/components/today/TodayShell";

export default async function TodayPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const now = new Date();

  const [reminders, pages] = await Promise.all([
    getUserReminders(user.id, user.email!, { todayFilter: true }),
    getRecentPages(user.id, user.email!, 5),
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

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <TodayShell
      initialReminders={serializedReminders}
      recentPages={serializedPages}
      events={[]}
      greeting={getGreeting(now)}
      formattedDate={formattedDate}
    />
  );
}
