"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Facebook, Instagram, Linkedin } from "lucide-react";
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

const socialIconMap: Record<SocialKey, React.ReactNode> = {
  facebook: <Facebook className="header__social-svg" fill="currentColor" stroke="none" />,
  instagram: <Instagram className="header__social-svg" stroke="currentColor" strokeWidth={2} />,
  linkedin: <Linkedin className="header__social-svg" fill="currentColor" stroke="none" />,
  tiktok: <TikTokIcon className="header__social-svg" />,
};

const Header = () => {
  const pathname = usePathname();
  const { openWaitlist } = useWaitlist();
  const { scrollY } = useScroll();
  const [isHidden, setIsHidden] = React.useState(false);
  const [hasScrolled, setHasScrolled] = React.useState(false);
  const lastScrollY = useRef(0);

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

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="header header--sticky">
      <motion.div
        variants={{
          visible: { opacity: 1, y: 0, x: "-50%" },
          hidden: { opacity: 0, y: "-140%", x: "-50%" },
        }}
        animate={hasScrolled ? "hidden" : "visible"}
        initial="visible"
        transition={{
          duration: 0.24,
          ease: [0.4, 0, 0.2, 1],
        }}
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

      <motion.nav
        variants={{
          visible: { y: 0, x: "-50%" },
          hidden: { y: "-130%", x: "-50%" },
        }}
        animate={isHidden ? "hidden" : "visible"}
        initial="visible"
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className={`header__nav glass-surface-nav ${hasScrolled ? "header__nav--scrolled" : "header__nav--with-socials"}`}
        style={{ zIndex: 100 }}
        aria-label="Primary navigation"
      >
        <div className="glass-surface-nav__glow glass-surface-nav__glow--left" aria-hidden="true" />
        <div className="glass-surface-nav__glow glass-surface-nav__glow--right" aria-hidden="true" />

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

        <div className="header__actions" aria-label="Account actions">
          <button
            type="button"
            onClick={openWaitlist}
            className="header__action-link header__action-link--signup"
          >
            Sign Up
          </button>
        </div>
      </motion.nav>
    </header>
  );
};

export default Header;
