"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import CollectionsMenu from "./CollectionsMenu";
import TextToSpeachButton from "./TextToSpeachButton";

type Bookmark = {
  id: string;
  userId: string;
  createdAt: Date;
  translationId: string;
  translation: {
    id: string;
    wordId: string;
    senseId: string;
    lang: string;
    text: string;
    abbr: string | null;
    sense: { abbr: string | null };
    word: { word: string; lang: string };
  };
};

type BookmarksListProps = {
  initialBookmarks: Bookmark[];
  initialHasMore: boolean;
};

export default function BookmarksList({
  initialBookmarks,
  initialHasMore,
}: BookmarksListProps) {
  const [bookmarksList, setBookmarksList] = useState(initialBookmarks);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(initialBookmarks.length);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookmarks?offset=${offsetRef.current}`);
      const data = await res.json();
      setBookmarksList((prev) => [...prev, ...data.bookmarks]);
      setHasMore(data.hasMore);
      offsetRef.current += data.bookmarks.length;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarksList((prev) => prev.filter((b) => b.id !== bookmarkId));
    offsetRef.current = Math.max(0, offsetRef.current - 1);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-4">
        {bookmarksList.map(({ id, translation, translationId }) => (
          <li
            key={id}
            className="border border-gray-200 dark:border-gray-800 rounded-md p-6"
          >
            <div className="flex items-center justify-between">
              <p className="flex gap-1 items-center font-medium text-gray-900 dark:text-white">
                <Link
                  href={`/dictionary/${encodeURIComponent(translation.word.word)}`}
                >
                  {translation.word.word}
                </Link>
                <TextToSpeachButton
                  lang={translation.word.lang}
                  size={18}
                  text={translation.word.word}
                />
              </p>
              <CollectionsMenu
                bookmarkId={id}
                translationId={translationId}
                onDelete={removeBookmark}
              />
            </div>
            <p className="text-gray-600 dark:text-gray-500">
              {translation.text}
            </p>
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} className="h-4" />

      {isLoading && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
          Loading…
        </p>
      )}
    </div>
  );
}
