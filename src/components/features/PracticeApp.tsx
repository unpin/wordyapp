"use client";

import { ArrowLeftIcon, CheckIcon } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "../ui/Button";

type Collection = {
  id: string;
  name: string;
  bookmarkCount: number;
};

type Option = { text: string; isCorrect: boolean };

type Question = {
  bookmarkId: string;
  word: string;
  lang: string;
  options: Option[];
};

type PracticeAppProps = {
  collections: Collection[];
  totalBookmarks: number;
};

type Phase = "selection" | "loading" | "game" | "results";

export default function PracticeApp({
  collections,
  totalBookmarks,
}: PracticeAppProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("selection");
  const [selectedId, setSelectedId] = useState<string>("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctBookmarkIds, setCorrectBookmarkIds] = useState<string[]>([]);
  const [incorrectBookmarkIds, setIncorrectBookmarkIds] = useState<string[]>(
    [],
  );
  // Track which option index the user picked — null means not yet answered
  const [answeredIndex, setAnsweredIndex] = useState<number | null>(null);

  const currentQuestion = questions[currentIndex];
  const total = questions.length;

  // Word count for the currently selected set
  const selectedCount =
    selectedId === "all"
      ? totalBookmarks
      : (collections.find((c) => c.id === selectedId)?.bookmarkCount ?? 0);

  const handleStart = async () => {
    setPhase("loading");
    try {
      const url =
        selectedId === "all"
          ? "/api/practice"
          : `/api/practice?collectionId=${selectedId}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.questions?.length) {
        setPhase("selection");
        return;
      }

      setQuestions(data.questions);
      setCurrentIndex(0);
      setScore(0);
      setCorrectBookmarkIds([]);
      setIncorrectBookmarkIds([]);
      setAnsweredIndex(null);
      setPhase("game");
    } catch {
      setPhase("selection");
    }
  };

  const handleAnswer = (option: Option, index: number) => {
    if (answeredIndex !== null) return; // prevent double click while feedback shows
    setAnsweredIndex(index);

    const newScore = option.isCorrect ? score + 1 : score;
    const newCorrectIds = option.isCorrect
      ? [...correctBookmarkIds, currentQuestion.bookmarkId]
      : correctBookmarkIds;
    const newIncorrectIds = !option.isCorrect
      ? [...incorrectBookmarkIds, currentQuestion.bookmarkId]
      : incorrectBookmarkIds;

    if (option.isCorrect) {
      setScore(newScore);
      setCorrectBookmarkIds(newCorrectIds);
    } else {
      setIncorrectBookmarkIds(newIncorrectIds);
    }

    // Show feedback briefly then advance
    setTimeout(async () => {
      const isLast = currentIndex + 1 >= total;

      if (isLast) {
        // Batch-update review counts at game end: increment correct, reset incorrect
        if (newCorrectIds.length > 0 || newIncorrectIds.length > 0) {
          await fetch("/api/practice/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookmarkIds: newCorrectIds,
              incorrectBookmarkIds: newIncorrectIds,
            }),
          });
        }
        setPhase("results");
      } else {
        setCurrentIndex((i) => i + 1);
        setAnsweredIndex(null);
      }
    }, 700);
  };

  const handleReset = () => {
    setPhase("selection");
    setSelectedId("all");
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setCorrectBookmarkIds([]);
    setIncorrectBookmarkIds([]);
    setAnsweredIndex(null);
  };

  // Full class string for option buttons — handles idle, correct, wrong, and faded states
  const getOptionClass = (option: Option, index: number): string => {
    const base =
      "w-full p-4 rounded-lg border text-base font-medium text-left transition cursor-pointer disabled:cursor-default";
    if (answeredIndex === null)
      return `${base} border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-500/5`;
    if (option.isCorrect)
      return `${base} border-green-500 bg-green-500/10 text-green-400`;
    if (index === answeredIndex)
      return `${base} border-red-500 bg-red-500/10 text-red-400`;
    return `${base} border-gray-200 dark:border-gray-800 opacity-40`;
  };

  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-64 text-gray-600 dark:text-gray-500">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p>Loading questions…</p>
      </div>
    );
  }

  if (phase === "selection") {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Practice</h1>
          <p className="text-gray-600 dark:text-gray-500 mt-1">
            Choose a set to practice
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {/* All bookmarks option */}
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
            All words
          </p>
          <button
            type="button"
            onClick={() => setSelectedId("all")}
            disabled={totalBookmarks === 0}
            className={`w-full flex items-center gap-3 p-4 rounded-lg border transition cursor-pointer text-left ${
              selectedId === "all"
                ? "border-blue-500 bg-blue-500/10"
                : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {/* Radio dot */}
            <span
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                selectedId === "all"
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-400 dark:border-gray-600"
              }`}
            >
              {selectedId === "all" && (
                <CheckIcon size={11} weight="bold" className="text-white" />
              )}
            </span>
            <span className="font-medium flex-1">All Bookmarks</span>
            <span className="text-sm text-gray-600 dark:text-gray-500 tabular-nums">
              {totalBookmarks} words
            </span>
          </button>

          {/* Per-collection options */}
          {collections.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mt-4 mb-1">
                Collections
              </p>
              {collections.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  disabled={c.bookmarkCount === 0}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border transition cursor-pointer text-left ${
                    selectedId === c.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                      selectedId === c.id
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-400 dark:border-gray-600"
                    }`}
                  >
                    {selectedId === c.id && (
                      <CheckIcon
                        size={11}
                        weight="bold"
                        className="text-white"
                      />
                    )}
                  </span>
                  <span className="font-medium flex-1">{c.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-500 tabular-nums">
                    {c.bookmarkCount} words
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        <Button
          onClick={handleStart}
          disabled={selectedCount === 0}
          size="lg"
          className="w-full"
        >
          Start Practice · {selectedCount} words
        </Button>
      </div>
    );
  }

  if (phase === "game" && currentQuestion) {
    return (
      <div className="flex flex-col gap-6">
        {/* Top bar: quit / progress / score */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition"
          >
            <ArrowLeftIcon size={15} />
            Quit
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-500 font-medium">
            {currentIndex + 1} / {total}
          </span>
          <span className="text-sm font-medium text-blue-400">
            {score} correct
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentIndex / total) * 100}%` }}
          />
        </div>

        {/* Word */}
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 gap-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400">
            Translate
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            {currentQuestion.word}
          </h2>
        </div>

        {/* Answer options — plain buttons for full class control */}
        <div className="flex flex-col gap-3">
          {currentQuestion.options.map((option, i) => (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: options are stable per question
              key={i}
              type="button"
              onClick={() => handleAnswer(option, i)}
              disabled={answeredIndex !== null}
              className={getOptionClass(option, i)}
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const circumference = 2 * Math.PI * 44;
    return (
      <div className="flex flex-col items-center gap-10 py-8">
        <h2 className="text-2xl font-bold">Practice Complete!</h2>

        {/* Circular score ring */}
        <div className="relative flex items-center justify-center w-40 h-40">
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-300 dark:text-gray-800"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - percentage / 100)}
              className="text-blue-500 transition-all duration-700"
            />
          </svg>
          <div className="flex flex-col items-center">
            <p className="text-3xl font-bold">
              {score}/{total}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-500">
              {percentage}%
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button onClick={handleStart} size="lg" className="w-full">
            Practice Again
          </Button>
          <Button variant="ghost" onClick={handleReset} className="w-full">
            Change Collection
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/bookmarks")}
            className="w-full"
          >
            Back to Bookmarks
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
