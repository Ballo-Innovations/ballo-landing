"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { getLenis } from "@/app/components/ui/SmoothScroll";

type Item = { id: string; text: string };

/** Roughly where the floating header ends, in px; a section counts as being read once its heading passes this line. */
const READING_LINE = 160;

/**
 * Section links. Scrolling goes through Lenis when it is running, because
 * writing the scroll position directly fights its easing (see SmoothScroll).
 * `variant="rail"` is the sticky list beside the text on large screens and
 * highlights the section being read; `variant="drawer"` is the collapsible
 * list above the text on smaller screens.
 */
export function LegalToc({ items, variant = "rail" }: { items: Item[]; variant?: "rail" | "drawer" }) {
  const [active, setActive] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (variant !== "rail" || items.length === 0) return;
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    // The current section is the last heading that has scrolled above the reading line.
    const update = () => {
      const line = READING_LINE;
      let current: string | null = null;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= line) current = heading.id;
        else break;
      }
      setActive(current ?? headings[0].id);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items, variant]);

  function go(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    history.replaceState(null, "", `#${id}`);
    const scroll = () => {
      const lenis = getLenis();
      // Both honour the heading's scroll-margin-top (legal.css), which clears the header.
      if (lenis) lenis.scrollTo(target);
      else target.scrollIntoView({ behavior: "auto", block: "start" });
    };
    // Closing the drawer moves the text up by the list's height, so measure the
    // target only after the page has laid out without it.
    if (drawerRef.current?.open) {
      drawerRef.current.open = false;
      requestAnimationFrame(() => requestAnimationFrame(scroll));
    } else {
      scroll();
    }
  }

  const list = (
    <ol className="legal-toc__list">
      {items.map((item, index) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={(event) => go(event, item.id)}
            className="legal-toc__link"
            aria-current={active === item.id ? "location" : undefined}
          >
            <span className="legal-toc__num" aria-hidden="true">
              {index + 1}
            </span>
            <span>{item.text}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "drawer") {
    return (
      <details ref={drawerRef} className="legal-toc legal-toc--drawer">
        <summary className="legal-toc__summary">
          <span>On this page</span>
          <span className="legal-toc__count">{items.length} sections</span>
          <ChevronDown className="legal-toc__chevron" size={18} aria-hidden="true" />
        </summary>
        <nav aria-label="On this page">{list}</nav>
      </details>
    );
  }

  return (
    // data-lenis-prevent: a long list scrolls inside itself, which Lenis would otherwise swallow.
    <nav aria-label="On this page" className="legal-toc legal-toc--rail" data-lenis-prevent>
      <p className="legal-toc__label">On this page</p>
      {list}
    </nav>
  );
}
