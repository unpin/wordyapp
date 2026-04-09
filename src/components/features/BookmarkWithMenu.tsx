"use client";

import { BookmarkSimpleIcon } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { addBookmark } from "@/services/bookmarksService";
import Button from "../ui/Button";
import CollectionsMenu from "./CollectionsMenu";

type BookmarkWithMenuProps = {
  translationId: string;
  defaultBookmarkId: string | null;
};

export default function BookmarkWithMenu({
  translationId,
  defaultBookmarkId,
}: BookmarkWithMenuProps) {
  const [bookmarkId, setBookmarkId] = useState<string | null>(
    defaultBookmarkId,
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const id = await addBookmark(translationId);
      if (id) setBookmarkId(id);
    } catch (error) {
      console.error("Failed to add bookmark", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!bookmarkId) {
    return (
      <Button
        variant="icon"
        onClick={handleAdd}
        isLoading={isLoading}
        disabled={isLoading}
        aria-label="Add bookmark"
        aria-pressed={false}
      >
        <BookmarkSimpleIcon weight="light" size={20} />
      </Button>
    );
  }

  return (
    <CollectionsMenu
      bookmarkId={bookmarkId}
      translationId={translationId}
      onDelete={() => setBookmarkId(null)}
    />
  );
}
