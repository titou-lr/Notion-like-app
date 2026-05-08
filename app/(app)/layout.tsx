import { createClient } from "@/lib/supabase/server";
import { getUserPages } from "@/lib/data/pages";
import { buildPageTree } from "@/lib/utils";
import { AppShell } from "@/components/shared/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const flatPages = user ? await getUserPages(user.id, user.email!) : [];
  const pages = buildPageTree(flatPages);

  return <AppShell pages={pages}>{children}</AppShell>;
}
