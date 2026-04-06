// Added "use client" — this component uses useRef and useTheme (which uses
// useContext internally). Without this, Next.js would crash trying to render
// hooks on the server.
"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react/ssr";
import { useRef } from "react";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const onSound = useRef<HTMLAudioElement | null>(null);
  const offSound = useRef<HTMLAudioElement | null>(null);

  const handleThemeToggle = () => {
    const prevTheme = theme;

    const soundToPlay =
      prevTheme === "dark" ? offSound.current : onSound.current;

    if (soundToPlay) {
      soundToPlay.currentTime = 0;
      soundToPlay.play().catch((e) => {
        console.error("Failed to play toggle sound:", e);
      });
    }

    toggleTheme();
  };

  return (
    // Removed the outer <div> wrapper — it was redundant since the <button>
    // inside already has the same dimensions and handles the click. Having two
    // stacked elements with the same size and cursor styles added unnecessary
    // DOM nesting. Audio elements don't need to be inside a visual wrapper.
    <>
      <audio ref={onSound} src="/sounds/light-on.mp3" preload="auto" />
      <audio ref={offSound} src="/sounds/light-off.mp3" preload="auto" />
      <button
        type="button"
        onClick={handleThemeToggle}
        // Added aria-label and aria-pressed so screen readers announce the
        // current theme state. Without these, users would only hear "button".
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        aria-pressed={theme === "dark"}
        className="relative flex w-6 h-6 cursor-pointer text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition"
      >
        <span
          className={`absolute inset-0 transition ${
            theme === "light"
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <SunIcon size={24} />
        </span>

        <span
          className={`absolute inset-0 transition ${
            theme === "dark"
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <MoonIcon size={24} />
        </span>
      </button>
    </>
  );
}
