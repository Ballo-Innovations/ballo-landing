"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageSquare, Send, X } from "lucide-react";

import brutusMark from "@/public/BalloAds Logo New/BalloAds-Icon.png";
import { useWaitlist } from "../waitlist/WaitlistProvider";
import { isFeatureEnabled } from "@/lib/featureFlags";
import type { BrutusChatSource } from "@/lib/brutusChat";
import { MAX_MESSAGE_CHARS } from "@/lib/brutusChat";

/**
 * The "Ask Brutus" chat widget: answers visitor questions from content already
 * published on this site.
 *
 * Styled as a liquid-glass card to match the waitlist modal and the header,
 * rather than as a generic chat bubble, so it reads as part of the site. Styles
 * live in styles/components/brutus-chat.css.
 *
 * Performance, per the home page's rules: no animation library, no per-frame
 * JS, no backdrop-filter, and the panel's markup is only mounted once the
 * visitor opens it, so a closed widget is a single button.
 */

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: BrutusChatSource[];
  followUps?: string[];
  /** Shows the "talk to our team" button under the bubble. */
  offerHandoff?: boolean;
  isError?: boolean;
};

const GREETING: Message = {
  id: 0,
  role: "assistant",
  content: "Hi, I'm Brutus. Ask me about our channels, pricing, or how to get started.",
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

  // Read the flag after mount so the server and client render the same markup.
  // The flag also honours a localStorage override, which only exists client side.
  const [enabled, setEnabled] = useState(false);
  useEffect(() => setEnabled(isFeatureEnabled("siteAssistant")), []);

  // Keep the newest turn in view. `scrollTop` on the thread only, never the
  // page, so opening the widget cannot pull the visitor out of a section.
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

  const handoff = useCallback(() => {
    setIsOpen(false);
    openWaitlist();
  }, [openWaitlist]);

  const send = useCallback(
    async (raw: string) => {
      const message = raw.trim().slice(0, MAX_MESSAGE_CHARS);
      if (!message || isSending) return;

      // History for the request, taken before this turn. The greeting is left
      // out: it is local copy, not part of the conversation upstream.
      const history = messages
        .filter((m) => m.id !== 0 && !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [...prev, { id: nextId.current++, role: "user", content: message }]);
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
                  : "Something went wrong at my end. Please try again.",
              isError: true,
              // A rate limit fixes itself in a few seconds, so it needs no hand-off.
              offerHandoff: res.status !== 429,
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
            offerHandoff: data?.escalate === true,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId.current++,
            role: "assistant",
            content: "I couldn't reach Brutus just then. Please try again.",
            isError: true,
            offerHandoff: true,
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
  const suggestions = !isSending && last?.role === "assistant" ? (last.followUps ?? []) : [];

  return (
    <>
      {/* Hidden while the panel is open: the panel has its own close button, and
          a second one sitting on top of the card is just clutter. */}
      {!isOpen ? (
        <button
          type="button"
          className="brutus-widget__launcher"
          onClick={() => setIsOpen(true)}
          aria-expanded={false}
          aria-controls="brutus-widget-panel"
        >
          <MessageSquare size={18} aria-hidden="true" />
          <span className="brutus-widget__launcher-label">Ask Brutus</span>
        </button>
      ) : null}

      {isOpen ? (
        <section id="brutus-widget-panel" className="brutus-widget__panel" aria-label="Ask Brutus">
          <span className="brutus-widget__aurora" aria-hidden="true" />

          <header className="brutus-widget__header">
            <span className="brutus-widget__avatar">
              <Image src={brutusMark} alt="" aria-hidden="true" sizes="32px" />
            </span>
            <div className="brutus-widget__identity">
              <p className="brutus-widget__title">Brutus</p>
              <p className="brutus-widget__subtitle">Ask about pricing, channels, or setup</p>
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
                className={`brutus-widget__row brutus-widget__row--${
                  message.role === "user" ? "out" : "in"
                }`}
              >
                <div
                  className={`brutus-widget__bubble${message.isError ? " brutus-widget__bubble--error" : ""}`}
                >
                  <p>{message.content}</p>
                </div>

                {message.sources && message.sources.length > 0 ? (
                  <div className="brutus-widget__sources">
                    <p className="brutus-widget__sources-label">Read more</p>
                    <ul>
                      {message.sources.map((source, i) => (
                        <li key={`${source.title}-${i}`}>
                          {source.url ? (
                            <Link href={source.url} onClick={() => setIsOpen(false)}>
                              {source.title}
                              <ArrowUpRight size={12} aria-hidden="true" />
                            </Link>
                          ) : (
                            <span>{source.title}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {message.offerHandoff ? (
                  <button type="button" className="brutus-widget__handoff" onClick={handoff}>
                    Talk to our team
                  </button>
                ) : null}
              </div>
            ))}

            {isSending ? (
              <div className="brutus-widget__row brutus-widget__row--in">
                <div className="brutus-widget__bubble brutus-widget__bubble--typing">
                  <span className="brutus-widget__typing">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="sr-only">Brutus is typing</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="brutus-widget__footer">
            {suggestions.length > 0 ? (
              <div className="brutus-widget__suggestions">
                {suggestions.slice(0, 2).map((suggestion) => (
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
                placeholder="Ask a question"
                maxLength={MAX_MESSAGE_CHARS}
                aria-label="Your question"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={isSending || input.trim() === ""}
                aria-label="Send question"
              >
                <Send size={15} aria-hidden="true" />
              </button>
            </form>

            <p className="brutus-widget__fineprint">
              Answers come from this site.{" "}
              {/* The link is here for the in-between case: a grounded answer can
                  still end in "the team can quote that", and then the visitor needs
                  somewhere to go. Dropped when the bubble above already offers it,
                  so the same button never shows twice. */}
              {last?.offerHandoff ? (
                "If Brutus is not sure, our team will follow up."
              ) : (
                <>
                  <button
                    type="button"
                    className="brutus-widget__fineprint-link"
                    onClick={handoff}
                  >
                    Talk to our team
                  </button>{" "}
                  any time.
                </>
              )}
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}
