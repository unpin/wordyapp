import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { collections } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext<"/api/collections/[id]">,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, description } = await req.json();

  try {
    const updated = await db
      .update(collections)
      .set({ name, description, updatedAt: new Date() })
      .where(and(eq(collections.id, id), eq(collections.ownerId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Failed to update collection", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext<"/api/collections/[id]">,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // collection_bookmarks rows are deleted automatically via ON DELETE CASCADE
    const deleted = await db
      .delete(collections)
      .where(and(eq(collections.id, id), eq(collections.ownerId, user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(null, { status: 200 });
  } catch (error) {
    console.error("Failed to delete collection", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
