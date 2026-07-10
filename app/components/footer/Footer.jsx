import "./footer.css";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import Image from "next/image";
import logo from "@/public/Assets/1.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          <div className="footer__logo-section">
            <Link href="/" className="footer__logo-link h-full flex justify-center align-center">
              <Image
                src={logo}
                alt="BalloAds Logo"
                className="footer__logo-img h-full w-auto object-contain"
              />
            </Link>
          </div>

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

          <div className="footer__column">
            <h3 className="footer__column-title">Contact us</h3>
            <div className="footer__contact-info">
              <div className="footer__contact-item">
                <div className="footer__contact-icon-wrapper">
                  <Phone size={14} className="footer__contact-icon-inner" />
                </div>
                <span>+260979611334</span>
              </div>
              <div className="footer__contact-item">
                <div className="footer__contact-icon-wrapper">
                  <Mail size={14} className="footer__contact-icon-inner" />
                </div>
                <span>hello@balloads.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
