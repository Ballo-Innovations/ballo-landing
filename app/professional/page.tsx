import Link from "next/link";
import WaitlistButton from "@/app/components/waitlist/WaitlistButton";
import ConcentricRings from "@/app/components/ui/ConcentricRings";
import "@/app/styles/pages/professional.css";

import { getProfessionalServiceCards } from "@/lib/professionalServicesApi";
import { ProfessionalAccordion, type ProfessionalServiceItem } from "./ProfessionalAccordion";

import bankingImage from "@/public/BalloAds Assets 2/1.png";
import retailImage from "@/public/BalloAds Assets 2/4.png";
import insuranceImage from "@/public/BalloAds Assets 2/2.png";
import transportImage from "@/public/BalloAds Assets 2/6.png";
import healthcareImage from "@/public/BalloAds Assets 2/9.png";
import miningImage from "@/public/BalloAds Assets 2/10.png";
import restaurantImage from "@/public/BalloAds Assets 2/13.png";
import educationImage from "@/public/BalloAds Assets 2/15.png";
import entertainmentImage from "@/public/BalloAds Assets 2/17.png";

export const dynamic = "force-dynamic";

// Fallback content — shown until the CMS has professional-service rows
// published. Keep this array (never delete it): getProfessionalServiceCards()
// returns [] both on fetch failure and on a genuinely empty (unseeded) CMS
// table, so this is what keeps the page from regressing to an empty accordion.
const FALLBACK_PROFESSIONAL_SERVICES: ProfessionalServiceItem[] = [
  {
    title: "Banking & Financial Services",
    subtitle: "Reach customers instantly across every channel.",
    description:
      "As a financial institution, you need a communication engine that is fast, secure, and reliable — and that’s exactly what BalloAds gives you. We help you reach your customers instantly across SMS, WhatsApp, email, web push, and pop-up channels, ensuring that every product update, loan offer, repayment reminder, or digital banking prompt is delivered at the right moment. With our advanced segmentation, you can target clients based on behaviour, interest, or financial journey stage — meaning your high-value products land in front of the customers most likely to act. BalloDash Analytics then give you full visibility into performance, letting you measure conversions, refine your targeting, and improve ROI with each campaign. In a competitive financial market, BalloAds becomes your growth partner — boosting product uptake, improving customer retention, reducing communication costs, and strengthening the trust your clients have in your brand.",
    image: bankingImage,
  },
  {
    title: "Retail & Ecommerce",
    subtitle: "Turn browsers into loyal, repeat buyers.",
    description:
      "For your retail or eCommerce business, every customer interaction counts — and BalloAds helps you make each one meaningful and profitable. We give you the power to notify shoppers instantly about new arrivals, promotions, restocks, and personalised deals across multiple channels, even after they leave your website. With behaviour-based triggers, you can recover abandoned carts, suggest complementary products, and tailor offers to individual shopping habits — turning casual browsers into loyal buyers. Our multi-channel delivery keeps your brand visible everywhere your customers are active, while BalloDash analytics shows you exactly which campaigns are driving sales, who’s engaging, and what to optimise next. With BalloAds, you reduce marketing waste, increase repeat purchases, and build a customer base that stays engaged from the first click to the final checkout.",
    image: retailImage,
  },
  {
    title: "Insurance",
    subtitle: "Strengthen trust with timely, relevant updates.",
    description:
      "As an insurance provider, your greatest advantage is trust — and BalloAds helps you strengthen that trust through fast, clear, and consistent communication. We enable you to instantly reach policyholders with updates on renewals, claims, new products, premium reminders, and important advisories across SMS, WhatsApp, email, web push, and pop-ups. With intelligent segmentation, you can tailor messages to specific client groups — such as motorists, homeowners, SMEs, or health policyholders — ensuring every communication feels relevant and timely. BalloDash analytics then gives you a clear view of engagement and conversions, helping you understand which products resonate and which messages trigger action. By using BalloAds, you boost policy renewals, reduce missed payments, enhance customer experience, and drive higher uptake of your insurance offerings — while cutting communication costs and improving operational efficiency.",
    image: insuranceImage,
  },
  {
    title: "Transport & Logistics",
    subtitle: "Keep clients and staff updated in real time.",
    description:
      "For your transport or logistics business, time, coordination, and clarity determine your success — and BalloAds gives you the communication tools to run operations at their best. You can instantly update clients about delivery timelines, route changes, driver schedules, cargo status, and service availability across multiple channels. Whether you're handling fleet management, courier deliveries, supply chain operations, or passenger transport, our multi-channel system ensures that every update reaches customers and staff without delay. Behaviour-based and event-triggered alerts allow you to automate notifications and improve service reliability, while BalloDash analytics helps you track customer engagement and operational performance in real time. With BalloAds, you reduce delays caused by miscommunication, increase customer satisfaction, and operate with a level of transparency that strengthens long-term relationships.",
    image: transportImage,
  },
  {
    title: "Healthcare Services",
    subtitle: "Connect with patients quickly and securely.",
    description:
      "In healthcare, communication saves time and often improves outcomes — and BalloAds empowers your facility to connect with patients quickly, securely, and thoughtfully. You can send appointment reminders, test result notifications, doctor availability updates, wellness tips, medication alerts, and public health advisories across SMS, WhatsApp, email, and web push. Our segmentation tools allow you to target messages based on patient needs or conditions, making your outreach more personalised and supportive. BalloDash analytics provides real-time insights into engagement, helping you understand patient behaviour and refine your outreach strategies. With BalloAds, you enhance patient satisfaction, reduce missed appointments, streamline operational workflows, and maintain a trusted, consistent presence in your patients’ lives — all while minimising administrative costs and communication delays.",
    image: healthcareImage,
  },
  {
    title: "Mining & Manufacturing",
    subtitle: "Coordinate teams with instant, reliable alerts.",
    description:
      "In your mining or manufacturing operation, information flow needs to be instant, precise, and reliable — BalloAds helps you achieve exactly that. You can communicate shift updates, safety alerts, production notices, equipment downtime, and compliance reminders across SMS, WhatsApp, email, and push notifications, ensuring every team member stays informed no matter how remote the site. Our automation tools reduce delays caused by manual communication and help you coordinate teams, contractors, and suppliers more efficiently. With BalloDash analytics, you gain visibility into message delivery, staff engagement, and operational response times. BalloAds ultimately strengthens internal coordination, improves safety culture, reduces downtime, and keeps your entire operation running smoothly with smart, timely communication.",
    image: miningImage,
  },
  {
    title: "Restaurants & Hospitality",
    subtitle: "Delight guests and fill every table.",
    description:
      "For your restaurant, lodge, or hospitality brand, customer experience is everything — and BalloAds helps you elevate it at every touchpoint. You can instantly update guests on reservations, promotions, special menus, holiday packages, and events through SMS, WhatsApp, email, and web push. Behaviour-based targeting lets you send personalised offers, loyalty rewards, and reminders to bring customers back at the right moments. With BalloDash analytics, you can see which promotions drive bookings, which messages encourage repeat visits, and how guests respond to your campaigns. BalloAds helps you increase reservations, strengthen brand loyalty, fill slow periods, and keep your customers delighted with consistent, engaging communication.",
    image: restaurantImage,
  },
  {
    title: "Education & Training Institutions",
    subtitle: "Keep students, parents, and staff informed.",
    description:
      "As a school, college, or training institution, your success depends on clear, consistent communication with students, parents, and staff — and BalloAds gives you the tools to do it effortlessly. You can send enrollment updates, class schedules, exam reminders, results notifications, fee alerts, and campus announcements across SMS, WhatsApp, email, and web push. With smart segmentation, you can reach specific groups — such as parents of new students, final-year classes, or trainees in different programmes — ensuring the right information reaches the right people instantly. BalloDash analytics provide detailed insights into engagement, helping you improve attendance, reduce missed deadlines, and enhance student/parent satisfaction. With BalloAds, your institution becomes more efficient, more connected, and better equipped to deliver a smooth academic experience.",
    image: educationImage,
  },
  {
    title: "Entertainment & Events Industry",
    subtitle: "Keep fans engaged and sell out shows.",
    description:
      "In the entertainment world — where timing, hype, and audience connection determine success — BalloAds gives you the power to keep fans engaged and informed in real time. Whether you’re promoting an artist, album, concert, festival, comedy show, theatre production, or nightlife event, you can send instant updates on ticket sales, new releases, venue changes, meet-and-greets, and exclusive drops across SMS, WhatsApp, email, and web push. With behaviour-based targeting, you can reach fans who previously attended your events, streamed your music, or engaged with your content — making every campaign more personal and more impactful. BalloDash analytics then shows you which messages drove ticket sales, boosted streams, or increased turnout. With BalloAds, you build stronger fan communities, sell out shows faster, increase discovery for your artists, and maintain a steady buzz around every project you release.",
    image: entertainmentImage,
  },
];

const supportHighlights = [
  {
    title: "24/7 Support",
    description: "Our team is available around the clock to ensure your campaigns run smoothly without downtime.",
  },
  {
    title: "Free Training",
    description: "Your team receives comprehensive onboarding and training at no extra cost to help you maximise every feature from day one.",
  },
  {
    title: "Quick Response Time",
    description: "We resolve issues and questions promptly so your business keeps moving without delays.",
  },
  {
    title: "System Integration",
    description: "BalloAds integrates effortlessly with your existing tools and workflows for a unified, efficient marketing ecosystem.",
  },
  {
    title: "Implementation & Support",
    description: "We handle the full setup and provide continuous assistance to guarantee a seamless transition into our platform.",
  },
  {
    title: "Dedicated Account Manager",
    description: "A specialised expert is assigned to your business to offer personalised guidance and strategic support whenever you need it.",
  },
];

export default async function ProfessionalServicesPage() {
  const cards = await getProfessionalServiceCards();
  const services: ProfessionalServiceItem[] =
    cards.length > 0
      ? cards.map((card) => ({
          title: card.title,
          subtitle: card.subtitle,
          description: card.body,
          image: card.imageUrl,
        }))
      : FALLBACK_PROFESSIONAL_SERVICES;

  return (
    <main className="professional-page">
      {/* Hero */}
      <section className="prof-hero">
        <div className="prof-hero__inner">
          <span className="prof-eyebrow">Professional Services</span>
          <h1 className="prof-hero__headline">How can BalloAds benefit you?</h1>
          <p className="prof-hero__intro">Rebranding the future starts here</p>
        </div>
      </section>

      {/* Industry accordions */}
      <ProfessionalAccordion services={services} />

      {/* Support */}
      <section className="prof-support">
        <div className="prof-support__rings" aria-hidden="true">
          <ConcentricRings />
        </div>

        <div className="prof-support__inner">
          <header className="prof-support__head">
            <h2 className="prof-support__title">Learn more about how we can support your growth</h2>
            <Link href="/how-it-works" className="prof-btn prof-btn--light prof-support__head-btn">
              Learn More
            </Link>
          </header>

          <ul className="prof-support__grid">
            {supportHighlights.map((highlight) => (
              <li key={highlight.title} className="prof-support__item">
                <span className="prof-support__check" aria-hidden="true">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l4 4L19 6" />
                  </svg>
                </span>
                <div>
                  <h3 className="prof-support__item-title">{highlight.title}</h3>
                  <p className="prof-support__item-desc">{highlight.description}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="prof-support__ctas">
            <WaitlistButton className="prof-btn prof-btn--light" ariaLabel="Sign up for BalloAds">
              Get Started
            </WaitlistButton>
            <Link href="/live-chat" className="prof-btn prof-btn--outline">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
