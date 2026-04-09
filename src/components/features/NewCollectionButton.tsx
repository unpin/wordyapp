"use client";

import { PlusIcon, XIcon } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createCollection } from "@/services/collectionsService";
import Button from "../ui/Button";

export default function NewCollectionButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const created = await createCollection({ name: name.trim() });
      if (created) {
        setName("");
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create collection", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isOpen) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Collection name"
          className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none transition w-48"
        />
        <Button
          type="submit"
          isLoading={isSaving}
          disabled={!name.trim()}
          size="sm"
        >
          Create
        </Button>
        <Button
          type="button"
          variant="icon"
          onClick={() => {
            setIsOpen(false);
            setName("");
          }}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <XIcon size={16} />
        </Button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsOpen(true)}
      className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
    >
      <PlusIcon size={16} />
      New
    </button>
  );
}
