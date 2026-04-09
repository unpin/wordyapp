import { and, desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { collectionBookmarks, collections } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

export async function GET(
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
  const offset = parseInt(req.nextUrl.searchParams.get("offset") ?? "0");

  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.id, id), eq(collections.ownerId, user.id)),
    columns: { id: true },
  });
  if (!collection)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  const rows = await db.query.collectionBookmarks.findMany({
    where: eq(collectionBookmarks.collectionId, id),
    with: {
      bookmark: {
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
            with: { word: {} },
          },
        },
      },
    },
    orderBy: desc(collectionBookmarks.createdAt),
    limit: PAGE_SIZE + 1,
    offset,
  });

  const hasMore = rows.length > PAGE_SIZE;
  return NextResponse.json({ items: rows.slice(0, PAGE_SIZE), hasMore });
}

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
