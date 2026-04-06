"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { createClient } from "@/lib/supabase/client";

type Props = {
  name: string;
  email: string;
};

export default function UserProfileMenu({ name, email }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const handleClickOutside = useCallback(() => setIsOpen(false), []);

  useClickOutside(menuRef, handleClickOutside);

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="relative flex" ref={menuRef}>
      <button type="button" className="cursor-pointer" onClick={toggleMenu}>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white border-2 border-gray-300 dark:border-gray-700 hover:border-blue-400 transition select-none">
          {name.charAt(0).toUpperCase()}
        </div>
      </button>
      {isOpen && (
        <div className="absolute z-50 flex flex-col gap-4 top-full right-0 mt-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 min-w-40 p-4">
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-gray-900 dark:text-white">
              {name}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-500">
              {email}
            </div>
          </div>
          <hr className="border-t border-gray-200 dark:border-gray-700 w-full" />
          <ul className="flex flex-col gap-4">
            <li>
              <Link
                href="/profile"
                className="text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition"
              >
                Profile
              </Link>
            </li>
            <li>
              <Link
                href="/bookmarks"
                className="text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition"
              >
                Bookmarks
              </Link>
            </li>
            <li>
              <Link
                href="/settings"
                className="text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition"
              >
                Settings
              </Link>
            </li>
            <hr className="border-t border-gray-200 dark:border-gray-700 w-full" />
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition cursor-pointer"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
