import { createClient } from "@/lib/supabase/server";
import { createBlock } from "@/lib/data/blocks";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { BlockType } from "@/types";

const postSchema = z.object({
  type: z.string(),
  content: z.record(z.string(), z.unknown()),
  order: z.number(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = postSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const block = await createBlock(
    params.id,
    result.data.type as BlockType,
    result.data.content,
    result.data.order
  );

  return NextResponse.json({ data: block }, { status: 201 });
}
