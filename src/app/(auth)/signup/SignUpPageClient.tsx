"use client";

import { CheckCircleIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useState } from "react";
import SignUpForm from "@/components/form/SignUpForm";

export default function SignUpPageClient() {
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm flex flex-col items-center gap-3 text-center">
          <CheckCircleIcon
            size={40}
            className="text-green-600 dark:text-green-400"
          />
          <p className="text-2xl font-semibold">Check your email</p>
          <p className="text-sm text-gray-600 dark:text-gray-500">
            We sent you a confirmation link. Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="text-sm text-blue-500 hover:text-blue-400 transition mt-2"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-gray-600 dark:text-gray-500">
            Start learning vocabulary with Wordy
          </p>
        </div>

        <SignUpForm onSuccess={() => setSuccess(true)} />

        <p className="text-sm text-gray-600 dark:text-gray-500 text-center">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-500 hover:text-blue-400 transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
