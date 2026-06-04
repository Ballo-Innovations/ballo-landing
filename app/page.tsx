import type { Metadata } from "next";

import { SilkBackground } from "./components/ui/SilkBackground";
import { HeroSection } from "./components/sections/HeroSection";
import { SystemSection } from "./components/sections/SystemSection";
import { TrustedBySection } from "./components/sections/TrustedBySection";
import { ComparisonSection } from "./components/sections/ComparisonSection";
import { TestimonialsSection } from "./components/sections/TestimonialsSection";
import { AccessSection } from "./components/sections/AccessSection";

export const metadata: Metadata = {
  title: "BalloAds — AI-Powered Digital Marketing Platform",
  description:
    "Reach the right audience through bulk SMS, WhatsApp marketing, email campaigns, and AI-driven targeting. BalloAds gives businesses the tools to launch impactful campaigns with ease.",
};

export default function Home() {
  return (
    <main className="relative overflow-x-hidden z-0">
      {/* ── Hero zone — dark, Grainient background ── */}
      <div style={{ background: "linear-gradient(180deg, #070757 0%, #000000 100%)" }}>
        <SilkBackground />
        <HeroSection />
      </div>

      {/* ── Design system zone — cream background ── */}
      <div className="ds-main">
        <SystemSection />
        <TrustedBySection />
        <ComparisonSection />
        <TestimonialsSection />
        <AccessSection />
      </div>
    </main>
  );
}
