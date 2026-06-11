"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import logo_1 from "@/public/BalloAds Logo New/BalloAds-logo.png";
import logo_2 from "@/public/BalloAds Logo New/BalloAds-logo-full.png";

const Header = () => {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [isHidden, setIsHidden] = React.useState(false);
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;

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
        className="header__nav glass-surface-nav"
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
          <Link href="#signin" className="header__action-link header__action-link--signin">
            Sign In
          </Link>
          <Link href="#signup" className="header__action-link header__action-link--signup">
            Sign Up
          </Link>
        </div>
      </motion.nav>
    </header>
  );
};

export default Header;
