"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo_1 from "@/public/BalloAds Logo New/BalloAds-logo.png";
import logo_2 from "@/public/BalloAds Logo New/BalloAds-logo-full.png";

const Header = () => {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="header header--sticky">
      <nav
        className="header__nav glass-surface-nav"
        style={{ zIndex: 100, transform: "translateX(-50%)" }}
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
            onClick={() => window.dispatchEvent(new CustomEvent("open-waitlist"))}
            className="header__action-link header__action-link--signup"
          >
            Join Waitlist
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
