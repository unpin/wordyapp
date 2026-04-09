"use client";

import { BookmarkSimpleIcon } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { addBookmark, removeBookmark } from "@/services/bookmarksService";
import Button from "../ui/Button";

type BookmarkButtonProps = {
  translationId: string;
  defaultState: boolean;
  onDelete?: () => void;
};

export default function BookmarkButton({
  translationId,
  defaultState,
  onDelete,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(defaultState);
  const [isLoading, setIsLoading] = useState(false);

  const toggleBookmark = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const next = !isBookmarked;
    setIsBookmarked(next);

    try {
      if (next) {
        await addBookmark(translationId);
      } else {
        await removeBookmark(translationId);
        onDelete?.();
      }
    } catch (error) {
      console.error("Failed to toggle bookmark", error);
      setIsBookmarked(!next);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="icon"
      onClick={toggleBookmark}
      disabled={isLoading}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      aria-pressed={isBookmarked}
    >
      <BookmarkSimpleIcon weight={isBookmarked ? "fill" : "light"} size={20} />
    </Button>
  );
}
