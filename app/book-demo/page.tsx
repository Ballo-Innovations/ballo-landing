import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  {
    title: "Your first campaign",
    text: "We send a real SMS, email or WhatsApp message to a test list with you, start to finish.",
  },
  {
    title: "Copy that sounds like you",
    text: "BalloAds drafts messages in your brand’s voice, and you edit them before anything goes out.",
  },
  {
    title: "Your contacts, in one place",
    text: "Import a spreadsheet, build groups and see who opened, clicked and replied.",
  },
];

export default function BookDemoPage() {
  if (!isFeatureEnabled("bookDemo")) notFound();

  return (
    <main className="bd-page">
      <div className="bd-layout">
        <section className="bd-intro" aria-labelledby="bd-page-title">
          <p className="bd-kicker">Book a demo</p>
          <h1 id="bd-page-title" className="bd-intro__title">
            See BalloAds working for your business.
          </h1>
          <p className="bd-intro__lead">
            Thirty minutes with someone from our team, on a video call or the phone. It&apos;s free and
            there&apos;s no card to enter. Bring your questions and we&apos;ll show you how it fits the way
            you already sell.
          </p>
        </section>

        <div className="bd-booking">
          <BookDemoClient />
        </div>

        <section className="bd-more" aria-labelledby="bd-covers-title">
          <h2 id="bd-covers-title" className="bd-kicker">What we&apos;ll cover</h2>
          <ol className="bd-covers">
            {COVERS.map((c, i) => (
              <li key={c.title} className="bd-cover">
                <span className="bd-cover__num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <strong className="bd-cover__title">{c.title}</strong>
                  <span className="bd-cover__text">{c.text}</span>
                </span>
              </li>
            ))}
          </ol>

          <p className="bd-contact">
            Rather talk first? Call <a href="tel:+260979611334">+260 97 961 1334</a> or email{" "}
            <a href="mailto:hello@balloads.com">hello@balloads.com</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
