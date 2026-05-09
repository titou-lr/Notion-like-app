import { createClient } from "@/lib/supabase/server";
import { deleteReminderList } from "@/lib/data/reminders";
import { NextResponse } from "next/server";

async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await deleteReminderList(params.id, user.id);
  return NextResponse.json({ data: { ok: true } });
}
