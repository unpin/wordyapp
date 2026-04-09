"use client";

import { SparkleIcon } from "@phosphor-icons/react/ssr";
import { useState } from "react";

type Props = {
  word: string;
  translations: string[];
  abbr?: string | null;
  grammar?: string | null;
};

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; sentence: string }
  | { status: "error"; message: string };

export default function GenerateExample({
  word,
  translations,
  abbr,
  grammar,
}: Props) {
  const [state, setState] = useState<State>({ status: "idle" });

  const generate = async () => {
    setState({ status: "loading" });

    try {
      const res = await fetch("/api/generate-example", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, translations, abbr, grammar }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState({
          status: "error",
          message: data.message ?? "Something went wrong",
        });
      } else {
        setState({ status: "success", sentence: data.sentence });
      }
    } catch {
      setState({ status: "error", message: "Network error, please try again" });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {state.status === "idle" && (
        <button
          type="button"
          onClick={generate}
          className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit cursor-pointer"
        >
          <SparkleIcon size={13} weight="fill" />
          Generate example sentence
        </button>
      )}

      {state.status === "loading" && (
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <SparkleIcon
            size={13}
            weight="fill"
            className="animate-pulse text-blue-400"
          />
          Generating…
        </div>
      )}

      {state.status === "success" && (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-gray-600 dark:text-gray-300 italic">
            „{state.sentence}"
          </p>
          <button
            type="button"
            onClick={generate}
            className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit cursor-pointer"
          >
            <SparkleIcon size={11} weight="fill" />
            Regenerate
          </button>
        </div>
      )}

      {state.status === "error" && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-red-500 dark:text-red-400">
            {state.message}
          </p>
          <button
            type="button"
            onClick={generate}
            className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit cursor-pointer"
          >
            <SparkleIcon size={11} weight="fill" />
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
