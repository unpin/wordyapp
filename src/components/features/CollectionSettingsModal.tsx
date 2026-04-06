"use client";

import {
  DotsThreeIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useModal } from "@/hooks/useModal";
import {
  deleteCollection,
  updateCollection,
} from "@/services/collectionsService";
import Button from "../ui/Button";

type CollectionSettingsModalProps = {
  collectionId: string;
  name: string;
  description: string;
};

export default function CollectionSettingsModal({
  collectionId,
  name: initName,
  description: initDescription,
}: CollectionSettingsModalProps) {
  const [name, setName] = useState(initName);
  const [description, setDescription] = useState(initDescription);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isShowing, toggle } = useModal();
  const router = useRouter();

  const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const ok = await updateCollection(collectionId, { name, description });
      if (ok) {
        // Revalidate the server-rendered page so the new name shows in the heading.
        router.refresh();
        toggle();
      } else {
        setError("Failed to save. Please try again.");
      }
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);
    try {
      const ok = await deleteCollection(collectionId);
      if (ok) {
        router.push("/bookmarks");
      } else {
        setError("Failed to delete. Please try again.");
        setIsDeleting(false);
      }
    } catch {
      setError("Failed to delete. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button variant="icon" onClick={toggle} aria-label="Collection settings">
        <DotsThreeIcon />
      </Button>
      <Modal isShowing={isShowing} hide={toggle} title="Collection settings">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600 dark:text-gray-500">
              Name
            </span>
            <input
              type="text"
              value={name}
              name="name"
              required
              onChange={(e) => setName(e.target.value)}
              placeholder="Collection name"
              className="bg-gray-200 dark:bg-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600 dark:text-gray-500">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Collection description"
              name="description"
              rows={3}
              className="bg-gray-200 dark:bg-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </label>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            disabled={isSaving || isDeleting}
          >
            Save
          </Button>
        </form>

        <hr className="border-t border-gray-300 dark:border-gray-700" />

        {/* Separate delete section so it's visually distinct from the save action */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Delete collection</p>
            <p className="text-xs text-gray-600 dark:text-gray-500">
              Bookmarks inside will not be deleted.
            </p>
          </div>
          <Button
            variant="icon"
            onClick={handleDelete}
            isLoading={isDeleting}
            disabled={isSaving || isDeleting}
            aria-label="Delete collection"
            className="text-gray-600 dark:text-gray-400 hover:text-red-400 hover:bg-transparent"
          >
            <TrashIcon size={18} />
          </Button>
        </div>
      </Modal>
    </>
  );
}

type ModalProps = PropsWithChildren<{
  isShowing: boolean;
  hide: () => void;
  title?: string;
}>;

function Modal({ isShowing, hide, children, title }: ModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const handleClickOutside = useCallback(() => hide(), [hide]);
  useClickOutside(modalRef, handleClickOutside);

  useEffect(() => {
    if (!isShowing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isShowing, hide]);

  if (!isShowing) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="flex flex-col gap-4 relative w-full max-w-md rounded-md bg-white dark:bg-gray-800 p-6 shadow-lg"
        ref={modalRef}
      >
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          <Button
            type="button"
            variant="icon"
            onClick={hide}
            aria-label="Close modal"
          >
            <XIcon />
          </Button>
        </div>
        <hr className="border-t border-gray-300 dark:border-gray-700" />
        {children}
      </div>
    </div>,
    document.body,
  );
}
