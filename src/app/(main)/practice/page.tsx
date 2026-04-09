import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import PracticeApp from "@/components/features/PracticeApp";
import { db } from "@/db";
import { bookmarks, collections } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export default async function PracticePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const userId = user.id;

  const [collectionRows, totalRow] = await Promise.all([
    db
      .select({
        id: collections.id,
        name: collections.name,
        bookmarkCount: sql<number>`(SELECT COUNT(*) FROM collection_bookmarks cb WHERE cb.collection_id = ${collections.id})::int`,
      })
      .from(collections)
      .where(eq(collections.ownerId, userId)),
    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId)),
  ]);

  const totalBookmarks = totalRow[0]?.count ?? 0;

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 px-4">
      <PracticeApp
        collections={collectionRows}
        totalBookmarks={totalBookmarks}
      />
    </div>
  );
}
