import { and, desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

export async function GET(
  req: NextRequest,
  _ctx: RouteContext<"/api/bookmarks">,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const offset = parseInt(req.nextUrl.searchParams.get("offset") ?? "0");

  const rows = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, user.id),
    with: {
      translation: {
        columns: {
          id: true,
          wordId: true,
          senseId: true,
          lang: true,
          text: true,
          abbr: true,
        },
        with: {
          sense: { columns: { abbr: true } },
          word: { columns: { word: true, lang: true } },
        },
      },
    },
    orderBy: desc(bookmarks.createdAt),
    limit: PAGE_SIZE + 1,
    offset,
  });

  const hasMore = rows.length > PAGE_SIZE;
  return NextResponse.json({ bookmarks: rows.slice(0, PAGE_SIZE), hasMore });
}

export async function POST(
  req: NextRequest,
  _ctx: RouteContext<"/api/bookmarks">,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { translationId } = await req.json();

  try {
    const added = await db
      .insert(bookmarks)
      .values({ userId: user.id, translationId })
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
  _ctx: RouteContext<"/api/bookmarks">,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { translationId } = await req.json();

  try {
    const deleted = await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.translationId, translationId),
          eq(bookmarks.userId, user.id),
        ),
      )
      .returning();

    return NextResponse.json(null, { status: deleted.length > 0 ? 200 : 404 });
  } catch (error) {
    console.error("Failed to delete bookmark", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
