"use client";

type Item = { id: string; text: string };

/**
 * Section links. The classic site has no Lenis, so scroll the window directly,
 * leaving room for the fixed header.
 */
export function LegalToc({ items }: { items: Item[] }) {
  function go(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top, behavior: "auto" });
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav aria-label="On this page">
      <p className="mb-3 text-sm font-bold uppercase tracking-wider text-white/65">On this page</p>
      <ol className="flex flex-col gap-2 border-l border-white/15">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(event) => go(event, item.id)}
              className="-ml-px block border-l border-transparent pl-4 text-[0.95rem] leading-snug text-white/65 hover:border-[var(--cyan)] hover:text-white"
            >
              {index + 1}. {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
