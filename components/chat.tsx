"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { LucideSend, LucideFileText } from "lucide-react";

interface Source {
  pageNumber: number | string;
  fileName: string;
}

interface Message {
  sender: "user" | "bot";
  text: string;
  sources?: Source[];
}

interface HistoryItem {
  role: "user" | "assistant";
  content: string;
}

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSearch = async () => {
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage("");

    // Step A: Immediately show User Message and Bot Placeholder
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userText },
      { sender: "bot", text: "Thinking..." },
    ]);
    setLoading(true);

    try {
      // Step B: Send POST payload including conversation history
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          history,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const botReply = data.answer;
        const sources: Source[] = data.sources || [];

        // Step C: Replace placeholder with actual answer
        setMessages((prev) =>
          prev.map((msg, idx) =>
            idx === prev.length - 1
              ? { sender: "bot", text: botReply, sources }
              : msg,
          ),
        );

        // Step D: Append to history state for subsequent follow-up queries
        setHistory((prev) => [
          ...prev,
          { role: "user", content: userText },
          { role: "assistant", content: botReply },
        ]);
      } else {
        setMessages((prev) =>
          prev.map((msg, idx) =>
            idx === prev.length - 1
              ? {
                  sender: "bot",
                  text: `Error: ${data.error || "Failed to fetch answer."}`,
                }
              : msg,
          ),
        );
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? {
                sender: "bot",
                text: "Something went wrong while connecting to the server.",
              }
            : msg,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full h-full max-w-4xl flex flex-col justify-between border rounded-xl p-6 bg-slate-50 shadow-sm">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            Ask a question about your uploaded document!
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white border text-gray-800 rounded-bl-none shadow-sm"
                }`}
              >
                {msg.text}

                {/* Display Sources Badge if available */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                    <LucideFileText className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-medium text-gray-600">Sources:</span>
                    {Array.from(
                      new Set(msg.sources.map((s) => s.pageNumber)),
                    ).map((pg, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 border text-gray-600 px-1.5 py-0.5 rounded text-[11px]"
                      >
                        Page {pg}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="flex gap-2 items-center bg-white p-2 border rounded-lg shadow-sm">
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about the document..."
          className="flex-1 outline-none px-3 py-2 text-sm text-gray-800"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !inputMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-md transition"
        >
          <LucideSend className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
