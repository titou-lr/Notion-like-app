import { createClient } from "@/lib/supabase/server";
import { updateEvent, deleteEvent } from "@/lib/data/events";
import { NextResponse } from "next/server";
import { z } from "zod";

async function getAuthenticatedUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

const patchSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
    color: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    isRecurring: z.boolean().optional(),
    recurrence: z.string().nullable().optional(),
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

  const { startAt, endAt, ...rest } = result.data;
  const updateData = {
    ...rest,
    ...(startAt !== undefined ? { startAt: new Date(startAt) } : {}),
    ...(endAt !== undefined ? { endAt: new Date(endAt) } : {}),
  };

  await updateEvent(params.id, user.id, updateData);
  return NextResponse.json({ data: { ok: true } });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await deleteEvent(params.id, user.id);
  return NextResponse.json({ data: { ok: true } });
}
