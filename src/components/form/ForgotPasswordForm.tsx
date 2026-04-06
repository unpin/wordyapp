"use client";

import { WarningIcon } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const email = (
      e.currentTarget.elements.namedItem("email") as HTMLInputElement
    ).value;

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/confirm?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium text-gray-600 dark:text-gray-300"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
        />
      </div>

      {error && (
        <span className="flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400">
          <WarningIcon size={15} weight="bold" />
          {error}
        </span>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
