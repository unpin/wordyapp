import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { collectionBookmarks } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  _ctx: RouteContext<"/api/collections/bookmark">,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { collectionId, bookmarkId } = await req.json();

  try {
    const added = await db
      .insert(collectionBookmarks)
      .values({ collectionId, bookmarkId })
      .onConflictDoNothing()
      .returning();

    if (added.length > 0) {
      return NextResponse.json({ added });
    } else {
      return NextResponse.json(
        { message: "Bookmark already exists" },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Failed to add a bookmark", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  _ctx: RouteContext<"/api/collections/bookmark">,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { collectionId, bookmarkId } = await req.json();

  try {
    const deleted = await db
      .delete(collectionBookmarks)
      .where(
        and(
          eq(collectionBookmarks.collectionId, collectionId),
          eq(collectionBookmarks.bookmarkId, bookmarkId),
        ),
      )
      .returning();

    return NextResponse.json(null, { status: deleted.length > 0 ? 200 : 404 });
  } catch (error) {
    console.error("Failed to delete bookmark from collection", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
