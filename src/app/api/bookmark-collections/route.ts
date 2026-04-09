import { eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { collections } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  _ctx: RouteContext<"/api/bookmark-collections">,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { bookmarkId } = await req.json();
    const collectionRows = await db
      .select({
        id: collections.id,
        name: collections.name,
        ownerId: collections.ownerId,
        isBookmarked: sql<boolean>`EXISTS (
          SELECT *
          FROM collection_bookmarks cb
          WHERE cb.bookmark_id = ${bookmarkId}
            AND cb.collection_id = ${collections.id}
        )`.as("isBookmarked"),
      })
      .from(collections)
      .where(eq(collections.ownerId, user.id));

    return NextResponse.json(collectionRows, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch collections", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
