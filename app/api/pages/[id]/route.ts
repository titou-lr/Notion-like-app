import { createClient } from "@/lib/supabase/server";
import {
  updatePageIcon,
  softDeletePage,
  permanentDeletePage,
  restorePage,
} from "@/lib/data/pages";
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
    icon: z.string().nullable().optional(),
    isDeleted: z.literal(false).optional(),
  })
  .refine(
    (d) => d.icon !== undefined || d.isDeleted !== undefined,
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

  const { icon, isDeleted } = result.data;
  if (icon !== undefined) await updatePageIcon(params.id, user.id, icon);
  if (isDeleted === false) await restorePage(params.id, user.id);

  return NextResponse.json({ data: { ok: true } });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const permanent = url.searchParams.get("permanent") === "true";

  if (permanent) {
    await permanentDeletePage(params.id, user.id);
  } else {
    await softDeletePage(params.id, user.id);
  }

  return NextResponse.json({ data: { ok: true } });
}
