import {
  BookmarksIcon,
  FolderIcon,
  StarIcon,
  TrophyIcon,
} from "@phosphor-icons/react/ssr";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { bookmarks, collections, subscriptions } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [subscription, statsRow, collectionsCount] = await Promise.all([
    db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, user.id),
    }),
    db
      .select({
        total: sql<number>`COUNT(*)::int`,
        reviewed: sql<number>`SUM(CASE WHEN review_count > 0 THEN 1 ELSE 0 END)::int`,
        totalReviews: sql<number>`SUM(review_count)::int`,
      })
      .from(bookmarks)
      .where(eq(bookmarks.userId, user.id)),
    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(collections)
      .where(eq(collections.ownerId, user.id)),
  ]);

  const stats = statsRow[0] ?? { total: 0, reviewed: 0, totalReviews: 0 };
  const numCollections = collectionsCount[0]?.count ?? 0;

  const name =
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "User";
  const initial = name.charAt(0).toUpperCase();
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const plan = subscription?.status === "active" ? "Pro" : "Free";

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 flex flex-col gap-8">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-3xl font-bold text-white select-none">
          {initial}
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{name}</h1>
          <p className="text-gray-600 dark:text-gray-500 truncate">
            {user.email}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            Member since {memberSince}
          </p>
        </div>

        <div className="ml-auto shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              plan === "Free"
                ? "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-500"
                : "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
            }`}
          >
            <StarIcon size={12} weight="fill" />
            {plan}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: <BookmarksIcon size={20} />,
            label: "Bookmarks",
            value: stats.total,
          },
          {
            icon: <FolderIcon size={20} />,
            label: "Collections",
            value: numCollections,
          },
          {
            icon: <StarIcon size={20} />,
            label: "Reviewed",
            value: stats.reviewed,
          },
          {
            icon: <TrophyIcon size={20} />,
            label: "Total reviews",
            value: stats.totalReviews ?? 0,
          },
        ].map(({ icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col gap-3 p-4 border border-gray-200 dark:border-gray-800 rounded-xl"
          >
            <span className="text-gray-600 dark:text-gray-400">{icon}</span>
            <div>
              <p className="text-2xl font-bold tabular-nums">{value}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-200 dark:divide-gray-800">
        <div className="px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-4">
            Account
          </p>
          <dl className="flex flex-col gap-4">
            <Row label="Name" value={name} />
            <Row label="Email" value={user.email ?? ""} />
            <Row label="Member since" value={memberSince} />
          </dl>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-4">
            Subscription
          </p>
          <dl className="flex flex-col gap-4">
            <Row label="Plan" value={plan} />
            <Row
              label="Status"
              value={
                subscription ? (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      subscription.status === "active"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-500"
                    }`}
                  >
                    {subscription.status.charAt(0).toUpperCase() +
                      subscription.status.slice(1)}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-500">
                    No subscription
                  </span>
                )
              }
            />
            {subscription && (
              <Row
                label="Since"
                value={new Date(subscription.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
              />
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <dt className="text-gray-600 dark:text-gray-400 shrink-0">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
