import { createClient } from "@/lib/supabase/server";
import { importEvents } from "@/lib/data/events";
import { parseIcs } from "@/lib/ics/parser";
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

const importSchema = z.object({
  icsContent: z.string().min(1),
  sourceLabel: z.string().min(1),
});

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = importSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { icsContent, sourceLabel } = result.data;
  const { events, errors } = parseIcs(icsContent);

  if (events.length === 0) {
    return NextResponse.json(
      { error: "No valid events found in ICS content", details: errors },
      { status: 422 }
    );
  }

  const { count } = await importEvents(user.id, user.email!, events, sourceLabel);
  return NextResponse.json({ data: { count, warnings: errors } }, { status: 201 });
}
