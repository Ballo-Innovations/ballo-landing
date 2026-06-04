const items = [
  {
    index: "001",
    title: "SMEs & Corporations",
    desc: "Promote products, services, and offers.",
  },
  {
    index: "002",
    title: "Financial Institutions",
    desc: "Send loan approvals, transaction updates, and offers.",
  },
  {
    index: "003",
    title: "Nonprofits & Government Initiatives",
    desc: "Spread awareness with mass communication.",
  },
  {
    index: "004",
    title: "Retail & E-commerce",
    desc: "Drive sales and customer engagement.",
  },
  {
    index: "005",
    title: "Healthcare & Clinics",
    desc: "Send appointment reminders and health campaigns.",
  },
  {
    index: "006",
    title: "Education Institutions",
    desc: "Notify students, parents, and staff with updates.",
  },
];

export function ComparisonSection() {
  return (
    <section className="ds-section" id="who-we-serve">
      <div className="ds-grid-12">
        {/* Sidebar — cols 1–3 */}
        <div className="ds-sidebar">
          <span className="ds-sidebar-label">Who We Serve</span>
        </div>

        {/* Content — cols 4–12 */}
        <div className="ds-content">
          <h2
            className="ds-section-head"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            Built for every sector
          </h2>

          <div className="mt-8">
            {items.map((item) => (
              <div key={item.index} className="ds-list-item">
                <span className="ds-list-item__index">{item.index}</span>
                <div className="ds-list-item__body">
                  <p
                    className="ds-list-item__title"
                    style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
                  >
                    {item.title}
                  </p>
                  <p className="ds-list-item__desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
