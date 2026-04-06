import { BarbellIcon, BookmarksIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ThemeToggleButton from "../features/ThemeToggleButton";
import UserProfileMenu from "../features/UserProfileMenu";

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name =
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "User";
  const email = user?.email ?? "";

  return (
    <nav className="flex items-center">
      <ul className="flex gap-6 items-center">
        <li>
          <ThemeToggleButton />
        </li>
        <li>
          <Link
            href="/practice"
            aria-label="Practice"
            className="text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition"
          >
            <BarbellIcon size={24} />
          </Link>
        </li>
        <li>
          <Link
            href="/bookmarks"
            aria-label="Bookmarks"
            className="text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition"
          >
            <BookmarksIcon size={24} />
          </Link>
        </li>
        <li>
          <UserProfileMenu name={name} email={email} />
        </li>
      </ul>
    </nav>
  );
}
