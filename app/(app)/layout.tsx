import { createClient } from "@/lib/supabase/server";
import { getUserPages } from "@/lib/data/pages";
import { buildPageTree } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar/Sidebar";

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

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-60 shrink-0 border-r border-border bg-surface flex flex-col">
        <Sidebar pages={pages} />
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
