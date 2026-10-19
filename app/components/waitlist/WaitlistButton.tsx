"use client";

/**
 * WaitlistButton — a button that opens the shared waitlist modal.
 *
 * Lets server-component pages trigger the waitlist flow without becoming client
 * components themselves. WaitlistModal listens for the `open-waitlist` event,
 * the same one the header's Join Waitlist button fires.
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
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("open-waitlist"))}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
