import { createClient } from "@/lib/supabase/server";
import { getUserReminderLists, createReminderList } from "@/lib/data/reminders";
import { NextResponse } from "next/server";
import { z } from "zod";

async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

const createSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
});

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lists = await getUserReminderLists(user.id, user.email!);
  return NextResponse.json({ data: lists });
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

  const list = await createReminderList(user.id, user.email!, result.data);
  return NextResponse.json({ data: list }, { status: 201 });
}
