"use client";

// Pricing as one rate table (flag: pricingRateTable). Every per-message rate
// on the backoffice Pricing Ladder is shown, one column per volume band, with
// a "your messages" box that fills in what each channel would cost.
// Styles: app/styles/pages/pricing.css (`.prt-*`).

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import WaitlistButton from "@/app/components/waitlist/WaitlistButton";
import { type LadderBand, type LadderPlatform, resolveRate } from "@/lib/pricingLadderTypes";

export type RateTableTab = {
  key: string;
  label: string;
  /** Bands to show when this tab is selected. */
  bands?: LadderBand[];
  /** A tab that lives on another route (fixed term vs no expiry). */
  href?: string;
  /** Sentence about how long messages last, for the footnote. */
  validity?: string;
};

const CHANNELS: { platform: LadderPlatform; name: string; note: string }[] = [
  { platform: "Sms", name: "SMS", note: "Per text message" },
  { platform: "Email", name: "Email", note: "Per email" },
  { platform: "WhatsApp", name: "WhatsApp", note: "Per marketing message" },
];

const DEFAULT_MESSAGES = 1750;
const MAX_MESSAGES = 1_000_000;
// The ladder marks an open-ended top band with an end of 0, or a very large one.
const OPEN_ENDED = 1_000_000;

const count = (n: number) => n.toLocaleString("en-US");

function money(symbol: string, value: number) {
  const rounded = Math.round(value * 100) / 100;
  return `${symbol}${rounded.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function bandLabel(band: LadderBand, index: number, total: number) {
  const open = band.thresholdEnd <= 0 || band.thresholdEnd >= OPEN_ENDED;
  if (open) return band.thresholdStart <= 1 && total === 1 ? "Any volume" : `${count(band.thresholdStart)} and over`;
  if (index === 0 && band.thresholdStart <= 1) return `Up to ${count(band.thresholdEnd)}`;
  return `${count(band.thresholdStart)} to ${count(band.thresholdEnd)}`;
}

/** The band a volume is priced in: the one containing it, else the nearest below. */
function activeBand(bands: LadderBand[], messages: number) {
  const exact = bands.findIndex(
    (b) => messages >= b.thresholdStart && (b.thresholdEnd <= 0 || messages <= b.thresholdEnd),
  );
  if (exact >= 0) return exact;
  for (let i = bands.length - 1; i >= 0; i--) if (messages >= bands[i].thresholdStart) return i;
  return bands.length > 0 ? 0 : -1;
}

const CircleArrow = () => (
  <svg
    className="prt-btn__icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M10.5 8.5 14 12l-3.5 3.5" />
  </svg>
);

export default function PricingRateTable({
  tabs,
  initialKey,
  currency,
}: {
  tabs: RateTableTab[];
  initialKey: string;
  currency: string;
}) {
  const inputId = useId();
  const [activeKey, setActiveKey] = useState(initialKey);
  const [typed, setTyped] = useState(String(DEFAULT_MESSAGES));

  const symbol = currency === "ZMW" || currency === "" ? "K" : currency;
  const tab = tabs.find((t) => t.key === activeKey && !t.href) ?? tabs.find((t) => !t.href);
  const bands = useMemo(
    () => [...(tab?.bands ?? [])].sort((a, b) => a.thresholdStart - b.thresholdStart),
    [tab],
  );

  const parsed = Math.round(Number(typed));
  const messages = Number.isFinite(parsed) && parsed > 0 ? Math.min(MAX_MESSAGES, parsed) : 0;
  const active = messages > 0 ? activeBand(bands, messages) : -1;

  const rows = CHANNELS.map((channel) => {
    const rates = bands.map((band) => resolveRate([band], channel.platform, band.thresholdStart));
    const rate = messages > 0 ? resolveRate(bands, channel.platform, messages) : null;
    return {
      ...channel,
      rates,
      // No volume typed yet: nothing to total. No rate published: ask us.
      total:
        bands.length > 0 && messages === 0
          ? "-"
          : bands.length === 0 || rate === null
            ? "Contact us"
            : money(symbol, rate * messages),
    };
  });

  const yourLabel = messages > 0 ? `Your ${count(messages)}` : "Your total";
  const footnote =
    bands.length === 0
      ? "These messages are priced on request. Tell us your volume and we will send a quote."
      : `${bands.length > 1 ? "The brighter rate is the one your volume falls in. " : ""}${tab?.validity ?? ""}`.trim();

  return (
    <main className="prt">
      <div className="prt__inner">
        <header className="prt__head">
          <h1 className="prt__title">Dynamic, Transparent Pricing</h1>
          <p className="prt__lede">
            Every rate we charge, in one table. Type your own volume to see what you would pay.
          </p>
        </header>

        <div className="prt__controls">
          <div className="prt__tabs" role="group" aria-label="How long messages are valid for">
            <span className="prt__label">Valid for</span>
            {tabs.map((t) =>
              t.href ? (
                <Link key={t.key} href={t.href} className="prt__tab">
                  {t.label}
                </Link>
              ) : (
                <button
                  key={t.key}
                  type="button"
                  className={`prt__tab${t.key === tab?.key ? " is-active" : ""}`}
                  aria-pressed={t.key === tab?.key}
                  onClick={() => setActiveKey(t.key)}
                >
                  {t.label}
                </button>
              ),
            )}
          </div>
          <div className="prt__volume">
            <label htmlFor={inputId} className="prt__label">
              Your messages
            </label>
            <input
              id={inputId}
              className="prt__input"
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_MESSAGES}
              step={250}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
            />
          </div>
        </div>

        {/* Wide screens: the table. */}
        <div className="prt__table-wrap">
          <table className="prt__table">
            <thead>
              <tr>
                <th scope="col">Channel</th>
                {bands.map((band, i) => (
                  <th key={band.thresholdStart} scope="col" className="prt__num">
                    {bandLabel(band, i, bands.length)}
                  </th>
                ))}
                <th scope="col" className="prt__num">
                  {yourLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.platform}>
                  <th scope="row">
                    <span className="prt__channel">{row.name}</span>
                    <span className="prt__note">{row.note}</span>
                  </th>
                  {row.rates.map((rate, i) => (
                    <td
                      key={bands[i].thresholdStart}
                      className={`prt__num prt__rate${i === active ? " is-active" : ""}`}
                    >
                      {rate === null ? "On request" : `${symbol}${rate.toFixed(2)}`}
                    </td>
                  ))}
                  <td className="prt__num prt__total" aria-live="polite">
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Narrow screens: one block per channel. */}
        <ul className="prt__cards">
          {rows.map((row) => (
            <li key={row.platform} className="prt__card">
              <div className="prt__card-head">
                <div>
                  <span className="prt__channel">{row.name}</span>
                  <span className="prt__note">{row.note}</span>
                </div>
                <span className="prt__total">{row.total}</span>
              </div>
              {bands.length > 0 && (
                <dl className="prt__card-rates">
                  {bands.map((band, i) => (
                    <div key={band.thresholdStart} className={`prt__rate${i === active ? " is-active" : ""}`}>
                      <dt>{bandLabel(band, i, bands.length)}</dt>
                      <dd>{row.rates[i] === null ? "On request" : `${symbol}${row.rates[i]!.toFixed(2)}`}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </li>
          ))}
        </ul>

        <div className="prt__foot">
          <p className="prt__footnote">{footnote}</p>
          <div className="prt__ctas">
            <WaitlistButton className="prt-btn prt-btn--primary" ariaLabel="Get started with BalloAds">
              Get Started
              <CircleArrow />
            </WaitlistButton>
            <Link href="/live-chat" className="prt-btn prt-btn--light">
              Contact us
              <CircleArrow />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
