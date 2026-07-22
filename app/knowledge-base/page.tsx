import Link from "next/link";
import type { Metadata } from "next";
import {
  Rocket,
  Send,
  Users,
  BarChart3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import WaitlistButton from "@/app/components/waitlist/WaitlistButton";
import PlaybookForm from "@/app/components/sections/PlaybookForm";

export const metadata: Metadata = {
  title: "Knowledge Base | Ballo Academy | BalloAds",
  description:
    "Ballo Academy — short, practical lessons on reaching your customers over SMS, WhatsApp and email, plus a free playbook built around your business.",
};

/** Ballo Academy tracks. TODO: point at real lesson routes once they're written. */
const tracks = [
  {
    title: "Getting started",
    description:
      "Create your account, verify your business, and send your first campaign in an afternoon.",
    Icon: Rocket,
    href: "/how-it-works",
    meta: "4 lessons",
  },
  {
    title: "Choosing your channels",
    description:
      "When SMS beats WhatsApp, when email wins, and how to combine them without repeating yourself.",
    Icon: Send,
    href: "/features",
    meta: "5 lessons",
  },
  {
    title: "Building your audience",
    description:
      "Import contacts cleanly, segment by behaviour, and keep your lists healthy over time.",
    Icon: Users,
    href: "/how-it-works/select-audience",
    meta: "3 lessons",
  },
  {
    title: "Reading your results",
    description:
      "Make sense of reach, spend, engagement and clicks in BalloDash — and what to change next.",
    Icon: BarChart3,
    href: "/how-it-works/monitor-optimise",
    meta: "4 lessons",
  },
  {
    title: "Deliverability & trust",
    description:
      "Sender reputation, opt-outs and consent — the habits that keep your messages landing.",
    Icon: ShieldCheck,
    href: "/privacy-policy",
    meta: "3 lessons",
  },
  {
    title: "Working with Brutus",
    description:
      "Let the AI assistant draft campaigns, answer customers and handle the repetitive work.",
    Icon: Sparkles,
    href: "/brutus",
    meta: "2 lessons",
  },
];

const stats = [
  { figure: "3.5m", label: "Active users reachable", note: "across SMS, WhatsApp and email" },
  { figure: "56%", label: "Average ROI uplift", note: "measured in BalloDash" },
  { figure: "1", token: "afternoon", label: "To your first campaign", note: "sign-up to send" },
];

const faqs = [
  {
    q: "What is Ballo Academy?",
    a: "A short, practical course library built around real campaigns — not feature documentation. Each track takes you from a blank dashboard to a campaign you can actually send.",
  },
  {
    q: "What is the free playbook?",
    a: "A personalised plan for your business. You tell us your industry, your biggest messaging headache and roughly how many people you need to reach, and we send back the fix, the channels to use, and a scheduling plan.",
  },
  {
    q: "Do I need to be a BalloAds customer?",
    a: "No. The Academy and the playbook are free and open before launch — they're how we help you arrive ready rather than starting from scratch on day one.",
  },
  {
    q: "Which channels does BalloAds cover?",
    a: "SMS and MMS, WhatsApp, email, web push and on-site pop-ups. SMS reaches customers even without an internet connection, which matters a lot in practice.",
  },
  {
    q: "How is my data handled?",
    a: "Your contact lists are encrypted and never shared outside your account. See our Privacy Policy for the full detail.",
  },
  {
    q: "When does BalloAds launch?",
    a: "We're in prelaunch now. Join the waitlist and you'll get first access, plus your playbook lands in your inbox before everyone else's.",
  },
];

export default function KnowledgeBasePage() {
  return (
    <main className="kb-page">
      {/* ---- Hero ---- */}
      <section className="kb-hero px-4 pt-28 pb-14 md:px-8 md:pb-16">
        <div className="container mx-auto flex max-w-4xl flex-col items-center gap-7 text-center">
          <span className="kb-eyebrow">Ballo Academy</span>
          <h1 className="kb-hero__title">
            <span className="kb-hero__lead">Learn to reach your customers</span>{" "}
            <span className="kb-hero__rest">before you spend a kwacha on it</span>
          </h1>
          <p className="kb-hero__desc">
            Short, practical lessons on SMS, WhatsApp and email marketing — plus a free playbook
            built around your business, your industry and the problem costing you the most.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="#playbook" className="kb-btn kb-btn--primary">
              Get your free playbook
            </Link>
            <Link href="/guides" className="kb-btn kb-btn--secondary">
              Browse the guides
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Playbook form ---- */}
      <section id="playbook" className="kb-playbook px-4 pb-16 md:px-8 md:pb-20">
        <div className="container mx-auto">
          <div className="kb-playbook__grid">
            <div className="kb-playbook__copy">
              <h2 className="kb-section__title">Build my free playbook</h2>
              <p className="kb-section__desc">
                Five short questions. In return you get a plan written for your business — not a
                template — covering what to fix first, which channels to use, and how to pace your
                sends.
              </p>
              <ul className="kb-playbook__list">
                <li>The one fix that solves your biggest headache</li>
                <li>The channel mix that suits your audience size</li>
                <li>A scheduling plan with campaign length</li>
                <li>What to set up first the day you sign up</li>
              </ul>
              <p className="kb-playbook__note">Free during prelaunch. No account needed.</p>
            </div>

            <PlaybookForm />
          </div>
        </div>
      </section>

      {/* ---- Academy tracks ---- */}
      <section className="kb-tracks px-4 pb-16 md:px-8 md:pb-20">
        <div className="container mx-auto">
          <div className="kb-section__head kb-section__head--center">
            <h2 className="kb-section__title">Start with the basics</h2>
            <p className="kb-section__desc">
              Six tracks that take you from a blank dashboard to campaigns that pay for themselves.
            </p>
          </div>

          <div className="kb-tracks__grid">
            {tracks.map((track) => {
              const Icon = track.Icon;
              return (
                <Link key={track.title} href={track.href} className="kb-track">
                  <span className="kb-track__icon">
                    <Icon strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <h3 className="kb-track__title">{track.title}</h3>
                  <p className="kb-track__text">{track.description}</p>
                  <span className="kb-track__meta">{track.meta}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- Stats ---- */}
      <section className="kb-stats px-4 pb-16 md:px-8 md:pb-20">
        <div className="container mx-auto">
          <div className="kb-stats__grid">
            {stats.map((stat) => (
              <div key={stat.label} className="kb-stat">
                <p className="kb-stat__figure">
                  {stat.figure}
                  {stat.token && <span className="kb-stat__token">{stat.token}</span>}
                </p>
                <p className="kb-stat__label">{stat.label}</p>
                <p className="kb-stat__note">{stat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FAQ (native details/summary — no client JS needed) ---- */}
      <section className="kb-faq px-4 pb-16 md:px-8 md:pb-20">
        <div className="container mx-auto max-w-3xl">
          <div className="kb-section__head kb-section__head--center">
            <h2 className="kb-section__title">Curious about BalloAds?</h2>
            <p className="kb-section__desc">The questions we get asked most before launch.</p>
          </div>

          <div className="kb-faq__list">
            {faqs.map((faq) => (
              <details key={faq.q} className="kb-faq__item">
                <summary className="kb-faq__q">
                  {faq.q}
                  <span className="kb-faq__marker" aria-hidden="true" />
                </summary>
                <p className="kb-faq__a">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="kb-cta px-4 pb-24 md:px-8">
        <div className="container mx-auto">
          <div className="kb-cta__card">
            <h2 className="kb-cta__title">Arrive ready on launch day</h2>
            <p className="kb-cta__text">
              Join the waitlist for first access, and we&apos;ll have your playbook waiting.
            </p>
            <div className="kb-cta__actions">
              <WaitlistButton className="kb-btn kb-btn--light">Join the Waitlist</WaitlistButton>
              <Link href="/live-chat" className="kb-btn kb-btn--ghost">
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
