"use client";

import { CheckIcon, WarningIcon } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import Button from "../ui/Button";

type SettingsFormProps = {
  initialName: string;
  initialEmail: string;
};

type Status = { type: "success" | "error"; message: string } | null;

export default function SettingsForm({
  initialName,
  initialEmail,
}: SettingsFormProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const isDirty = name.trim() !== initialName || email.trim() !== initialEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({
          type: "error",
          message: data.message ?? "Something went wrong",
        });
      } else {
        setStatus({ type: "success", message: "Profile updated successfully" });
      }
    } catch {
      setStatus({ type: "error", message: "Network error, please try again" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="Name" htmlFor="name">
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your name"
          className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
        />
      </Field>

      <Field label="Email" htmlFor="email">
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
        />
      </Field>

      <div className="flex items-center gap-4 pt-1">
        <Button type="submit" isLoading={isLoading} disabled={!isDirty}>
          Save changes
        </Button>

        {status && (
          <span
            className={`flex items-center gap-1.5 text-sm ${
              status.type === "success"
                ? "text-green-600 dark:text-green-400"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            {status.type === "success" ? (
              <CheckIcon size={15} weight="bold" />
            ) : (
              <WarningIcon size={15} weight="bold" />
            )}
            {status.message}
          </span>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-gray-600 dark:text-gray-300"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
