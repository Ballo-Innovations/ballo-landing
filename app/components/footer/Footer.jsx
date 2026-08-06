import "./footer.css";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Phone, Mail } from "lucide-react";
import Image from "next/image";
import logo from "@/public/Assets/1.png";
import { socialLinks as defaultSocialLinks } from "@/app/components/social/socialLinks";

// Lucide has no TikTok glyph either, so ship the brand path inline (same path
// used by the header's TikTokIcon).
const TikTokIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" stroke="none" aria-hidden="true">
    <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.03 1.2V7.13s-1.9.1-3.29-1.31z" />
  </svg>
);

const SOCIAL_ICONS = {
  facebook: (props) => <Facebook {...props} fill="currentColor" stroke="none" />,
  instagram: (props) => <Instagram {...props} stroke="currentColor" strokeWidth={2} />,
  linkedin: (props) => <Linkedin {...props} fill="currentColor" stroke="none" />,
  tiktok: (props) => <TikTokIcon {...props} />,
};

const Footer = ({
  socialLinks = defaultSocialLinks,
  contactPhone = "+260979611334",
  contactEmail = "hello@balloads.com",
} = {}) => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Brand mark — sits large on the left, spanning the column block */}
          <div className="footer__logo-section">
            <Link href="/" className="footer__logo-link">
              <Image
                src={logo}
                alt="BalloAds Logo"
                className="footer__logo-img"
              />
            </Link>
          </div>

          {/* Information */}
          <div className="footer__column">
            <h3 className="footer__column-title">Information</h3>
            <ul className="footer__link-list">
              <li><Link href="/features">Features</Link></li>
              <li><Link href="/how-it-works">How it works</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/careers">Careers</Link></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div className="footer__column">
            <h3 className="footer__column-title">Help & Support</h3>
            <ul className="footer__link-list">
              <li><Link href="/knowledge-base">Knowledge Base</Link></li>
              <li><Link href="/live-chat">Live Chat</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/resources">Resources</Link></li>
              <li><Link href="/whats-new">What&apos;s New</Link></li>
            </ul>
          </div>

          {/* Our Socials */}
          <div className="footer__column">
            <h3 className="footer__column-title">Our Socials</h3>
            <div className="footer__socials-grid">
              {socialLinks.map(({ key, label, url }) => {
                const Icon = SOCIAL_ICONS[key];
                if (!Icon) return null;
                return url ? (
                  <Link
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="footer__social-icon"
                  >
                    <Icon size={22} />
                  </Link>
                ) : (
                  <span
                    key={key}
                    aria-label={`${label} - link coming soon`}
                    aria-disabled="true"
                    className="footer__social-icon"
                  >
                    <Icon size={22} />
                  </span>
                );
              })}
            </div>
          </div>

          {/* Contact us */}
          <div className="footer__column">
            <h3 className="footer__column-title">Contact us</h3>
            <div className="footer__contact-info">
              <div className="footer__contact-item">
                <div className="footer__contact-icon-wrapper">
                  <Phone size={14} className="footer__contact-icon-inner" />
                </div>
                <span>{contactPhone}</span>
              </div>
              <div className="footer__contact-item">
                <div className="footer__contact-icon-wrapper">
                  <Mail size={14} className="footer__contact-icon-inner" />
                </div>
                <span>{contactEmail}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
