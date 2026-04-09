"use client";

import { SpeakerHighIcon } from "@phosphor-icons/react/ssr";
import { useCallback } from "react";
import Button from "../ui/Button";

type TextToSpeachButtonProps = {
  text: string;
  size: number;
  lang: string;
};

export default function TextToSpeachButton({
  text,
  size,
  lang,
}: TextToSpeachButtonProps) {
  // Wrapped in useCallback so the function reference is stable across renders.
  // This matters when TextToSpeachButton is used inside memoized parents —
  // without useCallback a new function is created every render which would
  // cause unnecessary re-renders of any child that receives it as a prop.
  const handleSpeak = useCallback(() => {
    if (!text) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech synthesis not supported");
    }
  }, [text, lang]);

  return (
    // Added aria-label so screen readers describe the button action.
    // Icon-only buttons have no visible text, so without this a user would
    // just hear "button" with no context.
    <Button variant="icon" onClick={handleSpeak} aria-label={`Speak: ${text}`}>
      <SpeakerHighIcon size={size} weight="fill" />
    </Button>
  );
}
