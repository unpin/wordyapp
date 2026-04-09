"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import CollectionsMenu from "./CollectionsMenu";
import TextToSpeachButton from "./TextToSpeachButton";

type CollectionBookmark = {
  bookmarkId: string;
  bookmark: {
    id: string;
    translation: {
      id: string;
      text: string;
      abbr: string | null;
      word: {
        word: string;
        lang: string;
      };
    };
  };
};

type CollectionBookmarksListProps = {
  collectionId: string;
  initialItems: CollectionBookmark[];
  initialHasMore: boolean;
};

export default function CollectionBookmarksList({
  collectionId,
  initialItems,
  initialHasMore,
}: CollectionBookmarksListProps) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(initialItems.length);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/collections/${collectionId}?offset=${offsetRef.current}`,
      );
      const data = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      offsetRef.current += data.items.length;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, collectionId]);

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

  const removeFromList = useCallback((bookmarkId: string) => {
    setItems((prev) => prev.filter((item) => item.bookmark.id !== bookmarkId));
    offsetRef.current = Math.max(0, offsetRef.current - 1);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-4">
        {items.map(({ bookmarkId, bookmark }) => (
          <li
            key={bookmarkId}
            className="border border-gray-200 dark:border-gray-800 rounded-md p-6"
          >
            <div className="flex items-center justify-between">
              <p className="flex gap-1 items-center font-medium text-gray-900 dark:text-white">
                <Link
                  href={`/dictionary/${encodeURIComponent(bookmark.translation.word.word)}`}
                >
                  {bookmark.translation.word.word}
                </Link>
                <TextToSpeachButton
                  lang={bookmark.translation.word.lang}
                  size={18}
                  text={bookmark.translation.word.word}
                />
              </p>
              <CollectionsMenu
                bookmarkId={bookmark.id}
                translationId={bookmark.translation.id}
                onDelete={removeFromList}
              />
            </div>
            <p className="text-gray-600 dark:text-gray-500">
              {bookmark.translation.text}
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
