import { createClient } from "@/lib/supabase/server";
import { getUserPages, createPage } from "@/lib/data/pages";
import { NextResponse } from "next/server";

async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await getUserPages(user.id, user.email!);
  return NextResponse.json({ data: pages });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parentId: string | undefined;
  try {
    const body = await request.json();
    if (typeof body?.parentId === "string") {
      parentId = body.parentId;
    }
  } catch {
    // no body or invalid JSON — parentId stays undefined
  }

  const page = await createPage(user.id, user.email!, parentId);
  return NextResponse.json({ data: page }, { status: 201 });
}
