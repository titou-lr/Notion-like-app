import { createClient } from "@/lib/supabase/server";
import { updateReminder, softDeleteReminder } from "@/lib/data/reminders";
import { NextResponse } from "next/server";
import { z } from "zod";

async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

const patchSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    dueAt: z.union([z.string().datetime(), z.null()]).optional(),
    priority: z.enum(["LOW", "NORMAL", "HIGH"]).optional(),
    isDone: z.boolean().optional(),
    listId: z.string().nullable().optional(),
  })
  .refine(
    (d) => Object.values(d).some((v) => v !== undefined),
    "At least one field required"
  );

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { dueAt, ...rest } = result.data;
  const updateData = {
    ...rest,
    ...(dueAt !== undefined ? { dueAt: dueAt ? new Date(dueAt) : null } : {}),
  };

  await updateReminder(params.id, user.id, updateData);
  return NextResponse.json({ data: { ok: true } });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await softDeleteReminder(params.id, user.id);
  return NextResponse.json({ data: { ok: true } });
}
