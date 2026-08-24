/**
 * App Store / Google Play badges for the phone mockup.
 *
 * Vector, not the `public/elements small/18.png` + `19.png` artwork these
 * reproduce: the badges sit on the Phone3D mockup at `translateZ(40px)`, so a
 * bitmap would resample and blur as the phone tilts. Keeping the wordmarks as
 * real text also leaves them selectable and readable by a screen reader.
 *
 * Colours are sampled from that artwork — a #d8e6ed pill with black type.
 */

function AppleIcon() {
  return (
    <svg className="store-btn__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.947 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.377-2.376-1.831-.143-3.376 1.04-4.363 1.04zm2.928-3.635c.87-1.026 1.442-2.463 1.286-3.895-1.26.052-2.804.845-3.702 1.884-.806.923-1.481 2.386-1.299 3.792 1.416.11 2.845-.715 3.715-1.781"
      />
    </svg>
  );
}

function GooglePlayIcon() {
  return (
    <svg className="store-btn__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {/* Left face (blue), then the green, yellow and red wedges. */}
      <path fill="#4285F4" d="M3.6 1.84a1.6 1.6 0 0 0-.42 1.1v18.12c0 .43.15.82.42 1.1l9.4-10.16z" />
      <path fill="#34A853" d="M3.6 1.84 16.4 9.1l-3.4 2.9z" />
      <path fill="#FBBC04" d="M16.4 9.1l3.72 2.11c.63.36.63 1.22 0 1.58L16.4 14.9 13 12z" />
      <path fill="#EA4335" d="M3.6 22.16 13 12l3.4 2.9z" />
    </svg>
  );
}

const STORES = {
  apple: { Icon: AppleIcon, lead: "Get it on the", name: "App Store" },
  play: { Icon: GooglePlayIcon, lead: "Get it on", name: "Google Play" },
} as const;

export function StoreBadge({ store }: { store: keyof typeof STORES }) {
  const { Icon, lead, name } = STORES[store];

  return (
    <button type="button" className="store-btn">
      <Icon />
      <span className="store-btn__text">
        <span className="s1">{lead}</span>
        <span className="s2">{name}</span>
      </span>
    </button>
  );
}
