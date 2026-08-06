import sanitizeHtml from "sanitize-html";

/** Detect TipTap/HTML bodies vs legacy Markdown posts. */
export function isHtmlContent(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^<(p|h[1-6]|ul|ol|blockquote|table|figure|img|div|pre)\b/i.test(trimmed)) return true;
  return /<\/?(p|h[1-6]|ul|ol|li|strong|em|a|img|table|blockquote)\b/i.test(trimmed.slice(0, 200));
}

// Elements TipTap's toolbar (see ballo-cms/components/blog/RichTextEditor.tsx) can
// actually produce — StarterKit (paragraph/heading[2,3]/bold/italic/strike/code/
// blockquote/lists/codeBlock/hr/br), Underline, TextAlign, Link, Image, Youtube
// (renders an <iframe>), and the Table/TableRow/TableHeader/TableCell extensions —
// plus a few legacy tags (h1/h4/div/span/figure/figcaption) kept for older posts
// authored before TipTap.
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
  "colgroup",
  "col",
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

// Text-align is the only inline style TipTap's toolbar emits (via the TextAlign
// extension, on paragraphs/headings) and column width (via the resizable Table
// extension, on <col>). Everything else is dropped.
const ALLOWED_STYLES: sanitizeHtml.IOptions["allowedStyles"] = {
  "*": {
    "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
  },
  col: {
    width: [/^\d+(\.\d+)?(px|%)$/],
  },
};

export function sanitizeBlogHtml(html: string): string {
  if (!html?.trim()) return "";

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      "*": ["class", "title", "align"],
      p: ["style"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "referrerpolicy"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      col: ["style", "width"],
    },
    allowedStyles: ALLOWED_STYLES,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    // Only the Youtube extension emits iframes — keep embeds scoped to it.
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "youtube-nocookie.com"],
    disallowedTagsMode: "discard",
    // Force a safe rel on every link regardless of what the editor produced.
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: "noopener noreferrer" },
      }),
    },
  });
}
