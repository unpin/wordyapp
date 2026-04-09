"use client";

import { XIcon } from "@phosphor-icons/react";
import {
  CaretRightIcon,
  CircleNotchIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import Button from "../ui/Button";

// FIX 2: typed the data state so TypeScript knows the shape of each result.
// Before it was useState([]) which is typed as never[], causing implicit any errors.
type WordResult = { id: string; word: string };

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<WordResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  const searchRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = useCallback(() => {
    setIsOpen(false);
  }, []);

  useClickOutside(searchRef, handleClickOutside);

  // FIX 3: pathname is intentionally used only as a trigger, not in the body.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname triggers close on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setIsLoading(false);
      setData([]);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const delayDebounceFn = setTimeout(() => {
      // FIX 1: moved setIsLoading(true) inside the timeout so the spinner only
      // appears after the debounce delay, not on every keystroke. Before this,
      // the spinner would flash briefly on each character the user typed.
      setIsLoading(true);

      fetch(`/api/search/${encodeURIComponent(trimmed)}`, {
        signal,
      })
        .then((res) => res.json())
        .then((data) => {
          setData(data);
          setIsOpen(true);
          setIsLoading(false);
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            setIsLoading(false);
          }
        });
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(delayDebounceFn);
    };
  }, [query]);

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center px-4 gap-4 border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 focus-within:bg-gray-200 dark:focus-within:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500 rounded-md transition focus-within:scale-[1.01]">
        <span className="text-gray-600 dark:text-gray-500">
          {isLoading ? (
            <CircleNotchIcon size={20} className="animate-spin" />
          ) : (
            <MagnifyingGlassIcon size={20} />
          )}
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          // FIX 4: only reopen the dropdown on focus if there are already results.
          // Before, focusing the input always set isOpen to true even with no data,
          // which was a no-op visually but left state in an inconsistent condition.
          onFocus={() => data.length > 0 && setIsOpen(true)}
          className="grow h-14 outline-0 min-w-0"
          placeholder="Stichwort"
          // FIX 5: role="combobox" belongs on the input — it's the focusable element.
          // Putting it on the wrapper div was wrong because divs aren't focusable.
          // aria-expanded and aria-controls wire it up to the results list below.
          role="combobox"
          aria-label="Search for a word"
          aria-expanded={isOpen && data.length > 0}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-haspopup="listbox"
        />
        {query.length > 0 && (
          <Button variant="icon" onClick={() => setQuery("")}>
            <span className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
              <XIcon size={20} />
            </span>
          </Button>
        )}
      </div>
      {/* FIX 5: role="listbox" and option go on divs, not ul/li.
          Biome rejects interactive roles on non-interactive HTML elements like
          ul and li. Using divs here lets us keep the ARIA semantics correctly. */}
      <div
        id="search-results"
        role="listbox"
        aria-hidden={!isOpen || data.length === 0}
        className={[
          "absolute top-full mt-4 w-full bg-white dark:bg-gray-800 rounded-md overflow-hidden",
          "transition duration-300 ease-out border border-gray-200 dark:border-gray-700 z-10",
          isOpen && data.length > 0
            ? "opacity-100 translate-y-0 pointer-events-auto visible"
            : "opacity-50 translate-y-2 pointer-events-none invisible",
        ].join(" ")}
      >
        {data.map(({ word, id }) => (
          <div key={id}>
            <Link
              role="option"
              aria-selected={false}
              href={`/dictionary/${encodeURIComponent(word)}`}
              className="flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition gap-4"
            >
              <span className="truncate">{word}</span>
              <CaretRightIcon
                width={20}
                className="text-gray-600 dark:text-gray-300"
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
