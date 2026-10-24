const features = [
  {
    index: "01",
    title: "AI-Powered Targeting",
    desc: "Get your message in front of the right audience at the right time.",
  },
  {
    index: "02",
    title: "Bulk & Personalised Messaging",
    desc: "Scale up your outreach while keeping it personal.",
  },
  {
    index: "03",
    title: "Real-Time Analytics",
    desc: "Track campaign performance and optimise results.",
  },
  {
    index: "04",
    title: "User-Friendly Dashboard",
    desc: "Manage all your campaigns in one place.",
  },
  {
    index: "05",
    title: "Affordable & Scalable",
    desc: "Flexible pricing that grows with your business.",
  },
];

export function SystemSection() {
  return (
    <section className="ds-section" id="system">
      <div className="ds-grid-12">
        {/* Sidebar — cols 1–3 */}
        <div className="ds-sidebar">
          <span className="ds-sidebar-label">System</span>
        </div>

        {/* Content — cols 4–12 */}
        <div className="ds-content">
          {/* Stacked 3-word poster headline */}
          <div aria-label="Powerful and Versatile">
            <span className="ds-poster" style={{ fontFamily: "var(--font-outfit, sans-serif)" }}>
              Powerful
            </span>
            <span className="ds-poster" style={{ fontFamily: "var(--font-outfit, sans-serif)" }}>
              and
            </span>
            <span className="ds-poster ds-poster--accent" style={{ fontFamily: "var(--font-outfit, sans-serif)" }}>
              Versatile
            </span>
          </div>

          {/* What We're About description */}
          <div className="mt-10 max-w-xl">
            <p className="ds-body">
              BalloAds is an AI-powered digital advertising platform designed to help businesses
              and organisations connect with the right audience through bulk SMS, targeted message
              ads, and data-driven campaign management. Whether you&apos;re a startup, an
              enterprise, or a service provider, BalloAds gives you the tools to launch impactful
              marketing campaigns with ease.
            </p>
          </div>

          {/* Feature grid */}
          <div className="ds-feature-grid mt-12">
            {features.map((f) => (
              <div key={f.index} className="ds-feature-card">
                <p className="ds-mono mb-4">{f.index}</p>
                <h3
                  className="font-bold text-lg mb-2 leading-tight"
                  style={{ color: "var(--ds-text)", letterSpacing: "-0.02em" }}
                >
                  {f.title}
                </h3>
                <p className="ds-body" style={{ fontSize: "0.9375rem" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
