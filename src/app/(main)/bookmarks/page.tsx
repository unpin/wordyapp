import { desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import BookmarksList from "@/components/features/BookmarksList";
import NewCollectionButton from "@/components/features/NewCollectionButton";
import ReviewProgress from "@/components/ui/ReviewProgress";
import { db } from "@/db";
import { bookmarks, collectionBookmarks, collections } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export default async function BookmarksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const userId = user.id;

  const [collectionRows, bookmarkRows, statsRow] = await Promise.all([
    db
      .select({
        id: collections.id,
        name: collections.name,
        description: collections.description,
        count: sql<number>`COUNT(DISTINCT ${collectionBookmarks.bookmarkId})::int`,
        reviewedCount: sql<number>`COUNT(DISTINCT CASE WHEN ${bookmarks.reviewCount} > 0 THEN ${collectionBookmarks.bookmarkId} END)::int`,
      })
      .from(collections)
      .leftJoin(
        collectionBookmarks,
        eq(collectionBookmarks.collectionId, collections.id),
      )
      .leftJoin(bookmarks, eq(bookmarks.id, collectionBookmarks.bookmarkId))
      .where(eq(collections.ownerId, userId))
      .groupBy(collections.id)
      .orderBy(desc(collections.createdAt)),
    db.query.bookmarks.findMany({
      where: eq(bookmarks.userId, userId),
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
      limit: 20,
    }),
    db
      .select({
        total: sql<number>`COUNT(*)::int`,
        reviewed: sql<number>`SUM(CASE WHEN review_count > 0 THEN 1 ELSE 0 END)::int`,
      })
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId)),
  ]);

  const { total: bookmarksTotal, reviewed: bookmarksReviewed } =
    statsRow[0] ?? { total: 0, reviewed: 0 };

  return (
    <div className="my-6 sm:my-8 mx-auto max-w-7xl flex flex-col lg:flex-row-reverse gap-6 lg:gap-8 items-start">
      <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-8">
        <ReviewProgress reviewed={bookmarksReviewed} total={bookmarksTotal} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Collections</h1>
          <NewCollectionButton />
        </div>
        {collectionRows.length === 0 ? (
          <div className="flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-xl py-16">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No collections yet
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {collectionRows.map(
              ({ id, name, description, count, reviewedCount }) => (
                <li
                  key={id}
                  className="flex border border-gray-200 dark:border-gray-800 rounded-xl w-full hover:border-blue-500 transition"
                >
                  <Link
                    href={`/collection/${id}`}
                    className="w-full p-4 flex flex-col gap-3"
                  >
                    <h3 className="text-lg font-bold truncate">{name}</h3>
                    <p className="truncate text-sm text-gray-600 dark:text-gray-500 flex-1">
                      {description}
                    </p>
                    <div className="flex items-center justify-between gap-3 mt-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {count} word{count !== 1 ? "s" : ""}
                      </span>
                      {count > 0 && (
                        <div className="flex items-center gap-2 flex-1 max-w-32">
                          <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${Math.round((reviewedCount / count) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 tabular-nums shrink-0">
                            {reviewedCount}/{count}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ),
            )}
          </ul>
        )}

        <h1 className="mt-10 mb-6 text-2xl font-bold">Bookmarks</h1>
        {bookmarkRows.length === 0 ? (
          <div className="flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-xl py-16">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No bookmarks yet
            </p>
          </div>
        ) : (
          <BookmarksList initialBookmarks={bookmarkRows} />
        )}
      </div>
    </div>
  );
}
