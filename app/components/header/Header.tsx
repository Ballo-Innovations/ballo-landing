"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { ChevronDown, Facebook, Instagram, Linkedin, Menu, X } from "lucide-react";
import logo_1 from "@/public/BalloAds Logo New/BalloAds-logo.png";
import logo_2 from "@/public/BalloAds Logo New/BalloAds-logo-full.png";
import { useWaitlist } from "../waitlist/WaitlistProvider";
import { socialLinks, type SocialKey } from "../social/socialLinks";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    stroke="none"
    aria-hidden="true"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

// Strategy 2 — "Chromium-optimized SVG compositor" (the production technique
// for a global sticky nav over live scrolling DOM). This <filter> is applied
// via CSS `filter: url(#glass-distortion)` on each pill's glass layer, which
// ALSO carries `backdrop-filter: blur()`; that split-layer combo is what makes
// Chromium actually displace the blurred backdrop (declaring the url() inside
// backdrop-filter parses but does not render in Chromium 148 — verified).
//
// Graph: turbulence -> soften -> feDisplacementMap against the backdrop
// (SourceGraphic here resolves to the element's backdrop-blurred sample), so
// it bends whatever is really behind the nav at render time. Uniform SVG
// displacement — no chromatic dispersion / lensing (that is WebGL/Strategy 1
// territory, reserved for hero image elements).
const GlassDistortionFilter = () => (
  <svg aria-hidden="true" focusable="false" style={{ position: "absolute", width: 0, height: 0 }}>
    <filter
      id="glass-distortion"
      x="-20%"
      y="-20%"
      width="140%"
      height="140%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.012 0.004"
        numOctaves="2"
        seed="17"
        result="noise"
      />
      <feGaussianBlur in="noise" stdDeviation="1.5" result="softNoise" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softNoise"
        scale="34"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
    <filter id="header-pill-glass-filter" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.012 0.004"
        numOctaves="2"
        result="noise"
      />
      <feGaussianBlur in="noise" stdDeviation="1.8" result="softNoise" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softNoise"
        scale="22"
        xChannelSelector="R"
        yChannelSelector="G"
        result="displaced"
      />
    </filter>
  </svg>
);

type HeaderGlassPillProps = {
  as?: React.ElementType;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement> &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

const HeaderGlassPill = ({
  as: Component = "div",
  className = "",
  contentClassName = "",
  children,
  ...props
}: HeaderGlassPillProps) => (
  <Component className={`header__pill header-glass-pill ${className}`} {...props}>
    <span className="header-glass-pill__refract" aria-hidden="true" />
    <span className="header-glass-pill__rim" aria-hidden="true" />
    <span className={`header-glass-pill__content ${contentClassName}`}>
      {children}
    </span>
  </Component>
);

const socialIconMap: Record<SocialKey, React.ReactNode> = {
  facebook: <Facebook className="header__social-svg" fill="currentColor" stroke="none" />,
  instagram: <Instagram className="header__social-svg" stroke="currentColor" strokeWidth={2} />,
  linkedin: <Linkedin className="header__social-svg" fill="currentColor" stroke="none" />,
  tiktok: <TikTokIcon className="header__social-svg" />,
};

// --- Navigation model -------------------------------------------------------
// Top-level entries are either a direct link or a group with a hover/tap
// dropdown. Edit here to add or regroup pages; the UI derives everything else.
type NavLink = { name: string; href: string };
type NavGroup = { name: string; children: NavLink[] };
type NavEntry = NavLink | NavGroup;

const isGroup = (entry: NavEntry): entry is NavGroup => "children" in entry;

const NAV: NavEntry[] = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Pricing", href: "/pricing" },
  {
    name: "Channels",
    children: [
      { name: "SMS Marketing", href: "/sms-marketing" },
      { name: "Email Marketing", href: "/email-marketing" },
      { name: "WhatsApp Marketing", href: "/whatsapp-marketing" },
    ],
  },
  {
    name: "Solutions",
    children: [
      { name: "For Business", href: "/business" },
      { name: "For Professionals", href: "/professional" },
    ],
  },
  {
    name: "Resources",
    children: [
      { name: "Knowledge Base", href: "/knowledge-base" },
      { name: "Guides", href: "/guides" },
      { name: "Blog", href: "/blog" },
      { name: "API Docs", href: "/api" },
      { name: "FAQ", href: "/faq" },
      { name: "What's New", href: "/whats-new" },
      { name: "Brutus AI", href: "/brutus" },
    ],
  },
];

const Header = () => {
  const pathname = usePathname();
  const { openWaitlist } = useWaitlist();
  const { scrollY } = useScroll();
  const [isHidden, setIsHidden] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const [navHighlight, setNavHighlight] = useState({ x: 0, width: 0, opacity: 0 });
  // Optimistic target of an in-flight navigation: lets the active pill move the
  // instant a link is clicked (predictive UI) instead of waiting for the next
  // page to load, and drives the top loading bar.
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const lastScrollY = useRef(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const navItemRefs = useRef<Record<string, HTMLElement | null>>({});

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    setHasScrolled(latest > 12);

    if (latest > previous && latest > 80) {
      setIsHidden(true);
    } else if (latest < previous) {
      setIsHidden(false);
    }

    lastScrollY.current = latest;
  });

  // Any client navigation should dismiss whatever menu is open, and clears the
  // pending state once the new route has actually rendered.
  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
    setExpandedMobile(null);
    setPendingPath(null);
  }, [pathname]);

  // Safety net: if a navigation stalls, drop the pending state so the loading
  // bar and predictive highlight don't get stuck.
  useEffect(() => {
    if (pendingPath === null) return;
    const t = setTimeout(() => setPendingPath(null), 4000);
    return () => clearTimeout(t);
  }, [pendingPath]);

  // Knowledge Base: keep the nav pinned (never hide on scroll-down) so the
  // page's content scrolls up INTO the nav rather than into a bare strip.
  const pinNav = pathname === "/knowledge-base";

  // Prefer the optimistic target while a navigation is in flight so the active
  // pill jumps immediately on click.
  const activePath = pendingPath ?? pathname;
  const isActive = (href: string) =>
    href === "/" ? activePath === "/" : activePath.startsWith(href);
  const isEntryActive = (entry: NavEntry) =>
    isGroup(entry) ? entry.children.some((c) => isActive(c.href)) : isActive(entry.href);
  const activeEntryName = NAV.find((entry) => isEntryActive(entry))?.name ?? null;

  useLayoutEffect(() => {
    const navItems = navItemsRef.current;
    const target = activeEntryName ? navItemRefs.current[activeEntryName] : null;

    if (!navItems || !target) {
      setNavHighlight((current) => ({ ...current, opacity: 0 }));
      return;
    }

    const updateHighlight = () => {
      const navRect = navItems.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      setNavHighlight({
        x: targetRect.left - navRect.left,
        width: targetRect.width,
        opacity: 1,
      });
    };

    updateHighlight();
    window.addEventListener("resize", updateHighlight);
    return () => window.removeEventListener("resize", updateHighlight);
  }, [activeEntryName, pathname, pendingPath]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  // Start the predictive move + loading bar the moment a nav link is clicked.
  const handleNavClick = (href: string) => {
    if (href !== pathname) setPendingPath(href);
  };

  const openMenu = (name: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenGroup(name);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    // Small delay bridges the gap between the trigger and the panel so the
    // dropdown doesn't flicker shut as the pointer crosses it.
    closeTimer.current = setTimeout(() => setOpenGroup(null), 160);
  };

  return (
    <header className="header header--sticky">
      <GlassDistortionFilter />
      {/* Predictive loading bar — animates while a nav navigation is in flight. */}
      <div
        className="nav-progress"
        data-active={pendingPath !== null}
        aria-hidden="true"
      />

      <motion.div
        variants={{
          visible: { opacity: 1, y: 0, x: "-50%" },
          hidden: { opacity: 0, y: "-140%", x: "-50%" },
        }}
        animate={hasScrolled ? "hidden" : "visible"}
        initial="visible"
        transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
        className="header__top-socials"
        aria-label="BalloAds social media"
      >
        {socialLinks.map(({ key, label, url }) =>
          url ? (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="header__social-link"
              aria-label={label}
            >
              {socialIconMap[key]}
            </a>
          ) : (
            <span
              key={key}
              className="header__social-link"
              role="img"
              aria-label={`${label} - link coming soon`}
              aria-disabled="true"
            >
              {socialIconMap[key]}
            </span>
          )
        )}
      </motion.div>

      <motion.div
        variants={{
          visible: { y: 0, x: "-50%" },
          hidden: { y: "-135%", x: "-50%" },
        }}
        animate={isHidden && !pinNav ? "hidden" : "visible"}
        initial="visible"
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`header__bar ${hasScrolled ? "header__bar--scrolled" : ""}`}
        style={{ zIndex: 100 }}
      >
        {/* Pill 1 — Logo */}
        <HeaderGlassPill className="header__pill--logo">
          <Link href="/" className="header__logo" aria-label="BalloAds home">
            <div className="header__logo-container">
              <div className="header__logo-icon">
                <Image
                  src={logo_1}
                  alt=""
                  width={300}
                  height={80}
                  className="header__logo-image header__logo-mark"
                  priority
                />
                <Image
                  src={logo_2}
                  alt="BalloAds"
                  width={300}
                  height={80}
                  className="header__logo-image header__logo-wordmark"
                  priority
                />
              </div>
            </div>
          </Link>
        </HeaderGlassPill>

        {/* Pill 2 — Navigation */}
        <nav
          className="header__pill header__pill--nav glass-surface-nav"
          aria-label="Primary navigation"
        >
          <div
            ref={navItemsRef}
            className="header__nav-items"
          >
            <motion.span
              className="header__nav-highlight"
              animate={navHighlight}
              initial={false}
              transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.65 }}
              aria-hidden="true"
            />
            {NAV.map((entry) => {
              const active = isEntryActive(entry);

              if (!isGroup(entry)) {
                return (
                  <Link
                    key={entry.name}
                    ref={(node) => {
                      navItemRefs.current[entry.name] = node;
                    }}
                    href={entry.href}
                    onClick={() => handleNavClick(entry.href)}
                    className={`header__nav-item ${active ? "header__nav-item--active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="header__nav-label">{entry.name}</span>
                  </Link>
                );
              }

              const open = openGroup === entry.name;
              return (
                <div
                  key={entry.name}
                  className="header__nav-group"
                  onMouseEnter={() => openMenu(entry.name)}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    ref={(node) => {
                      navItemRefs.current[entry.name] = node;
                    }}
                    type="button"
                    className={`header__nav-item ${active ? "header__nav-item--active" : ""}`}
                    aria-haspopup="true"
                    aria-expanded={open}
                    onClick={() => setOpenGroup(open ? null : entry.name)}
                  >
                    <span className="header__nav-label">{entry.name}</span>
                    <ChevronDown
                      className={`header__nav-chevron ${open ? "is-open" : ""}`}
                      aria-hidden="true"
                    />
                  </button>

                  <AnimatePresence>
                    {open && (
                      <motion.div
                        className="header__dropdown glass-surface-nav"
                        initial={{ opacity: 0, y: 8, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 8, x: "-50%" }}
                        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                        onMouseEnter={() => openMenu(entry.name)}
                        onMouseLeave={scheduleClose}
                      >
                        {entry.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => handleNavClick(child.href)}
                            className={`header__dropdown-link ${
                              isActive(child.href) ? "header__dropdown-link--active" : ""
                            }`}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="header__nav-toggle"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </nav>

        {/* Pills 3 & 4 — Auth (Sign In and Sign Up as separate pills) */}
        <div className="header__auth">
          <HeaderGlassPill
            as="button"
            type="button"
            onClick={openWaitlist}
            className="header__auth-pill header__auth-pill--signin"
            contentClassName="header__auth-pill-label"
          >
            Sign In
          </HeaderGlassPill>
          <HeaderGlassPill
            as="button"
            type="button"
            onClick={openWaitlist}
            className="header__auth-pill header__auth-pill--signup"
            contentClassName="header__auth-pill-label"
          >
            Sign Up
          </HeaderGlassPill>
        </div>
      </motion.div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={`header__mobile-sheet glass-surface-nav ${
              hasScrolled ? "header__mobile-sheet--scrolled" : ""
            }`}
            initial={{ opacity: 0, y: -12, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -12, x: "-50%" }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            {NAV.map((entry) => {
              if (!isGroup(entry)) {
                return (
                  <Link
                    key={entry.name}
                    href={entry.href}
                    onClick={() => handleNavClick(entry.href)}
                    className={`header__mobile-link ${
                      isEntryActive(entry) ? "is-active" : ""
                    }`}
                  >
                    {entry.name}
                  </Link>
                );
              }

              const expanded = expandedMobile === entry.name;
              return (
                <div key={entry.name} className="header__mobile-group">
                  <button
                    type="button"
                    className="header__mobile-link"
                    aria-expanded={expanded}
                    onClick={() =>
                      setExpandedMobile(expanded ? null : entry.name)
                    }
                  >
                    {entry.name}
                    <ChevronDown
                      className={`header__nav-chevron ${expanded ? "is-open" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        className="header__mobile-sub"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      >
                        {entry.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => handleNavClick(child.href)}
                            className={`header__mobile-sublink ${
                              isActive(child.href) ? "is-active" : ""
                            }`}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            <div className="header__mobile-auth">
              <button
                type="button"
                onClick={openWaitlist}
                className="header__mobile-signin"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={openWaitlist}
                className="header__mobile-signup"
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
