"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { KnowledgeBaseHubGroup } from "@/lib/knowledgeBaseApi";

/**
 * KnowledgeBaseHub — the interactive Knowledge Base landing.
 *
 * Client's structure/copy (grouped index, grouped cards, @ personalisation
 * demo, client-side search, active-section highlight, helpful votes, Ballo
 * Academy band) rendered in the BalloAds design system. Styles: .kbh-* in
 * styles/pages/knowledge-base-hub.css.
 *
 * Content now comes from the CMS (`GET /v1/knowledge-base`, fetched server-side
 * in app/knowledge-base/page.tsx and passed down as the `groups` prop). If the
 * CMS has no published groups yet, this falls back to the original hardcoded
 * copy below (`FALLBACK_GROUPS`) so the page never regresses to blank content.
 *
 * ── Content boundary ─────────────────────────────────────────────────────────
 *  Sections with `subpage` are the client's recommended deeper articles
 *  (/knowledge-base/[topic]). Those routes are NOT built yet — the links are
 *  scaffolded and currently point at the on-page anchor. TODO: build the
 *  high-priority sub-pages (at-function, scheduling, lead-generator) first.
 *  The CMS has no field for `subpage`, so CMS-driven sections never render
 *  this link — only the hardcoded fallback content still has it.
 *  Screenshots are placeholders pending the client's annotated captures.
 * ─────────────────────────────────────────────────────────────────────────────
 */

type Field = { k: string; sub: string; v: React.ReactNode };
type Section = {
  id: string;
  num: string;
  title: string;
  claim: string;
  body?: string[];
  fields?: Field[];
  shot: string;
  subpage?: string;
};
type Group = { label: string; sections: Section[] };

const tag = (t: string) => <span className="tag">{t}</span>;

/**
 * Maps the CMS response shape onto this component's internal Group/Section
 * types. Notable mappings:
 * - section `slug` → `id` (used as the anchor id, IntersectionObserver
 *   target, and React key)
 * - `sectionNumber` → `num`
 * - `fields[].key/sub/value` → `Field.k/sub/v` (CMS `value` is always a plain
 *   string; the one hardcoded field that embeds a JSX cross-reference to
 *   `@interests` has no CMS equivalent, so CMS-driven fields render as plain
 *   text — an accepted, minor fidelity loss)
 * - `screenshotLabel` → `shot`, falling back to a placeholder when null
 * - there is no CMS field for `subpage`, so it is always left undefined for
 *   CMS-driven sections, which simply omits the "Read the full guide" link
 */
function mapBackendGroups(groups: KnowledgeBaseHubGroup[]): Group[] {
  return groups.map((g) => ({
    label: g.label,
    sections: g.sections.map((s) => ({
      id: s.slug,
      num: s.sectionNumber,
      title: s.title,
      claim: s.claim,
      body: s.body && s.body.length > 0 ? s.body : undefined,
      fields:
        s.fields && s.fields.length > 0
          ? s.fields.map((f) => ({ k: f.key, sub: f.sub, v: f.value }))
          : undefined,
      shot: s.screenshotLabel ?? "Screenshot coming soon",
    })),
  }));
}

const FALLBACK_GROUPS: Group[] = [
  {
    label: "Getting started",
    sections: [
      {
        id: "registration",
        num: "01",
        title: "Registration",
        claim: "Get set up in one sitting.",
        body: [
          "Sign up with your personal details manually, or use Google Auth to create your account in a single click. This first step creates your personal profile, the account you will use to manage everything else.",
          "Next, add your company information to activate your business account. To unlock SMS marketing, upload your signature and your Company Registration document, and you are ready to send.",
        ],
        shot: "Sign-up, step 1 of 2",
        subpage: "/knowledge-base/registration",
      },
      {
        id: "profiles",
        num: "02",
        title: "Business profiles",
        claim: "Run every business you own from one login.",
        body: [
          "Manage multiple businesses or business accounts from a single personal profile. Each one keeps its own branding, audience, campaigns and settings, so nothing bleeds between them.",
          "Switch between profiles instantly without logging out or creating a second account. Ideal if you run a group of companies, manage clients as an agency, or operate separate brands under one roof.",
        ],
        shot: "Profile switcher",
      },
    ],
  },
  {
    label: "Creating your message",
    sections: [
      {
        id: "at-function",
        num: "03",
        title: "The “@” function",
        claim: "Write one message. Send thousands of personal ones.",
        body: [
          "The “@” function pulls live details from each contact’s record into your message as it sends. Type the tag once and BalloAds fills in the rest for every person on your list.",
        ],
        fields: [
          {
            k: "@name",
            sub: "Contact field",
            v: "Addresses each contact by their own name instead of a generic greeting. Messages that use a person’s name feel like they were written for them, which lifts open and response rates and makes your brand sound human at scale.",
          },
          {
            k: "@interests",
            sub: "Subscription field",
            v: "Inserts the specific interests each contact ticked when they subscribed to you. People only hear about what they actually asked for, which keeps your message relevant and your unsubscribe rate low.",
          },
          {
            k: "@unsubscribeURL",
            sub: "Compliance",
            v: "Adds a working unsubscribe link to your message automatically. It keeps your campaigns compliant and signals to your audience that they are in control, which builds long-term trust in your list.",
          },
        ],
        shot: "Tag picker in the composer",
        subpage: "/knowledge-base/at-function",
      },
      {
        id: "brand",
        num: "04",
        title: "Brand",
        claim: "Teach BalloAds how your company sounds.",
        body: [
          "Upload your brand guideline documents, style guides, tone-of-voice notes or any reference material to build your brand profile. BalloAds reads them once and keeps them on file.",
          "From then on, every prompt you write is answered in your brand’s voice, colours and language, so there is no need to re-explain yourself each time. Write a one-line prompt and get campaign-ready copy in seconds, whether it is drafted by you or by a new team member who has never seen your style guide.",
        ],
        shot: "Brand profile, uploaded assets",
        subpage: "/knowledge-base/brand",
      },
      {
        id: "brutus-ai",
        num: "05",
        title: "Brutus AI",
        claim: "Your copilot for every campaign.",
        body: [
          "Brutus sits inside your workspace and helps you move from idea to sent campaign without a blank page. Ask it to draft a message, rewrite one that is too long, suggest subject lines, or explain what your last campaign’s numbers mean.",
          "Because Brutus is connected to your brand profile and your audience data, its suggestions arrive already on-brand and aimed at the right segment.",
        ],
        shot: "Brutus in the composer",
        subpage: "/knowledge-base/brutus-ai",
      },
    ],
  },
  {
    label: "Growing your audience",
    sections: [
      {
        id: "lead-generator",
        num: "06",
        title: "Lead generator",
        claim: "Turn anyone who sees your brand into a subscriber.",
        fields: [
          {
            k: "Your QR code",
            sub: "Auto-generated",
            v: "Every business profile gets its own QR code linking to your BalloAds public page. Scanning it shows guests your description, website, contact details, social links and any campaigns you have made public, with a subscribe button right there on the page.",
          },
          {
            k: "Dynamic forms",
            sub: "Editable anytime",
            v: (
              <>
                Edit your subscription form to include your current products and services. The
                interests subscribers tick here are the same ones {tag("@interests")} uses later, so a
                well-built form directly improves how targeted your future campaigns can be.
              </>
            ),
          },
          {
            k: "Where to put it",
            sub: "Print & digital",
            v: "Print the code on packaging, receipts, flyers, business cards, your shopfront window, vehicle branding or event banners. You also get a unique link for your Instagram, Facebook, WhatsApp or LinkedIn bio, so every channel you already use quietly grows your list.",
          },
        ],
        shot: "QR download & public page preview",
        subpage: "/knowledge-base/lead-generator",
      },
      {
        id: "public",
        num: "07",
        title: "Public campaign viewing",
        claim: "Let new visitors see what they are signing up for.",
        body: [
          "Choose which of your campaigns appear on your public guest mode page. Everything else stays private to your subscribers.",
          "It gives first-time visitors a preview of the kind of offers and updates you send, which makes them far more likely to subscribe than an empty form would.",
        ],
        shot: "Guest mode page",
      },
    ],
  },
  {
    label: "Sending & measuring",
    sections: [
      {
        id: "scheduling",
        num: "08",
        title: "Scheduling a campaign",
        claim: "Decide exactly when your message lands.",
        body: [
          "Set your campaign to send once, or run on repeat for as long as you need. Every setting below sits on one screen.",
        ],
        fields: [
          { k: "Campaign start", sub: "Required", v: "The date your campaign begins. Nothing sends before this date, so you can build a campaign well in advance and leave it ready." },
          { k: "Campaign schedule", sub: "Required", v: "How often the campaign should run: every minute, hourly, daily, weekly, monthly, or a custom pattern you define." },
          { k: "Send time", sub: "Required", v: "The time of day each run goes out. Choose the hour your audience is most likely to be reading." },
          { k: "Repeat every", sub: "Interval", v: "Sets the gap between runs: every 2 days, every 3 weeks, or every 6 hours. Use it to space out a series without scheduling each send by hand." },
          { k: "Active window per run", sub: "Delivery spread", v: "The period within which everyone on your list should have received the message, for example 1, 5 or 20 minutes. A wider window spreads delivery out gently; a narrow one gets everyone the message at almost the same moment." },
          { k: "End date", sub: "Optional", v: "The date the campaign stops running. Leave it blank to let the campaign continue until you stop it or it hits its maximum runs." },
          { k: "Maximum runs", sub: "Safety net", v: "Stops the campaign automatically after this many sends, a useful guard against a recurring campaign running longer than you intended." },
        ],
        shot: "Scheduling screen with numbered callouts",
        subpage: "/knowledge-base/scheduling",
      },
      {
        id: "members",
        num: "09",
        title: "Members management",
        claim: "Bring your team in without handing over your password.",
        body: [
          "Create and customise roles dynamically. Start from the pre-existing roles or build your own with exactly the permissions you want, so a designer, a copywriter and a finance lead each see only what they need.",
          "Invite new members by adding their email address, with no setup call required. Everyone works inside the same profile, so campaigns, brand assets and audience data stay in one place instead of scattered across personal accounts, and you keep a clear record of who changed what.",
        ],
        shot: "Roles & permissions",
        subpage: "/knowledge-base/members",
      },
      {
        id: "analytics",
        num: "10",
        title: "Analytics",
        claim: "Know what worked, and what to do next.",
        body: [
          "View consolidated analytics across all your campaigns in one dashboard: delivery and engagement performance, ad spend, trends over time and more. Compare campaigns side by side to see which messages, timings and segments earn their keep.",
          "Export any view as a .csv to use in your own reporting, board packs or accounting. Use it to move spend towards the campaigns that are already performing, rather than guessing at the next one.",
        ],
        shot: "Analytics dashboard",
        subpage: "/knowledge-base/analytics",
      },
    ],
  },
];

const PEOPLE = [
  { who: "+260 97 •• 41 · Chanda Mwale", name: "Chanda", int: "running shoes" },
  { who: "+260 96 •• 08 · Mutinta Zulu", name: "Mutinta", int: "gym wear" },
  { who: "+260 95 •• 73 · Joseph Banda", name: "Joseph", int: "football boots" },
];

function AtDemo() {
  const [idx, setIdx] = useState(0);
  const [swapping, setSwapping] = useState(false);
  const person = PEOPLE[idx];

  const go = (i: number) => {
    setSwapping(true);
    window.setTimeout(() => {
      setIdx(i);
      setSwapping(false);
    }, 280);
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      setSwapping(true);
      window.setTimeout(() => {
        setIdx((i) => (i + 1) % PEOPLE.length);
        setSwapping(false);
      }, 280);
    }, 3400);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="kbh-demo">
      <div className="kbh-demo__head kbh-mono">
        <span>What you write</span>
        <span>1 message</span>
      </div>
      <div className="kbh-demo__source kbh-mono">
        Hi <span className="tk">@name</span>, the <span className="tk">@interests</span> you follow
        are back in stock at our Cairo Road branch. <span className="tk">@unsubscribeURL</span>
      </div>
      <div className="kbh-demo__arrow kbh-mono">↓ &nbsp;SENT AS</div>
      <div className="kbh-demo__out">
        <div className="kbh-demo__to kbh-mono">
          <i aria-hidden="true" />
          <span>{person.who}</span>
        </div>
        <p className={`kbh-demo__msg${swapping ? " is-swapping" : ""}`}>
          Hi <span className="fill">{person.name}</span>, the{" "}
          <span className="fill">{person.int}</span> you follow are back in stock at our Cairo Road
          branch. <span className="kbh-demo__stop">Stop: ballo.ads/u/8fq2</span>
        </p>
        <div className="kbh-demo__dots">
          {PEOPLE.map((p, i) => (
            <button
              key={p.name}
              type="button"
              aria-current={i === idx}
              aria-label={`Show message for ${p.name}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
      </div>
      <p className="kbh-demo__foot kbh-mono">
        Every contact gets their own name and their own interests, written once.
      </p>
    </div>
  );
}

export default function KnowledgeBaseHub({ groups }: { groups: KnowledgeBaseHubGroup[] }) {
  // Fall back to the original hardcoded content whenever the CMS has no
  // published groups yet (e.g. no seed data), so the page never renders blank.
  const displayGroups = useMemo(
    () => (groups.length > 0 ? mapBackendGroups(groups) : FALLBACK_GROUPS),
    [groups]
  );
  const allSections = useMemo(() => displayGroups.flatMap((g) => g.sections), [displayGroups]);

  const [activeId, setActiveId] = useState(allSections[0].id);
  const [votes, setVotes] = useState<Record<string, "yes" | "no">>({});
  const [joined, setJoined] = useState(false);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  // Highlight the section currently in view (drives the sticky index).
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -65% 0px" }
    );
    allSections.forEach((s) => {
      const el = cardRefs.current[s.id];
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [allSections]);

  return (
    <main className="kbh-page">
      {/* Full-bleed cover: content scrolls up and disappears cleanly behind the
          top strip (matching the reference's full-width topbar behaviour) even
          though our nav is a floating pill. Page-coloured, so it's invisible —
          it just masks content on the upper part. */}
      <div className="kbh-cover" aria-hidden="true" />
      {/* ---- Hero ---- */}
      <section className="kbh-wrap kbh-hero" id="top">
        <div>
          <p className="kbh-eyebrow kbh-mono">Learn BalloAds</p>
          <h1 className="kbh-h1">
            One message.
            <br />
            Thousands of <em>personal</em> ones.
          </h1>
          <p className="kbh-lede">
            Short, practical guides to the features that make your campaigns work harder, from
            personalising every message to reading your results.
          </p>
          <span className="kbh-chip kbh-mono">
            <span className="kbh-pulse" aria-hidden="true" />
            Ballo Academy: free lessons, coming soon
          </span>
        </div>
        <AtDemo />
      </section>

      {/* ---- Shell: index + cards ---- */}
      <div className="kbh-wrap kbh-shell">
        <nav className="kbh-index" aria-label="Sections">
          <h2 className="kbh-index__title kbh-mono">On this page</h2>
          <ul className="kbh-index__list">
            {displayGroups.map((g) => (
              <Fragment key={g.label}>
                <li className="kbh-index__group kbh-mono">{g.label}</li>
                {g.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`kbh-index__link${activeId === s.id ? " is-active" : ""}`}
                    >
                      {s.num} · {s.title}
                    </a>
                  </li>
                ))}
              </Fragment>
            ))}
          </ul>
        </nav>

        <div className="kbh-main">
          {displayGroups.map((group) => (
            <div key={group.label}>
              <div className="kbh-bandhead">
                <span className="kbh-mono">{group.label}</span>
              </div>

              {group.sections.map((s) => (
                <article
                  key={s.id}
                  id={s.id}
                  className="kbh-card"
                  ref={(el) => {
                    cardRefs.current[s.id] = el;
                  }}
                >
                  <div className="kbh-card__num kbh-mono">{s.num}</div>
                  <h3 className="kbh-card__title">{s.title}</h3>
                  <p className="kbh-card__claim">{s.claim}</p>

                  {s.body?.map((p, i) => (
                    <p key={i} className="kbh-card__body">
                      {p}
                    </p>
                  ))}

                  {s.fields && (
                    <ul className="kbh-fields">
                      {s.fields.map((f) => (
                        <li key={f.k}>
                          <div className="kbh-fields__k kbh-mono">
                            {f.k}
                            <small>{f.sub}</small>
                          </div>
                          <p className="kbh-fields__v">{f.v}</p>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="kbh-shot">
                    <span className="kbh-mono">Screenshot: {s.shot}</span>
                  </div>

                  <div className="kbh-card__foot">
                    {s.subpage && (
                      // TODO: point at the real /knowledge-base/[topic] sub-page once built.
                      <Link href={`#${s.id}`} className="kbh-readmore">
                        Read the full guide
                        <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    )}
                    <div className="kbh-helpful">
                      <span className="kbh-helpful__label kbh-mono">Was this helpful?</span>
                      <button
                        type="button"
                        className={votes[s.id] === "yes" ? "is-picked" : ""}
                        aria-pressed={votes[s.id] === "yes"}
                        onClick={() => setVotes((v) => ({ ...v, [s.id]: "yes" }))}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={votes[s.id] === "no" ? "is-picked" : ""}
                        aria-pressed={votes[s.id] === "no"}
                        onClick={() => setVotes((v) => ({ ...v, [s.id]: "no" }))}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---- Academy band ---- */}
      <section className="kbh-academy">
        <div className="kbh-wrap kbh-academy__in">
          <div>
            <h2 className="kbh-academy__title">Ballo Academy is coming</h2>
            <p className="kbh-academy__text">
              Free lessons, guided walkthroughs and certification for BalloAds users. Leave your
              email and we&apos;ll tell you the day it opens.
            </p>
          </div>
          {/* TODO: wire to the waitlist / academy list endpoint when available. */}
          <form
            className="kbh-academy__form"
            onSubmit={(e) => {
              e.preventDefault();
              setJoined(true);
            }}
          >
            {joined ? (
              <p className="kbh-academy__ok" role="status">
                You&apos;re on the list. We&apos;ll be in touch when Ballo Academy opens.
              </p>
            ) : (
              <>
                <input type="email" required placeholder="you@company.co.zm" aria-label="Email address" />
                <button type="submit">Join the list</button>
              </>
            )}
          </form>
        </div>
      </section>

      {/* ---- Support ---- */}
      <p className="kbh-wrap kbh-support">
        Can&apos;t find what you need? <Link href="/live-chat">Talk to support</Link>
      </p>
    </main>
  );
}
