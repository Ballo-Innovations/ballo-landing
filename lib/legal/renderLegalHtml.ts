import sanitizeHtml from "sanitize-html";

export type LegalTocItem = { id: string; text: string };

/**
 * Turns a legal document body from the CMS editor into safe HTML for the site.
 *
 * - Sanitized to text, headings, lists, links and tables (no images, media,
 *   embeds or inline styles: a legal document has no use for them).
 * - Every <h2> gets a stable id and becomes an "On this page" entry. The
 *   numbering is CSS (counters in app/legal/legal.css), so editors write
 *   plain headings.
 * - `[[TBC: note]]` typed by an editor becomes a highlighted <mark>, so an
 *   unconfirmed fact cannot be missed by a reviewer.
 */
export function renderLegalHtml(bodyHtml: string): { html: string; toc: LegalTocItem[] } {
  const clean = sanitizeHtml(bodyHtml ?? "", {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li",
      "h2", "h3", "h4", "blockquote", "hr", "mark", "code",
      "table", "thead", "tbody", "tr", "th", "td", "colgroup", "col",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      ol: ["start"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    disallowedTagsMode: "discard",
    transformTags: {
      // An H1 in the body would compete with the page title.
      h1: "h2",
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href ?? "") && !/^https?:\/\/(www\.)?balloads\.com/i.test(attribs.href ?? "");
        return {
          tagName,
          attribs: external
            ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
            : { href: attribs.href ?? "" },
        };
      },
    },
  });

  const toc: LegalTocItem[] = [];
  const used = new Set<string>();

  const withAnchors = clean.replace(/<h2>([\s\S]*?)<\/h2>/g, (_match, inner: string) => {
    const text = decodeEntities(inner.replace(/<[^>]+>/g, "")).trim();
    if (!text) return "";
    const id = uniqueId(slugify(text) || "section", used);
    toc.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });

  // Runs on sanitized HTML, so the note text is already escaped. `[^\]<]`
  // keeps a marker from spanning tags.
  const html = withAnchors.replace(/\[\[([^\]<]+)\]\]/g, '<mark class="legal-tbc">$1</mark>');

  return { html, toc };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function uniqueId(base: string, used: Set<string>): string {
  let id = base;
  for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
  used.add(id);
  return id;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
