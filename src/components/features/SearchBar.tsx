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

type WordResult = { id: string; word: string };

const PAGE_SIZE = 10;

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<WordResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const queryRef = useRef("");

  const handleClickOutside = useCallback(() => setIsOpen(false), []);
  useClickOutside(searchRef, handleClickOutside);

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname triggers close on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const fetchResults = useCallback(
    async (q: string, off: number, signal: AbortSignal) => {
      const res = await fetch(
        `/api/search/${encodeURIComponent(q)}?offset=${off}`,
        { signal },
      );
      return res.json() as Promise<{ results: WordResult[]; hasMore: boolean }>;
    },
    [],
  );

  // Initial search — fires on query change with debounce
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setIsLoading(false);
      setData([]);
      setHasMore(false);
      setOffset(0);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(() => {
      setIsLoading(true);
      queryRef.current = trimmed;
      offsetRef.current = 0;

      fetchResults(trimmed, 0, controller.signal)
        .then(({ results, hasMore }) => {
          setData(results);
          setHasMore(hasMore);
          setOffset(PAGE_SIZE);
          setIsOpen(true);
          setIsLoading(false);
        })
        .catch((err) => {
          if (err.name !== "AbortError") setIsLoading(false);
        });
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, fetchResults]);

  // Load next page and append
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    const q = queryRef.current;
    const off = offsetRef.current;

    setIsLoadingMore(true);
    try {
      const { results, hasMore: more } = await fetchResults(q, off, new AbortController().signal);
      setData((prev) => [...prev, ...results]);
      setHasMore(more);
      offsetRef.current = off + PAGE_SIZE;
      setOffset((o) => o + PAGE_SIZE);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, fetchResults]);

  // Infinite scroll via IntersectionObserver on sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 1.0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

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
          onFocus={() => data.length > 0 && setIsOpen(true)}
          className="grow h-14 outline-0 min-w-0"
          placeholder="Stichwort"
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

      <div
        id="search-results"
        role="listbox"
        aria-hidden={!isOpen || data.length === 0}
        className={[
          "absolute top-full mt-4 w-full bg-white dark:bg-gray-800 rounded-md",
          "max-h-96 overflow-y-auto",
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
              prefetch={false}
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

        {/* Sentinel for IntersectionObserver — invisible, triggers loadMore on scroll */}
        {hasMore && <div ref={sentinelRef} className="h-1" />}

        {isLoadingMore && (
          <div className="flex justify-center py-3 text-gray-400">
            <CircleNotchIcon size={18} className="animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
