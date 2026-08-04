/** Detect TipTap/HTML bodies vs legacy Markdown posts. */
export function isHtmlContent(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^<(p|h[1-6]|ul|ol|blockquote|table|figure|img|div|pre)\b/i.test(trimmed)) return true;
  return /<\/?(p|h[1-6]|ul|ol|li|strong|em|a|img|table|blockquote)\b/i.test(trimmed.slice(0, 200));
}
