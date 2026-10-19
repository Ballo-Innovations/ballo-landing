import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { isHtmlContent, sanitizeBlogHtml } from "@/lib/contentFormat";

const proseClass =
  "prose prose-invert max-w-none leading-relaxed text-white/90 prose-headings:text-white prose-p:text-white/90 prose-strong:text-white prose-li:text-white/90 prose-ol:text-white/90 prose-ul:text-white/90 prose-blockquote:text-white/80 prose-code:text-white prose-td:text-white/90 prose-th:text-white prose-a:text-[var(--brand-color-1)] prose-img:rounded-2xl";

export function BlogBody({ body }: { body: string }) {
  if (!body?.trim()) return null;

  if (isHtmlContent(body)) {
    const cleanHtml = sanitizeBlogHtml(body);
    if (!cleanHtml.trim()) return null;
    return <div className={proseClass} dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
  }

  return (
    <div className={proseClass}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </div>
  );
}
