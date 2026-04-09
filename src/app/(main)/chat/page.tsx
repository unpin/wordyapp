"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function addMessage(
  role: ChatMessage["role"],
  content: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
) {
  setMessages((prev) => [...prev, { id: crypto.randomUUID(), role, content }]);
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textarea, setTextarea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const content = textarea.trim();
    if (!content || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    setTextarea("");
    setError(null);
    addMessage("user", content, setMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      addMessage("assistant", data.text, setMessages);
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div>
      <h3>AI Chatbot</h3>
      <div className="max-w-75">
        <ul className="border border-gray-700 rounded p-4 flex flex-col gap-2 max-h-120 overflow-y-auto">
          {messages.map((message) => (
            <li
              key={message.id}
              className={`${
                message.role === "user"
                  ? "ml-auto bg-blue-400 text-white"
                  : "mr-auto bg-gray-400 text-white"
              } px-4 py-1 rounded-md max-w-[80%] wrap-break-word`}
            >
              {message.content}
            </li>
          ))}

          {isLoading && (
            <li className="mr-auto bg-gray-400 text-white px-4 py-1 rounded-md animate-pulse">
              Thinking...
            </li>
          )}

          {error && (
            <li className="text-red-500 text-sm text-center">{error}</li>
          )}

          <div ref={bottomRef} />
        </ul>

        <textarea
          className="w-full border mt-2 border-gray-600 p-2 resize-none"
          placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
          value={textarea}
          onChange={(e) => setTextarea(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          disabled={isLoading}
        />

        <Button
          onClick={handleSend}
          className="ml-auto block"
          disabled={isLoading || !textarea.trim()}
        >
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
