import { getTestimonials } from "@/lib/testimonialsApi";
import { getPartnerLogos } from "@/lib/partnerLogosApi";
import HomeClient, { type HomeTestimonialItem, type HomeLogoItem } from "./HomeClient";

import logoMakhulu from "@/public/Client Logos/Makhulu High Res Logo white.png";
import logoParamount from "@/public/Client Logos/paramount-1 white.png";
import logoOmphile from "@/public/Client Logos/Omphile-White.png";
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
import logo9 from "@/public/Client Logos/9.png";

// No `force-dynamic`. The page still renders per-request (both CMS helpers read
// headers() to pick the environment's API base), but force-dynamic additionally
// forced `no-store` onto every fetch in this route, which overrode the
// revalidate window on the testimonial and partner-logo lookups and put two
// blocking round-trips in front of every visitor's first byte.

// Fallback content — shown until the CMS has testimonial rows published.
// Keep this array (never delete it): getTestimonials() returns [] both on
// fetch failure and on a genuinely empty (unseeded) CMS table, so this is
// what keeps the carousel from regressing to empty.
const FALLBACK_TESTIMONIALS: HomeTestimonialItem[] = [
  {
    quote: "Undoubtedly one of the best decisions I've made for my company. This platform is a game changer and I'm grateful for the impact it has had on our business.",
    name: "Maybin Mudenda",
    title: "Board Chairperson",
    company: "Insizwe Private Brokers",
  },
  {
    quote: "BalloAds made it incredibly easy to reach thousands of customers with a single campaign. Our response rate doubled within the first month.",
    name: "Sarah Nkosi",
    title: "Marketing Director",
    company: "Paramount Logistics",
  },
  {
    quote: "The targeted messaging feature is unlike anything we've used before. We saw a measurable uplift in foot traffic after our very first campaign.",
    name: "James Okafor",
    title: "CEO",
    company: "Horizon Capital",
  },
  {
    quote: "From setup to launch took less than an afternoon. The dashboard is intuitive and the results speak for themselves.",
    name: "Tendai Moyo",
    title: "Head of Growth",
    company: "Tinge Technology",
  },
  {
    quote: "We've tried other platforms but nothing compares to the reach and affordability BalloAds offers for small businesses like ours.",
    name: "Linda Phiri",
    title: "Founder",
    company: "Shane Investments",
  },
];

// Fallback content — shown until the CMS has partner-logo rows published.
// Keep this array (never delete it): getPartnerLogos() returns [] both on
// fetch failure and on a genuinely empty (unseeded) CMS table, so this is
// what keeps the marquee from regressing to empty. HomeClient doubles
// whichever list (CMS or this one) it receives for the seamless loop.
const FALLBACK_PARTNER_LOGOS: HomeLogoItem[] = [
  { src: logoMakhulu, alt: "Makhulu Investments" },
  { src: logoParamount, alt: "Paramount Logistics" },
  { src: logoOmphile, alt: "Omphile Visual Direction" },
  { src: logoInsizwe, alt: "Insizwe" },
  { src: logoMudenda, alt: "Mudenda Capital" },
  { src: logoFI, alt: "Financial Insights" },
  { src: logoTinge, alt: "Tinge Technology" },
  { src: logoIVLounge, alt: "The IV Lounge" },
  { src: logoSWR, alt: "SWR" },
  { src: logoShane, alt: "Shane Investments" },
  { src: logoShreeji, alt: "Shreeji" },
  { src: logoBayport, alt: "Bayport" },
  { src: logoSeneca, alt: "Seneca" },
  { src: logo9, alt: "Client" },
];

// Fallback content — shown until the CMS has "Backed by" logo rows published
// (a partner-logo row with "Backed by" switched on). No local image files ship
// for these marks, so `src: null` tells HomeClient to render the name as a
// wordmark; uploading a logo in the CMS replaces it with the image.
const FALLBACK_BACKER_LOGOS: HomeLogoItem[] = [
  { src: null, alt: "Airtel" },
  { src: null, alt: "MTN" },
  { src: null, alt: "Meta" },
  { src: null, alt: "ZICTA" },
];

export default async function Home() {
  const [cmsTestimonials, cmsPartnerLogos] = await Promise.all([
    getTestimonials(),
    getPartnerLogos(),
  ]);

  const testimonials: HomeTestimonialItem[] =
    cmsTestimonials.length > 0
      ? cmsTestimonials.map((t) => ({
          quote: t.quote,
          name: t.authorName,
          title: t.authorTitle ?? "",
          company: t.authorCompany ?? "",
        }))
      : FALLBACK_TESTIMONIALS;

  // One CMS list feeds two strips: rows flagged "Backed by" go to the backers
  // section, everything else stays in the client marquee. Each side falls back
  // independently, so seeding one does not blank the other.
  const cmsBackers = cmsPartnerLogos.filter((p) => p.isBacker);
  const cmsPartners = cmsPartnerLogos.filter((p) => !p.isBacker);

  const partnerLogos: HomeLogoItem[] =
    cmsPartners.length > 0
      ? cmsPartners.map((p) => ({ src: p.logoUrl, alt: p.name }))
      : FALLBACK_PARTNER_LOGOS;

  const backerLogos: HomeLogoItem[] =
    cmsBackers.length > 0
      ? cmsBackers.map((p) => ({ src: p.logoUrl, alt: p.name }))
      : FALLBACK_BACKER_LOGOS;

  return (
    <HomeClient
      testimonials={testimonials}
      partnerLogos={partnerLogos}
      backerLogos={backerLogos}
    />
  );
}
