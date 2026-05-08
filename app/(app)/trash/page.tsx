import { createClient } from "@/lib/supabase/server";
import { getTrashedPages } from "@/lib/data/pages";
import { TrashPageClient } from "@/components/trash/TrashPageClient";

export default async function TrashPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pages = user ? await getTrashedPages(user.id, user.email!) : [];

  return <TrashPageClient pages={pages} />;
}
