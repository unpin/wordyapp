"use client";

import {
  ArrowLeftIcon,
  BookmarkSimpleIcon,
  BookmarksSimpleIcon,
  CheckCircleIcon,
  CircleNotchIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@phosphor-icons/react/ssr";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BookmarkCollections } from "@/db/schema";
import { useClickOutside } from "@/hooks/useClickOutside";
import { removeBookmark } from "@/services/bookmarksService";
import {
  addBookmarkToCollection,
  createCollection,
  getBookmarkCollections,
  removeBookmarkFromCollection,
} from "@/services/collectionsService";
import Button from "../ui/Button";

type CollectionsMenuProps = {
  bookmarkId: string;
  translationId: string;
  onDelete: (bookmarkId: string) => void;
};

export default function CollectionsMenu({
  bookmarkId,
  translationId,
  onDelete,
}: CollectionsMenuProps) {
  const [collections, setCollections] = useState<BookmarkCollections[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (collections.length > 0) return;
    getBookmarkCollections(bookmarkId).then(setCollections);
  }, [isOpen, bookmarkId, collections.length]);

  useEffect(() => {
    if (isCreating) nameInputRef.current?.focus();
  }, [isCreating]);

  const handleClickOutside = useCallback(() => {
    setIsOpen(false);
    setIsCreating(false);
    setNewName("");
  }, []);

  useClickOutside(menuRef, handleClickOutside);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const deleteBookmark = async () => {
    setIsDeleting(true);
    try {
      const success = await removeBookmark(translationId);
      if (success) {
        setIsOpen(false);
        onDelete(bookmarkId);
      }
    } catch (error) {
      console.error("Failed to remove bookmark", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const onBookmarkChange = (collectionId: string, isBookmarked: boolean) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === collectionId ? { ...c, isBookmarked } : c)),
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSaving(true);
    try {
      const created = await createCollection({ name: newName.trim() });
      if (created) {
        setCollections((prev) => [
          {
            id: created.id,
            name: created.name,
            description: created.description,
            ownerId: "",
            isBookmarked: false,
          },
          ...prev,
        ]);
        setNewName("");
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Failed to create collection", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="icon"
        onClick={handleToggle}
        aria-label="Manage bookmark collections"
        aria-expanded={isOpen}
        className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
      >
        <BookmarkSimpleIcon weight="fill" size={20} />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-white dark:bg-gray-900 border border-gray-300/60 dark:border-gray-700/60 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            {isCreating ? (
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewName("");
                }}
                className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition"
              >
                <ArrowLeftIcon size={12} />
                Back
              </button>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Save to collection
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition px-2 py-1"
                >
                  + New
                </button>
              </>
            )}
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {isCreating ? (
            <form onSubmit={handleCreate} className="p-4 flex flex-col gap-3">
              <input
                ref={nameInputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Collection name"
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
              />
              <Button
                type="submit"
                isLoading={isSaving}
                disabled={!newName.trim()}
                className="w-full"
              >
                Create
              </Button>
            </form>
          ) : (
            <>
              <div className="py-2 max-h-56 overflow-y-auto">
                {collections.length > 0 ? (
                  <ul>
                    {collections.map(({ id, name, isBookmarked }) => (
                      <li key={id}>
                        <CollectionMenuBookmarkButton
                          collectionId={id}
                          bookmarkId={bookmarkId}
                          name={name}
                          defaultIsBookmarked={isBookmarked}
                          onBookmarkChange={onBookmarkChange}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-6 text-center px-4">
                    <BookmarksSimpleIcon
                      size={28}
                      className="text-gray-400 dark:text-gray-600"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      No collections yet.
                      <br />
                      Create one to organise your bookmarks.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Remove bookmark
                </span>
                <Button
                  variant="icon"
                  onClick={deleteBookmark}
                  isLoading={isDeleting}
                  disabled={isDeleting}
                  aria-label="Remove bookmark"
                  className="w-7 h-7 text-gray-600 dark:text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                >
                  <TrashIcon size={15} />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CollectionMenuBookmarkButton({
  collectionId,
  bookmarkId,
  name,
  defaultIsBookmarked,
  onBookmarkChange,
}: {
  collectionId: string;
  bookmarkId: string;
  name: string;
  defaultIsBookmarked: boolean;
  onBookmarkChange?: (collectionId: string, bookmarked: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(defaultIsBookmarked);

  const toggle = async () => {
    const prev = isBookmarked;
    setIsLoading(true);
    setIsBookmarked(!prev);

    try {
      if (prev) {
        await removeBookmarkFromCollection({ collectionId, bookmarkId });
        onBookmarkChange?.(collectionId, false);
      } else {
        await addBookmarkToCollection({ collectionId, bookmarkId });
        onBookmarkChange?.(collectionId, true);
      }
    } catch (error) {
      console.error(error);
      setIsBookmarked(prev);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isLoading}
      aria-label={isBookmarked ? `Remove from ${name}` : `Add to ${name}`}
      aria-pressed={isBookmarked}
      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left group"
    >
      <span className="flex-1 text-sm text-gray-700 dark:text-gray-200 truncate">
        {name}
      </span>
      {isLoading ? (
        <CircleNotchIcon
          size={16}
          className="animate-spin text-gray-600 dark:text-gray-400 shrink-0"
        />
      ) : isBookmarked ? (
        <CheckCircleIcon
          size={18}
          weight="fill"
          className="text-blue-400 shrink-0"
        />
      ) : (
        <PlusCircleIcon
          size={18}
          className="text-gray-400 dark:text-gray-600 group-hover:text-gray-700 dark:group-hover:text-gray-400 shrink-0"
        />
      )}
    </button>
  );
}
