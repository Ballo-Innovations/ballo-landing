"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageSquare, Send, Sparkles, X } from "lucide-react";

import { useWaitlist } from "../waitlist/WaitlistProvider";
import { isFeatureEnabled } from "@/lib/featureFlags";
import type { BrutusChatSource } from "@/lib/brutusChat";
import { MAX_MESSAGE_CHARS } from "@/lib/brutusChat";

/**
 * The floating "Ask Brutus" widget — a RAG chatbot answering visitor questions
 * from published site content via /api/brutus-chat.
 *
 * Performance, per the home page's rules: no animation library and no
 * per-frame JS (transitions are CSS, in styles/components/brutus-chat.css), and
 * the panel's markup is only mounted once the visitor opens it, so a closed
 * widget is one button.
 *
 * Answers are grounded, never authoritative: when the assistant can't ground an
 * answer it hands off to the waitlist form rather than guessing.
 */

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: BrutusChatSource[];
  followUps?: string[];
  /** Renders the human hand-off CTA under the bubble. */
  escalate?: boolean;
  isError?: boolean;
};

const GREETING: Message = {
  id: 0,
  role: "assistant",
  content:
    "Hi, I'm Brutus. Ask me anything about BalloAds — channels, pricing, or getting set up. I answer from what's published on this site.",
  followUps: ["What can I send with BalloAds?", "How does pricing work?"],
};

export function BrutusChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const nextId = useRef(1);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openWaitlist } = useWaitlist();

  // Client-side flag, so a build with the flag off still ships the code but
  // never mounts it. Read after mount to keep the server and client markup
  // identical (the flag also honours a localStorage override).
  const [enabled, setEnabled] = useState(false);
  useEffect(() => setEnabled(isFeatureEnabled("siteAssistant")), []);

  // Keep the newest turn in view. `scrollTop` on the thread only — never the
  // page — so opening the widget cannot yank the visitor out of a section.
  useEffect(() => {
    if (!isOpen) return;
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [isOpen, messages, isSending]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const send = useCallback(
    async (raw: string) => {
      const message = raw.trim().slice(0, MAX_MESSAGE_CHARS);
      if (!message || isSending) return;

      // Snapshot the history before this turn — the assistant's own greeting is
      // excluded, it is local copy and not part of the conversation upstream.
      const history = messages
        .filter((m) => m.id !== 0 && !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "user", content: message },
      ]);
      setInput("");
      setIsSending(true);

      try {
        const res = await fetch("/api/brutus-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, history }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setMessages((prev) => [
            ...prev,
            {
              id: nextId.current++,
              role: "assistant",
              content:
                typeof data?.error === "string"
                  ? data.error
                  : "Something went wrong on my side. Try again in a moment.",
              isError: true,
              escalate: res.status !== 429,
            },
          ]);
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: nextId.current++,
            role: "assistant",
            content: String(data?.reply ?? ""),
            sources: Array.isArray(data?.sources) ? data.sources : [],
            followUps: Array.isArray(data?.followUps) ? data.followUps : [],
            escalate: data?.escalate === true,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId.current++,
            role: "assistant",
            content: "I couldn't reach my brain just then. Try again in a moment.",
            isError: true,
            escalate: true,
          },
        ]);
      } finally {
        setIsSending(false);
        inputRef.current?.focus();
      }
    },
    [isSending, messages],
  );

  if (!enabled) return null;

  const last = messages[messages.length - 1];

  return (
    <>
      <button
        type="button"
        className="brutus-widget__launcher"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="brutus-widget-panel"
      >
        {isOpen ? (
          <X size={20} aria-hidden="true" />
        ) : (
          <MessageSquare size={20} aria-hidden="true" />
        )}
        <span className="brutus-widget__launcher-label">
          {isOpen ? "Close" : "Ask Brutus"}
        </span>
      </button>

      {isOpen ? (
        <section
          id="brutus-widget-panel"
          className="brutus-widget__panel"
          aria-label="Ask Brutus"
        >
          <header className="brutus-widget__header">
            <span className="brutus-widget__avatar">
              <Sparkles size={14} aria-hidden="true" />
            </span>
            <div>
              <p className="brutus-widget__title">Brutus</p>
              <p className="brutus-widget__subtitle">Answers from this site&apos;s content</p>
            </div>
            <button
              type="button"
              className="brutus-widget__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </header>

          <div
            className="brutus-widget__thread"
            ref={threadRef}
            role="log"
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`brutus-widget__msg brutus-widget__msg--${
                  message.role === "user" ? "out" : "in"
                }${message.isError ? " brutus-widget__msg--error" : ""}`}
              >
                <p>{message.content}</p>

                {message.sources && message.sources.length > 0 ? (
                  <ul className="brutus-widget__sources">
                    {message.sources.map((source, i) => (
                      <li key={`${source.title}-${i}`}>
                        {source.url ? (
                          <Link href={source.url} onClick={() => setIsOpen(false)}>
                            {source.title}
                          </Link>
                        ) : (
                          <span>{source.title}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {message.escalate ? (
                  <button
                    type="button"
                    className="brutus-widget__handoff"
                    onClick={() => {
                      setIsOpen(false);
                      openWaitlist();
                    }}
                  >
                    Talk to the team
                  </button>
                ) : null}
              </div>
            ))}

            {isSending ? (
              <div className="brutus-widget__msg brutus-widget__msg--in">
                <span className="brutus-widget__typing" aria-label="Brutus is typing">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            ) : null}
          </div>

          {!isSending && last?.role === "assistant" && last.followUps?.length ? (
            <div className="brutus-widget__suggestions">
              {last.followUps.slice(0, 2).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="brutus-widget__suggestion"
                  onClick={() => send(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}

          <form
            className="brutus-widget__composer"
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about channels, pricing, setup…"
              maxLength={MAX_MESSAGE_CHARS}
              aria-label="Your question"
              disabled={isSending}
            />
            <button type="submit" disabled={isSending || input.trim() === ""} aria-label="Send">
              <Send size={16} aria-hidden="true" />
            </button>
          </form>

          <p className="brutus-widget__disclaimer">
            Brutus answers from published site content. For anything it can&apos;t confirm,
            the team will follow up.
          </p>
        </section>
      ) : null}
    </>
  );
}
