import { createClient } from "@/lib/supabase/server";
import { updateBlock, deleteBlock } from "@/lib/data/blocks";
import { NextResponse } from "next/server";
import { z } from "zod";

const BLOCK_TYPES = ["TEXT", "HEADING_1", "HEADING_2", "HEADING_3", "BULLET_LIST", "NUMBERED_LIST", "CODE", "IMAGE", "DIVIDER", "QUOTE", "TODO"] as const;

const patchSchema = z.object({
  content: z.record(z.string(), z.unknown()),
  type: z.enum(BLOCK_TYPES).optional(),
  order: z.number().int().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await updateBlock(params.id, result.data.content, result.data.type, result.data.order);
  return NextResponse.json({ data: { id: params.id } });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await deleteBlock(params.id);
  return NextResponse.json({ data: { id: params.id } });
}
