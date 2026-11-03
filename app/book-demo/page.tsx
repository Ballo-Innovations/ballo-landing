import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, MessageSquare, Sparkles, Users } from "lucide-react";
import { isFeatureEnabled } from "@/lib/featureFlags";
import BookDemoClient from "./BookDemoClient";

export const metadata: Metadata = {
  title: { absolute: "Book a demo | BalloAds" },
  description:
    "Book a free 30-minute BalloAds demo. See how Zambian businesses reach customers by SMS, email and WhatsApp, with AI help writing every message.",
  alternates: { canonical: "/book-demo" },
  openGraph: {
    title: "Book a demo | BalloAds",
    description: "A free 30-minute walkthrough of BalloAds with someone from our team.",
    url: "/book-demo",
    type: "website",
  },
};

const COVERS = [
  { icon: MessageSquare, title: "Your first campaign", text: "Send a real SMS, email or WhatsApp message to a test list, start to finish." },
  { icon: Sparkles, title: "AI that writes with you", text: "Watch BalloAds draft messages in your brand's voice, then tweak them." },
  { icon: Users, title: "Your contacts, sorted", text: "Import a spreadsheet, build groups and see who opened, clicked and replied." },
];

export default function BookDemoPage() {
  if (!isFeatureEnabled("bookDemo")) notFound();

  return (
    <main className="bd-page">
      <div className="bd-page__glow" aria-hidden="true" />
      <div className="bd-layout">
        <section className="bd-intro" aria-labelledby="bd-page-title">
          <p className="bd-eyebrow">Free product demo</p>
          <h1 id="bd-page-title" className="bd-intro__title">
            See BalloAds working for <span className="bd-intro__accent">your business</span>
          </h1>
          <p className="bd-intro__lead">
            30 minutes, free, with someone from our team. Bring your questions and we&apos;ll show you
            exactly how BalloAds fits the way you already sell.
          </p>

          <ul className="bd-meta" aria-label="About the demo">
            <li><Clock size={16} aria-hidden="true" /> 30 minutes</li>
            <li><span className="bd-meta__dot" aria-hidden="true" /> Free, no card needed</li>
            <li><span className="bd-meta__dot" aria-hidden="true" /> Video call or phone</li>
          </ul>
        </section>

        <div className="bd-booking">
          <BookDemoClient />
        </div>

        <section className="bd-more" aria-label="More about the demo">
          <h2 className="bd-intro__h2">What we&apos;ll cover</h2>
          <ul className="bd-covers">
            {COVERS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="bd-cover">
                <span className="bd-cover__icon" aria-hidden="true"><Icon size={18} /></span>
                <span>
                  <strong className="bd-cover__title">{title}</strong>
                  <span className="bd-cover__text">{text}</span>
                </span>
              </li>
            ))}
          </ul>

          <h2 className="bd-intro__h2">Who it&apos;s for</h2>
          <p className="bd-intro__text">
            Shops, clinics, schools, churches, lenders and growing teams across Zambia who want to
            reach customers without sending every message by hand. Already using another tool? We&apos;ll
            show you how to bring your contacts across.
          </p>

          <p className="bd-trust">
            No pressure and no hard sell. If BalloAds isn&apos;t the right fit, we&apos;ll tell you. Your
            details are only used to arrange your demo.
          </p>
        </section>
      </div>
    </main>
  );
}
