import sanitizeHtml from "sanitize-html";

/** Detect TipTap/HTML bodies vs legacy Markdown posts. */
export function isHtmlContent(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^<(p|h[1-6]|ul|ol|blockquote|table|figure|img|div|pre|video|audio|iframe)\b/i.test(trimmed)) return true;
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
  "video",
  "audio",
  "figure",
  "figcaption",
];

// Uploaded audio/video must come from our own CMS asset storage — no hotlinked
// media from arbitrary hosts.
const MEDIA_HOSTS = new Set(["s3.balloads.com", "assets.balloads.com"]);

// Third-party players the CMS editor can embed (ballo-cms lib/mediaEmbeds.ts).
const IFRAME_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
  "player.vimeo.com",
  "open.spotify.com",
  "w.soundcloud.com",
  "www.tiktok.com",
];

function isOwnMediaUrl(src: string | undefined): boolean {
  if (!src) return false;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && MEDIA_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

// Players always get visible controls and never autoplay.
const mediaTransform =
  (extra: Record<string, string>): sanitizeHtml.Transformer =>
  (tagName, attribs) => ({
    tagName,
    attribs: { ...attribs, controls: "", preload: "metadata", ...extra },
  });

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
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "referrerpolicy", "loading", "data-embed"],
      video: ["src", "controls", "preload", "playsinline", "poster"],
      audio: ["src", "controls", "preload"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      col: ["style", "width"],
    },
    allowedStyles: ALLOWED_STYLES,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"], video: ["https"], audio: ["https"] },
    allowedIframeHostnames: IFRAME_HOSTS,
    exclusiveFilter: (frame) =>
      (frame.tag === "video" || frame.tag === "audio") && !isOwnMediaUrl(frame.attribs.src),
    disallowedTagsMode: "discard",
    // Force a safe rel on every link regardless of what the editor produced.
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: "noopener noreferrer" },
      }),
      video: mediaTransform({ playsinline: "" }),
      audio: mediaTransform({}),
    },
  });
}
