"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
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
  initialItems: CollectionBookmark[];
};

export default function CollectionBookmarksList({
  initialItems,
}: CollectionBookmarksListProps) {
  const [items, setItems] = useState(initialItems);

  const removeFromList = useCallback((bookmarkId: string) => {
    setItems((prev) => prev.filter((item) => item.bookmark.id !== bookmarkId));
  }, []);

  return (
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
  );
}
