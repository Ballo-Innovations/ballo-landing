import Link from "next/link";

export function AccessSection() {
  return (
    <section className="ds-section ds-access" id="access">
      <div className="ds-grid-12">
        {/* Sidebar — cols 1–3 */}
        <div className="ds-sidebar">
          <span className="ds-sidebar-label">Access</span>
        </div>

        {/* Content — cols 4–12 */}
        <div className="ds-content py-16">
          <h2
            className="ds-poster"
            style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "clamp(4rem, 10vw, 10rem)" }}
          >
            Start
          </h2>
          <h2
            className="ds-poster"
            style={{ fontFamily: "var(--font-outfit, sans-serif)", fontSize: "clamp(4rem, 10vw, 10rem)" }}
          >
            Exploring
          </h2>

          <div className="mt-10 flex flex-col gap-2 max-w-lg">
            <p className="ds-body">
              BalloAds gives you the tools to launch impactful marketing campaigns with ease.
            </p>
            <p className="ds-body">
              Whether you&apos;re a startup, an enterprise, or a service provider — reach the right
              audience today.
            </p>
          </div>

          <div className="mt-12 flex items-center gap-6 flex-wrap">
            <Link href="#signup" className="ds-btn ds-btn--black">
              Sign Up
            </Link>
            <Link href="#learn-more" className="ds-btn ds-btn--ghost">
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
