"use client";

import * as React from "react";
import {
  ArrowLeft,
  BatteryFull,
  Check,
  Mail,
  MessageCircle,
  MessageSquare,
  Signal,
  Star,
  TrendingUp,
  Wifi,
} from "lucide-react";

import type { HomeTestimonialItem } from "@/app/HomeClient";
import { industries } from "../sections/WhoCinematicSection";
import { PhoneOnboardingScreen } from "./PhoneOnboardingScreen";

/**
 * The screens the journey phone shows below the hero (ADR 0017), one per
 * section it passes through. All are mounted and stacked; `JourneyPhone`
 * names the live one in `data-screen` on the stack, and CSS does the rest,
 * including each screen's own entrance (journey-phone.css). Sized in `cqw`
 * against the phone's screen, like `.phone-ui`.
 *
 * Mock UI throughout: the figures are illustrative, as on the hero's cards.
 */

export type JourneyScreenId =
  "film" | "who" | "lock" | "reviews" | "results" | "home";

/** One example message per industry, in the order of `industries`. */
const INDUSTRY_POSTS: Record<
  string,
  { text: string; delivered: string; opened: string }
> = {
  sme: {
    text: "Flash sale this Friday: 20% off everything in store. Show this message at the till.",
    delivered: "4,812",
    opened: "71%",
  },
  finance: {
    text: "Good news, Mwila: your loan of K15,000 is approved. Funds reach your account within 24 hours.",
    delivered: "12,406",
    opened: "84%",
  },
  nonprofit: {
    text: "Free vaccination drive at the community clinic this Saturday, 08:00 to 14:00. Bring your NRC.",
    delivered: "30,118",
    opened: "66%",
  },
  retail: {
    text: "Your order #4821 is on its way and arrives tomorrow. Reply HELP for anything else.",
    delivered: "8,377",
    opened: "79%",
  },
  health: {
    text: "Reminder: your appointment with Dr Banda is tomorrow at 10:30. Reply 1 to confirm.",
    delivered: "2,954",
    opened: "88%",
  },
  education: {
    text: "Term 3 opens on Monday. Fees can be paid at any branch or by mobile money.",
    delivered: "6,240",
    opened: "73%",
  },
};

export const INDUSTRY_COUNT = industries.length;

function initials(name: string) {
  return name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function StatusBar() {
  return (
    <div className="jp-status" aria-hidden="true">
      <span>9:41</span>
      <span className="jp-status__icons">
        <Signal />
        <Wifi />
        <BatteryFull />
      </span>
    </div>
  );
}

/** "Who can use BalloAds?": a campaign post per industry, carousel style. */
function WhoScreen({ indexRef }: { indexRef: React.Ref<HTMLDivElement> }) {
  return (
    <div className="jp-screen jp-screen--who">
      <StatusBar />
      <div className="jp-appbar">
        <ArrowLeft />
        <span>Campaigns</span>
      </div>
      <div ref={indexRef} className="jp-posts" data-index="0">
        {industries.map((item, i) => {
          const post = INDUSTRY_POSTS[item.id];
          return (
            <article
              key={item.id}
              className="jp-post"
              data-pos={i === 0 ? "active" : "next"}
            >
              <header className="jp-post__head">
                <span className="jp-avatar">{initials(item.name)}</span>
                <span className="jp-post__who">
                  <b>{item.name}</b>
                  <small>SMS campaign · just now</small>
                </span>
              </header>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="jp-post__img"
                src={item.src}
                alt=""
                loading="lazy"
              />
              <p className="jp-bubble">{post?.text}</p>
              <footer className="jp-post__stats">
                <span>
                  <Check /> {post?.delivered} delivered
                </span>
                <span>{post?.opened} opened</span>
              </footer>
            </article>
          );
        })}
      </div>
      <div className="jp-dots" aria-hidden="true">
        {industries.map((item, i) => (
          <span key={item.id} data-on={i === 0 ? "" : undefined} />
        ))}
      </div>
    </div>
  );
}

const NOTES = [
  {
    icon: MessageSquare,
    title: "Campaign delivered",
    body: "12,480 SMS reached customers on MTN and Airtel",
  },
  {
    icon: MessageCircle,
    title: "214 new replies",
    body: "Your WhatsApp offer is getting answers",
  },
  {
    icon: Mail,
    title: "41% opened your email",
    body: "Weekend newsletter, 3,902 recipients",
  },
  {
    icon: TrendingUp,
    title: "K48,200 in tracked sales",
    body: "From this week's campaigns",
  },
];

/** "Backed by" / "Trusted by": a lock screen of glass notifications. */
function LockScreen() {
  return (
    <div className="jp-screen jp-screen--lock">
      <StatusBar />
      <div className="jp-lock__date">Saturday 18 October</div>
      <div className="jp-lock__time">09:41</div>
      <ul className="jp-notes">
        {NOTES.map(({ icon: Icon, title, body }) => (
          <li key={title} className="jp-note">
            <span className="jp-note__icon">
              <Icon />
            </span>
            <span className="jp-note__text">
              <span className="jp-note__app">
                BalloAds <time>now</time>
              </span>
              <b>{title}</b>
              <small>{body}</small>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Testimonials: the quotes arriving as a chat. */
function ReviewsScreen({
  testimonials,
}: {
  testimonials: HomeTestimonialItem[];
}) {
  return (
    <div className="jp-screen jp-screen--reviews">
      <StatusBar />
      <div className="jp-chat__head">
        <span className="jp-avatar jp-avatar--brand">B</span>
        <span className="jp-post__who">
          <b>Customer reviews</b>
          <small className="jp-stars" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} />
            ))}
          </small>
        </span>
      </div>
      <div className="jp-chat">
        {testimonials.slice(0, 3).map((t) => (
          <div key={t.name + t.quote.slice(0, 12)} className="jp-msg">
            <span className="jp-avatar jp-avatar--sm">{initials(t.name)}</span>
            <span className="jp-msg__bubble">
              <small>{t.name}</small>
              {t.quote}
            </span>
          </div>
        ))}
        <div className="jp-msg jp-msg--out">
          <span className="jp-msg__bubble">Thank you for growing with us.</span>
        </div>
        <div className="jp-typing" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

const CHANNELS = [
  { name: "SMS", share: 62 },
  { name: "WhatsApp", share: 24 },
  { name: "Email", share: 14 },
];

/** The closing CTA: what one campaign earned. */
function ResultsScreen() {
  return (
    <div className="jp-screen jp-screen--results">
      <StatusBar />
      <div className="jp-results__title">
        <b>Campaign results</b>
        <small>Weekend promo · sent 09:00</small>
      </div>
      <div className="jp-card jp-results__reach">
        <span className="jp-results__tick">
          <Check />
        </span>
        <b>24,906</b>
        <small>customers reached</small>
      </div>
      <div className="jp-card jp-results__channels">
        {CHANNELS.map((c) => (
          <div
            key={c.name}
            className="jp-bar"
            style={
              { ["--share" as string]: `${c.share}%` } as React.CSSProperties
            }
          >
            <span>
              {c.name}
              <em>{c.share}%</em>
            </span>
            <i />
          </div>
        ))}
      </div>
      <div className="jp-card jp-results__earned">
        <span>
          <b>K48,200</b>
          <small>earned from this campaign</small>
        </span>
        <svg viewBox="0 0 60 24" aria-hidden="true">
          <polyline points="0,20 10,17 20,18 30,11 40,12 50,5 60,3" />
        </svg>
      </div>
      <span className="jp-results__cta">Send again</span>
    </div>
  );
}

export function JourneyScreens({
  stackRef,
  postsRef,
  videoRef,
  film,
  testimonials,
}: {
  stackRef: React.Ref<HTMLDivElement>;
  postsRef: React.Ref<HTMLDivElement>;
  videoRef: React.Ref<HTMLVideoElement>;
  film: { src: string; poster: string };
  testimonials: HomeTestimonialItem[];
}) {
  return (
    <div ref={stackRef} className="jp-screens" data-screen="film">
      {/* The same landscape film layer as the hero's phone, so the hand-off
          is the same picture (see `.hero-phone-film`). */}
      <div className="jp-screen jp-screen--film hero-phone-film">
        <video
          ref={videoRef}
          className="hero-phone-film__video"
          src={film.src}
          poster={film.poster}
          muted
          loop
          playsInline
          preload="none"
        />
      </div>
      <WhoScreen indexRef={postsRef} />
      <LockScreen />
      <ReviewsScreen testimonials={testimonials} />
      <ResultsScreen />
      {/* The footer: back to the app's first screen, where the hero began. */}
      <div className="jp-screen jp-screen--home">
        <PhoneOnboardingScreen />
      </div>
    </div>
  );
}
