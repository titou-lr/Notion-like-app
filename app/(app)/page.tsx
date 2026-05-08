import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPages } from "@/lib/data/pages";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const pages = await getUserPages(user.id, user.email!);

  if (pages.length > 0) {
    redirect(`/page/${pages[0].id}`);
  }

  return <EmptyState />;
}
