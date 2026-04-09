import { and, eq, inArray, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { bookmarkIds, incorrectBookmarkIds } = await req.json();

  const hasCorrect = Array.isArray(bookmarkIds) && bookmarkIds.length > 0;
  const hasIncorrect =
    Array.isArray(incorrectBookmarkIds) && incorrectBookmarkIds.length > 0;

  if (!hasCorrect && !hasIncorrect) {
    return NextResponse.json({ success: true });
  }

  try {
    await Promise.all([
      hasCorrect &&
        db
          .update(bookmarks)
          .set({
            reviewCount: sql`${bookmarks.reviewCount} + 1`,
            updatedAt: new Date(),
          })
          .where(
            and(
              inArray(bookmarks.id, bookmarkIds),
              eq(bookmarks.userId, user.id),
            ),
          ),
      hasIncorrect &&
        db
          .update(bookmarks)
          .set({ reviewCount: 0, updatedAt: new Date() })
          .where(
            and(
              inArray(bookmarks.id, incorrectBookmarkIds),
              eq(bookmarks.userId, user.id),
            ),
          ),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update review counts", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
