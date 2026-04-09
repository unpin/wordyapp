"use client";

import { CheckCircleIcon, WarningIcon } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordForm({ email }: { email: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const form = e.currentTarget;
    const current = (
      form.elements.namedItem("current-password") as HTMLInputElement
    ).value;
    const next = (form.elements.namedItem("new-password") as HTMLInputElement)
      .value;
    const confirm = (
      form.elements.namedItem("confirm-password") as HTMLInputElement
    ).value;

    if (next !== confirm) {
      setError("New passwords do not match");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    // Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: current,
    });
    if (signInError) {
      setError("Current password is incorrect");
      setIsLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: next,
    });
    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="current-password"
          className="text-sm font-medium text-gray-600 dark:text-gray-300"
        >
          Current password
        </label>
        <input
          id="current-password"
          name="current-password"
          type="password"
          required
          placeholder="••••••••"
          className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="new-password"
          className="text-sm font-medium text-gray-600 dark:text-gray-300"
        >
          New password
        </label>
        <input
          id="new-password"
          name="new-password"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
          className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirm-password"
          className="text-sm font-medium text-gray-600 dark:text-gray-300"
        >
          Confirm new password
        </label>
        <input
          id="confirm-password"
          name="confirm-password"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
          className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
        />
      </div>

      {error && (
        <span className="flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400">
          <WarningIcon size={15} weight="bold" />
          {error}
        </span>
      )}

      {success && (
        <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
          <CheckCircleIcon size={15} weight="bold" />
          Password updated successfully
        </span>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Update password
      </Button>
    </form>
  );
}
