import Image from "next/image";

import { FadeUpReveal } from "../ui/FadeUpReveal";

// Six tiles on an even 3-column grid — two rows of three. No spans: the
// swing-in entrance (see .who-bento in home.css) keys off each tile's column
// via nth-child, which only reads correctly when every tile is one column.
const useCases = [
  {
    id: "sme",
    num: "01",
    text: "SMEs & Corporations",
    subtext: "Promote products, services, and offers to your ideal customers.",
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1100&auto=format&fit=crop&q=70",
  },
  {
    id: "finance",
    num: "02",
    text: "Financial Institutions",
    subtext: "Send loan approvals, transaction updates, and targeted offers.",
    src: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=620&auto=format&fit=crop&q=70",
  },
  {
    id: "nonprofit",
    num: "03",
    text: "Nonprofits & Government",
    subtext: "Spread awareness and reach communities with mass communication.",
    src: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=620&auto=format&fit=crop&q=70",
  },
  {
    id: "retail",
    num: "04",
    text: "Retail & E-commerce",
    subtext: "Drive sales, customer loyalty, and engagement at scale.",
    src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=620&auto=format&fit=crop&q=70",
  },
  {
    id: "healthcare",
    num: "05",
    text: "Healthcare & Clinics",
    subtext: "Send appointment reminders and targeted health campaigns.",
    src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=620&auto=format&fit=crop&q=70",
  },
  {
    id: "education",
    num: "06",
    text: "Education Institutions",
    subtext: "Notify students, parents, and staff with timely updates.",
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1100&auto=format&fit=crop&q=70",
  },
];


/**
 * "Who can use BalloAds?" — a bento grid of all six industries.
 *
 * No pin, no carousel, no per-slide state: the whole set is on screen at once
 * and a visitor takes it in at a glance. The only motion is each tile's
 * entrance — a per-column swing-in, CSS transition on a stagger (see
 * FadeUpReveal) — plus an image-scale on hover. Nothing runs per frame and nothing holds the scroll.
 *
 * A plain server component — there is no client-side state left to hold, so
 * this ships no JS of its own beyond the reveal wrapper.
 */
export function WhoScrollSection() {
  return (
    <section className="who-outer">
      <div className="who-inner">
        <div className="who-stage-head">
          <span className="who-eyebrow-tag">Industries We Serve</span>
          <h2 className="who-redesign-h2">Who can use BalloAds?</h2>
        </div>

        <ul className="who-bento">
          {useCases.map((item, i) => (
            <li key={item.id} className="who-bento-cell">
              {/* Staggered swing-in: the outer columns arrive rotated from
                  their side and the middle one straight up, 90ms apart, so the
                  grid assembles in reading order rather than all at once.
                  `replay` keeps it tied to the scroll — scrolling back up
                  sends the tiles out the way they came in. */}
              <FadeUpReveal yOffset={28} duration={1} delay={i * 0.09} replay className="who-tile-reveal">
                <article className="who-tile">
                  <Image
                    src={item.src}
                    alt={item.text}
                    fill
                    sizes="(max-width: 700px) 92vw, (max-width: 1024px) 46vw, 380px"
                    className="who-tile-img"
                    priority={i < 3}
                  />
                  {/* The pane over the photo. This was Liquid Glass — a
                      backdrop-filter blur under an SVG edge-lens displacement
                      — until it measured as the thing dropping frames on this
                      section: six filtered backdrops, none of them
                      compositable, on six tiles the entrance is transforming
                      as you scroll. It is a flat tint plus an inset rim now;
                      see .who-tile-liquid in home.css. */}
                  <span className="who-tile-liquid" aria-hidden="true" />
                  <div className="who-tile-body">
                    <span className="who-tile-num" aria-hidden="true">{item.num}</span>
                    <h3 className="who-tile-title">{item.text}</h3>
                    <p className="who-tile-sub">{item.subtext}</p>
                  </div>
                </article>
              </FadeUpReveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
