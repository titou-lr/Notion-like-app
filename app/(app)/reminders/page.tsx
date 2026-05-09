import { createClient } from "@/lib/supabase/server";
import { getUserReminderLists } from "@/lib/data/reminders";
import { RemindersShell } from "@/components/reminders/RemindersShell";

export default async function RemindersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const lists = await getUserReminderLists(user.id, user.email!);

  const serializedLists = lists.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  }));

  return <RemindersShell initialLists={serializedLists} />;
}
