"use client";

import {
  BarbellIcon,
  BookmarksIcon,
  HouseIcon,
  UserIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home", Icon: HouseIcon },
  { href: "/bookmarks", label: "Bookmarks", Icon: BookmarksIcon },
  { href: "/practice", label: "Practice", Icon: BarbellIcon },
  { href: "/profile", label: "Profile", Icon: UserIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex">
        {links.map(({ href, label, Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-label={label}
                className={`flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <span
                  className={`rounded-xl p-1 transition-colors ${
                    isActive ? "bg-gray-100 dark:bg-gray-800" : ""
                  }`}
                >
                  <Icon size={22} weight={isActive ? "fill" : "regular"} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
