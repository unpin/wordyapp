"use client";

import { CircleNotchIcon } from "@phosphor-icons/react/ssr";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type ButtonVariant =
  | "primary"
  | "ghost"
  | "icon"
  | "outline"
  | "destructive"
  | "link"
  | "toggle";

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  isLoading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
  isActive?: boolean; // for toggle
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400 font-medium transition",
  ghost:
    "bg-transparent text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:text-gray-400 disabled:cursor-not-allowed focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400 font-medium transition",
  icon: "p-0 w-8 h-8 aspect-square flex items-center justify-center rounded-full bg-transparent text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition",
  outline:
    "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 disabled:text-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400 font-medium transition",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 disabled:cursor-not-allowed focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400 font-medium transition",
  link: "bg-transparent text-blue-600 underline hover:text-blue-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition font-medium",
  toggle:
    "bg-transparent text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 disabled:text-gray-400 disabled:cursor-not-allowed focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400 font-medium transition",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-sm h-8",
  md: "px-4 py-2 text-base h-10",
  lg: "px-6 py-3 text-lg h-12",
};

export default function Button({
  isLoading = false,
  variant = "primary",
  size = "md",
  type = "button",
  disabled,
  isActive = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      // Passing each class string as a separate argument to twMerge instead of
      // pre-joining them. twMerge is designed to receive individual strings so
      // it can correctly deduplicate conflicting Tailwind classes (e.g. if
      // className overrides a bg-* from variantClasses). Joining first then
      // passing one big string still works but defeats the purpose of twMerge.
      className={twMerge(
        "cursor-pointer inline-flex items-center justify-center rounded-md",
        variantClasses[variant],
        variant !== "icon" && sizeClasses[size],
        isActive && variant === "toggle" && "bg-blue-400 text-blue-700",
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <CircleNotchIcon size={18} className="animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
