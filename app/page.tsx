import Image from "next/image";
import {
  BarChart3,
  Building,
  GraduationCap,
  Globe,
  Heart,
  Landmark,
  LayoutDashboard,
  MessageSquareText,
  ShoppingCart,
  Target,
  Wallet,
} from "lucide-react";
import { JoinWaitlistButton } from "./components/ui/JoinWaitlistButton";

import heroImage from "@/public/Assets/14.png";
import dashboard from "@/public/Assets/analytics-D8Ni1S4n.png";

import logoMakhulu from "@/public/Client Logos/Makhulu High Res Logo white.png";
import logoParamount from "@/public/Client Logos/paramount-1 white.png";
import logoInsizwe from "@/public/Client Logos/logo-2 white.png";
import logoMudenda from "@/public/Client Logos/Mudenda Capital Logo to send-03.png";
import logoFI from "@/public/Client Logos/Financial Insights Logo white.png";
import logoTinge from "@/public/Client Logos/Tinge logo white.png";
import logoIVLounge from "@/public/Client Logos/iv1.png";
import logoSWR from "@/public/Client Logos/SWR Logo white.png";
import logoShane from "@/public/Client Logos/Shane Investments logo.png";
import logoShreeji from "@/public/Client Logos/Shreeji.png";
import logoBayport from "@/public/Client Logos/bayport color.png";
import logoSeneca from "@/public/Client Logos/seneca-logo new-02.png";

const channels = ["SMS", "WhatsApp", "Email", "Web pop-ups", "Push notifications"];

const reasons = [
  { icon: Target, title: "AI-powered targeting", desc: "Get your message in front of the right audience at the right time." },
  { icon: MessageSquareText, title: "Bulk & personalised messaging", desc: "Scale up your outreach while keeping it personal." },
  { icon: BarChart3, title: "Real-time analytics", desc: "Track campaign performance and optimise results." },
  { icon: LayoutDashboard, title: "One simple dashboard", desc: "Manage all your campaigns in one place." },
  { icon: Wallet, title: "Affordable & scalable", desc: "Flexible pricing that grows with your business." },
];

const audiences = [
  { icon: Building, title: "SMEs & corporations", desc: "Promote products, services, and offers." },
  { icon: Landmark, title: "Financial institutions", desc: "Send loan approvals, transaction updates, and offers." },
  { icon: Globe, title: "Nonprofits & government", desc: "Spread awareness with mass communication." },
  { icon: ShoppingCart, title: "Retail & e-commerce", desc: "Drive sales and customer engagement." },
  { icon: Heart, title: "Healthcare & clinics", desc: "Send appointment reminders and health campaigns." },
  { icon: GraduationCap, title: "Education", desc: "Notify students, parents, and staff with updates." },
];

const logos = [
  { src: logoBayport, alt: "Bayport" },
  { src: logoSeneca, alt: "Seneca" },
  { src: logoMakhulu, alt: "Makhulu Investments" },
  { src: logoInsizwe, alt: "Insizwe" },
  { src: logoShreeji, alt: "Shreeji" },
  { src: logoParamount, alt: "Paramount Logistics" },
  { src: logoMudenda, alt: "Mudenda Capital" },
  { src: logoFI, alt: "Financial Insights" },
  { src: logoTinge, alt: "Tinge Technology" },
  { src: logoIVLounge, alt: "The IV Lounge" },
  { src: logoSWR, alt: "SWR" },
  { src: logoShane, alt: "Shane Investments" },
];;

const testimonials = [
  {
    quote: "Undoubtedly one of the best decisions I've made for my company. This platform is a game changer.",
    name: "Maybin Mudenda",
    role: "Board Chairperson, Insizwe Private Brokers",
  },
  {
    quote: "BalloAds made it incredibly easy to reach thousands of customers with a single campaign. Our response rate doubled within the first month.",
    name: "Sarah Nkosi",
    role: "Marketing Director, Paramount Logistics",
  },
  {
    quote: "From setup to launch took less than an afternoon. The dashboard is intuitive and the results speak for themselves.",
    name: "Tendai Moyo",
    role: "Head of Growth, Tinge Technology",
  },
];

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#3fdbff]">{eyebrow}</p>
      <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{title}</h2>
      {intro && <p className="mt-4 text-base leading-relaxed text-white/70 md:text-lg">{intro}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#04043a] text-white">
      {/* Hero */}
      <section className="px-5 pb-16 pt-32 md:pb-24 md:pt-40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#3fdbff]">Your digital marketing assistant</p>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Reach the right customers, on every channel.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/75">
              BalloAds brings targeted bulk messaging, WhatsApp marketing and email into one simple
              dashboard, so every campaign lands with the people who matter.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Channels">
              {channels.map((c) => (
                <li key={c} className="rounded-full border border-white/15 px-3 py-1 text-sm text-white/80">
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <JoinWaitlistButton label="Try it now" />
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm md:max-w-md">
            <div className="absolute inset-x-6 bottom-0 top-10 rounded-[2.5rem] bg-[#0b1a8c]" aria-hidden="true" />
            <Image
              src={heroImage}
              alt="A business owner smiling at a campaign result on his phone"
              priority
              sizes="(max-width: 768px) 90vw, 448px"
              className="relative h-auto w-full"
            />
          </div>
        </div>
      </section>

      {/* What we're about */}
      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#3fdbff]">What we&apos;re about</p>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Powerful and versatile, without the complexity.</h2>
            <p className="mt-5 text-lg leading-relaxed text-white/75">
              BalloAds is an AI-powered digital advertising platform that helps businesses and organisations
              connect with the right audience through bulk SMS, targeted message ads and data-driven campaign
              management. Whether you&apos;re a startup, an enterprise or a service provider, you get the tools to
              launch impactful campaigns with ease.
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white p-2 shadow-2xl shadow-black/40">
            <Image
              src={dashboard}
              alt="The BalloAds analytics dashboard"
              loading="lazy"
              sizes="(max-width: 768px) 90vw, 560px"
              className="h-auto w-full rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Why BalloAds */}
      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Why BalloAds" title="The digital marketing platform built for your growth." />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <Icon className="h-6 w-6 text-[#3fdbff]" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-1.5 text-white/70">{desc}</p>
              </li>
            ))}
            <li className="flex flex-col justify-between rounded-2xl bg-[#2273af] p-6">
              <p className="text-lg font-bold">Ready when you are.</p>
              <div className="mt-6">
                <JoinWaitlistButton />
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Trusted by */}
      <section className="px-5 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-8 text-center text-sm font-semibold uppercase tracking-[0.2em] text-white/50">Trusted by</p>
          <ul className="grid grid-cols-3 items-center gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
            {logos.map((logo) => (
              <li key={logo.alt} className="flex justify-center">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  loading="lazy"
                  sizes="120px"
                  className="h-10 w-auto max-w-[7.5rem] object-contain opacity-80 md:h-12"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who can use BalloAds */}
      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Who it's for" title="Who can use BalloAds?" />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {audiences.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-white/10 p-5">
                <Icon className="mt-0.5 h-6 w-6 shrink-0 text-[#3fdbff]" strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-white/70">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Testimonials" title="Heard from those who have tried and tested." />
          <ul className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <li key={t.name} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <blockquote className="flex-1 text-lg leading-relaxed text-white/90">&ldquo;{t.quote}&rdquo;</blockquote>
                <p className="mt-6 font-bold">{t.name}</p>
                <p className="text-sm text-white/60">{t.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="px-5 pb-24 pt-8">
        <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-br from-[#0b1a8c] to-[#2273af] px-6 py-14 text-center md:px-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Be first in line at launch.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Join the waitlist and get a free playbook written for your business.
          </p>
          <div className="mt-8 flex justify-center">
            <JoinWaitlistButton />
          </div>
        </div>
      </section>
    </main>
  );
}
