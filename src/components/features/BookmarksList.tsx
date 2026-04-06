"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useCallback, useState } from "react";
import Button from "../ui/Button";
import CollectionsMenu from "./CollectionsMenu";
import TextToSpeachButton from "./TextToSpeachButton";

type BookmarksListProps = {
  initialBookmarks: {
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
      sense: {
        abbr: string | null;
      };
      word: {
        word: string;
        lang: string;
      };
    };
  }[];
};

export default function BookmarksList({
  initialBookmarks,
}: BookmarksListProps) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);

  // Wrapped in useCallback so the reference is stable across renders.
  // If passed as a prop to a memoized child, a non-memoized function would
  // cause that child to re-render on every parent render.
  const removeBookmarkFromList = useCallback((bookmarkId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-4">
        {bookmarks.map(({ id, translation, translationId }) => (
          <li
            key={id}
            className="border border-gray-200 dark:border-gray-800 rounded-md p-6"
          >
            <div className="flex items-center justify-between">
              <p className="flex gap-1 items-center font-medium text-gray-900 dark:text-white">
                <Link
                  href={`/dictionary/${encodeURIComponent(translation.word.word)}`}
                >
                  {translation.word.word}{" "}
                </Link>
                <TextToSpeachButton
                  lang={translation.word.lang}
                  size={18}
                  text={translation.word.word}
                />
              </p>
              {/* Fixed: was passing bookmark `id` for both bookmarkId and translationId.
                  translationId should come from the bookmark object, not reuse id. */}
              <CollectionsMenu
                bookmarkId={id}
                translationId={translationId}
                onDelete={removeBookmarkFromList}
              />
            </div>
            <p className="text-gray-600 dark:text-gray-500">
              {translation.text}
            </p>
          </li>
        ))}
      </ul>
      <div className="flex justify-center gap-4">
        <Button>
          <CaretLeftIcon />
        </Button>
        <Button>
          <CaretRightIcon />
        </Button>
      </div>
    </div>
  );
}
