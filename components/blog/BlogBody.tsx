"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "isomorphic-dompurify";

import { isHtmlContent } from "@/lib/contentFormat";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "a",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "pre",
  "code",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "hr",
  "div",
  "span",
  "iframe",
  "figure",
  "figcaption",
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "width",
  "height",
  "class",
  "align",
  "colspan",
  "rowspan",
  "allow",
  "allowfullscreen",
  "frameborder",
  "referrerpolicy",
];

export function BlogBody({ body }: { body: string }) {
  if (!body?.trim()) return null;

  if (isHtmlContent(body)) {
    let clean = body;
    try {
      clean = DOMPurify.sanitize(body, {
        USE_PROFILES: { html: true },
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "referrerpolicy"],
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
      });
    } catch {
      // isomorphic-dompurify/jsdom can fail in some serverless runtimes; fall back to Markdown.
      return (
        <div className="prose prose-invert max-w-none leading-relaxed text-white/90 prose-headings:text-white prose-p:text-white/90 prose-strong:text-white prose-a:text-[var(--brand-color-1)]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
        </div>
      );
    }

    return (
      <div
        className="prose prose-invert max-w-none leading-relaxed text-white/90 prose-headings:text-white prose-p:text-white/90 prose-strong:text-white prose-li:text-white/90 prose-ol:text-white/90 prose-ul:text-white/90 prose-blockquote:text-white/80 prose-code:text-white prose-td:text-white/90 prose-th:text-white prose-a:text-[var(--brand-color-1)] prose-img:rounded-2xl"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  }

  return (
    <div className="prose prose-invert max-w-none leading-relaxed text-white/90 prose-headings:text-white prose-p:text-white/90 prose-strong:text-white prose-li:text-white/90 prose-ol:text-white/90 prose-ul:text-white/90 prose-blockquote:text-white/80 prose-code:text-white prose-a:text-[var(--brand-color-1)]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </div>
  );
}
