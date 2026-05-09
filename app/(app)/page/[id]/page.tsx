import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPage } from "@/lib/data/pages";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { PageIcon } from "@/components/editor/PageIcon";
import { PageTitle } from "@/components/editor/PageTitle";
import type { Block } from "@/types";

interface PageProps {
  params: { id: string };
}

export default async function PageView({ params }: PageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const page = await getPage(params.id, user.id);

  if (!page) notFound();

  const blocks = (page.blocks ?? []) as Block[];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:px-12 md:py-16">
      <PageIcon pageId={params.id} initialIcon={page.icon ?? null} />
      <PageTitle pageId={params.id} initialTitle={page.title} />
      <BlockEditor pageId={params.id} blocks={blocks} />
    </div>
  );
}
