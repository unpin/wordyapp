"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useModal } from "@/hooks/useModal";
import Button from "../ui/Button";

type Props = {
  email: string;
};

export default function DeleteAccountButton({ email }: Props) {
  const { isShowing, toggle } = useModal();
  const [inputEmail, setInputEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputEmail.trim().toLowerCase() !== email.toLowerCase()) {
      setError("Email does not match.");
      return;
    }
    setError(null);
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Something went wrong.");
        setIsDeleting(false);
        return;
      }
      window.location.href = "/login";
    } catch {
      setError("Network error, please try again.");
      setIsDeleting(false);
    }
  };

  const handleOpen = () => {
    setInputEmail("");
    setError(null);
    toggle();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="shrink-0 px-4 py-2 text-sm font-medium rounded-lg border border-red-800 text-red-500 dark:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
      >
        Delete account
      </button>

      {isShowing &&
        createPortal(
          <DeleteModal
            email={email}
            inputEmail={inputEmail}
            onInputChange={setInputEmail}
            onSubmit={handleDelete}
            onClose={toggle}
            isDeleting={isDeleting}
            error={error}
          />,
          document.body,
        )}
    </>
  );
}

type ModalProps = {
  email: string;
  inputEmail: string;
  onInputChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isDeleting: boolean;
  error: string | null;
};

function DeleteModal({
  email,
  inputEmail,
  onInputChange,
  onSubmit,
  onClose,
  isDeleting,
  error,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const handleClickOutside = useCallback(() => onClose(), [onClose]);
  useClickOutside(modalRef, handleClickOutside);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const emailMatches = inputEmail.trim().toLowerCase() === email.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        ref={modalRef}
        className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg flex flex-col gap-5"
      >
        <div>
          <h2
            id="delete-modal-title"
            className="text-lg font-semibold text-red-500 dark:text-red-400"
          >
            Delete account
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            This will permanently delete your account and all associated data.
            This cannot be undone.
          </p>
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Enter your email{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {email}
              </span>{" "}
              to confirm
            </span>
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={email}
              autoComplete="off"
              className="bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
            />
          </label>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              isLoading={isDeleting}
              disabled={!emailMatches || isDeleting}
            >
              Delete account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
