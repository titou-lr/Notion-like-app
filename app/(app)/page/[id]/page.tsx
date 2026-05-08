import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPage } from "@/lib/data/pages";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { PageIcon } from "@/components/editor/PageIcon";
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
    <div className="max-w-3xl mx-auto px-16 py-16">
      <PageIcon pageId={params.id} initialIcon={page.icon ?? null} />
      <h1 className="text-4xl font-bold text-text-primary mb-8">
        {page.title || "Untitled"}
      </h1>
      <BlockEditor pageId={params.id} blocks={blocks} />
    </div>
  );
}
