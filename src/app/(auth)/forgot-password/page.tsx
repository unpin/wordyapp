"use client";

import { CheckCircleIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useState } from "react";
import ForgotPasswordForm from "@/components/form/ForgotPasswordForm";

export default function ForgotPasswordPage() {
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
            We sent you a password reset link. It expires in 1 hour.
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
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="text-sm text-gray-600 dark:text-gray-500">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <ForgotPasswordForm onSuccess={() => setSuccess(true)} />

        <p className="text-sm text-gray-600 dark:text-gray-500 text-center">
          Remember your password?{" "}
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
