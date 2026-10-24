const testimonials = [
  {
    quote:
      "Undoubtedly one of the best decisions I've made for my company. This platform is a game changer and I'm grateful for the impact it has had on our business.",
    name: "Maybin Mudenda",
    title: "Board Chairperson",
    company: "Insizwe Private Brokers",
  },
  {
    quote:
      "BalloAds made it incredibly easy to reach thousands of customers with a single campaign. Our response rate doubled within the first month.",
    name: "Sarah Nkosi",
    title: "Marketing Director",
    company: "Paramount Logistics",
  },
  {
    quote:
      "The targeted messaging feature is unlike anything we've used before. We saw a measurable uplift in foot traffic after our very first campaign.",
    name: "James Okafor",
    title: "CEO",
    company: "Mudenda Capital",
  },
  {
    quote:
      "From setup to launch took less than an afternoon. The dashboard is intuitive and the results speak for themselves.",
    name: "Tendai Moyo",
    title: "Head of Growth",
    company: "Tinge Technology",
  },
  {
    quote:
      "We've tried other platforms but nothing compares to the reach and affordability BalloAds offers for small businesses like ours.",
    name: "Linda Phiri",
    title: "Founder",
    company: "Shane Investments",
  },
];

export function TestimonialsSection() {
  return (
    <section className="ds-section" id="testimonials">
      <div className="ds-grid-12">
        {/* Sidebar — cols 1–3 */}
        <div className="ds-sidebar">
          <span className="ds-sidebar-label">What They Say</span>
        </div>

        {/* Content — cols 4–12 */}
        <div className="ds-content">
          <h2
            className="ds-section-head"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            Hear from those who have<br />tried and tested
          </h2>

          <div className="ds-testimonial-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="ds-testimonial-card">
                <p className="ds-testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                <hr className="ds-testimonial-divider" />
                <div>
                  <p className="ds-testimonial-name">{t.name}</p>
                  <p className="ds-testimonial-role">
                    {t.title}, {t.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
