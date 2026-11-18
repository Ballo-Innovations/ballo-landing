"use client";

// For my business, laid out to the design. Shown when the `businessDesign`
// flag is on; app/business/page.tsx keeps the earlier layout for when it is off.
// Styles: app/styles/pages/business.css (`.bizd-*`).

import React from "react";
import Image from "next/image";
import Link from "next/link";
import person from "@/public/Assets/15.png";
import man from "@/public/BalloAds Assets 2/18.png";
import { GapTypewriter } from "./GapTypewriter";

export type BusinessBlanks = {
  businessType: string;
  location: string;
  businessName: string;
  offering: string;
  customerIssue: string;
  ourStruggle: string;
  reachCount: string;
};

type BlankSpec = {
  name: keyof BusinessBlanks;
  label: string;
  words: string[];
  size: string;
};

// Example words are kept short enough to fit the blank widths in the design.
const BLANKS: Record<keyof BusinessBlanks, BlankSpec> = {
  businessType: { name: "businessType", label: "Type of business", words: ["retail", "salon", "bakery", "fashion"], size: "bizd-blank--md" },
  location: { name: "location", label: "Where your business is", words: ["Lusaka", "Kitwe", "Ndola", "Kabwe"], size: "bizd-blank--sm" },
  businessName: { name: "businessName", label: "Business name", words: ["my brand", "my shop", "my store", "our team"], size: "bizd-blank--lg" },
  offering: { name: "offering", label: "What your business does", words: ["sell food", "book jobs", "run ads", "fix cars"], size: "bizd-blank--lg" },
  customerIssue: { name: "customerIssue", label: "What customers are doing", words: ["not buying", "going cold", "not paying", "drifting"], size: "bizd-blank--xl" },
  ourStruggle: { name: "ourStruggle", label: "What your team struggles with", words: ["lose track", "lose sales", "lose time", "run late"], size: "bizd-blank--lg" },
  reachCount: { name: "reachCount", label: "How many people you need to reach", words: ["50,000", "10,000", "5,000", "20,000"], size: "bizd-blank--md" },
};

const CircleArrow: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
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

export const BusinessDesign: React.FC<{
  values: BusinessBlanks;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ values, onChange }) => {
  const blank = (key: keyof BusinessBlanks, order: number) => {
    const spec = BLANKS[key];
    return (
      <GapTypewriter
        name={spec.name}
        label={spec.label}
        value={values[key]}
        onChange={onChange}
        words={spec.words}
        className={spec.size}
        lineClassName="bizd-blank"
        startDelay={200 + order * 300}
      />
    );
  };

  return (
    <div className="bizd">
      <section className="bizd-hero">
        <h1 className="bizd-hero__intro">
          Hi! Wondering which plan best suits you? We will meet you where you are.
        </h1>

        <p className="bizd-sentence">
          I have a {blank("businessType", 0)} business in {blank("location", 1)} called{" "}
          {blank("businessName", 2)} and what we do is {blank("offering", 3)}
          <span className="bizd-stop">.</span> Right now, customers{" "}
          {blank("customerIssue", 4)} is costing us money/sales, and we {blank("ourStruggle", 5)}
          <span className="bizd-stop">.</span> I
          need to reach {blank("reachCount", 6)} people without turning it into a full time job.
        </p>
      </section>

      <section className="bizd-bulk">
        <div className="bizd-bulk__card">
          <div className="bizd-bulk__copy">
            <h2 className="bizd-bulk__title glitch-text">Bulk SMS!</h2>
            <p className="bizd-bulk__text">
              With this service, you can send bulk SMS campaigns instantly to thousands of
              recipients with just a few clicks. The platform ensures fast delivery, detailed
              analytics, and personalised messaging, helping......
            </p>
            <Link href="/sms-marketing" className="bizd-bulk__link">
              <span>read more</span>
              <CircleArrow className="bizd-bulk__link-icon" />
            </Link>
          </div>
          <div className="bizd-bulk__media">
            <Image
              src={man}
              alt="A business owner paying by card on his phone"
              fill
              sizes="(min-width: 900px) 630px, 100vw"
              priority
            />
          </div>
        </div>
      </section>

      <section className="bizd-cta">
        <div className="bizd-cta__inner">
          <div className="bizd-cta__copy">
            <h2 className="bizd-cta__title glitch-text">
              <span>Rebranding the </span>
              <span>future of your </span>
              <span>industry starts here.</span>
            </h2>
            <Link href="https://crm.balloads.com/demo" className="bizd-cta__button">
              Book a free demo
              <CircleArrow className="bizd-cta__button-icon" />
            </Link>
          </div>
          <div className="bizd-cta__art" aria-hidden="true">
            <div className="bizd-cta__ring" />
            <Image
              src={person}
              alt=""
              sizes="(min-width: 900px) 450px, 300px"
              className="bizd-cta__person"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
