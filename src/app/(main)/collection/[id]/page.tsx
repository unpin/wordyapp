import { and, desc, eq, sql } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import CollectionBookmarksList from "@/components/features/CollectionBookmarksList";
import CollectionSettingsModal from "@/components/features/CollectionSettingsModal";
import ReviewProgress from "@/components/ui/ReviewProgress";
import { db } from "@/db";
import { bookmarks, collectionBookmarks, collections } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export default async function CollectionPage({
  params,
}: PageProps<"/collection/[id]">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.id, id), eq(collections.ownerId, user.id)),
  });

  if (!collection) return notFound();

  const [collectionBookmarkRows, statsRows] = await Promise.all([
    db.query.collectionBookmarks.findMany({
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
      limit: 21,
    }),
    db
      .select({
        total: sql<number>`COUNT(*)::int`,
        reviewed: sql<number>`SUM(CASE WHEN ${bookmarks.reviewCount} > 0 THEN 1 ELSE 0 END)::int`,
      })
      .from(collectionBookmarks)
      .innerJoin(bookmarks, eq(bookmarks.id, collectionBookmarks.bookmarkId))
      .where(eq(collectionBookmarks.collectionId, id)),
  ]);

  const initialHasMore = collectionBookmarkRows.length > 20;
  const initialItems = collectionBookmarkRows.slice(0, 20);
  const { total: bookmarksTotal, reviewed: bookmarksReviewed } =
    statsRows[0] ?? { total: 0, reviewed: 0 };

  return (
    <div className="my-6 sm:my-8 mx-auto max-w-7xl flex flex-col lg:flex-row-reverse gap-6 lg:gap-8 items-start">
      <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-8">
        <ReviewProgress reviewed={bookmarksReviewed} total={bookmarksTotal} />
      </div>

      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{collection.name}</h1>
          <CollectionSettingsModal
            collectionId={collection.id}
            name={collection.name}
            description={collection.description}
          />
        </div>
        <p className="text-gray-600 dark:text-gray-500 mt-1">
          {collection.description}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {bookmarksTotal} bookmark{bookmarksTotal !== 1 ? "s" : ""}
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">Bookmarks</h2>
        {initialItems.length === 0 ? (
          <div className="flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-xl py-16">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No bookmarks yet
            </p>
          </div>
        ) : (
          <CollectionBookmarksList
            collectionId={id}
            initialItems={initialItems}
            initialHasMore={initialHasMore}
          />
        )}
      </div>
    </div>
  );
}
