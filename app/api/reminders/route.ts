import { createClient } from "@/lib/supabase/server";
import { getUserReminders, createReminder } from "@/lib/data/reminders";
import { NextResponse } from "next/server";
import { z } from "zod";

async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueAt: z.string().datetime().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).optional(),
  listId: z.string().optional(),
});

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const listId = url.searchParams.get("listId") ?? undefined;
  const filter = url.searchParams.get("filter");

  const reminders = await getUserReminders(user.id, user.email!, {
    listId,
    todayFilter: filter === "today",
  });

  return NextResponse.json({ data: reminders });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = createSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { dueAt, ...rest } = result.data;
  const reminder = await createReminder(user.id, user.email!, {
    ...rest,
    dueAt: dueAt ? new Date(dueAt) : undefined,
  });

  return NextResponse.json({ data: reminder }, { status: 201 });
}
