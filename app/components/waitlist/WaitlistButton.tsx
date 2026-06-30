"use client";

import { useWaitlist } from "./WaitlistProvider";

/**
 * WaitlistButton — a button that opens the shared waitlist modal.
 *
 * Lets server-component pages trigger the waitlist flow (the real, working
 * pre-launch action) without becoming client components themselves. Pass the
 * same className you'd put on the equivalent <Link> so styling is unchanged.
 */
export default function WaitlistButton({
  className,
  children,
  ariaLabel,
}: {
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const { openWaitlist } = useWaitlist();
  return (
    <button type="button" onClick={openWaitlist} className={className} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
