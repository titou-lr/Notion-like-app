import { createClient } from "@/lib/supabase/server";
import { getUserEvents, createEvent } from "@/lib/data/events";
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

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  color: z.string().optional(),
  category: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrence: z.string().optional(),
});

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");

  const events = await getUserEvents(user.id, user.email!, {
    from: fromParam ? new Date(fromParam) : undefined,
    to: toParam ? new Date(toParam) : undefined,
  });

  return NextResponse.json({ data: events });
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

  const { startAt, endAt, ...rest } = result.data;
  const event = await createEvent(user.id, user.email!, {
    ...rest,
    startAt: new Date(startAt),
    endAt: new Date(endAt),
  });

  return NextResponse.json({ data: event }, { status: 201 });
}
