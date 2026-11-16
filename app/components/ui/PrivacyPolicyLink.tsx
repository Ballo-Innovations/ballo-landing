/**
 * Link to /legal/privacy for the small print under forms that collect contact
 * details. Opens in a new tab so a half-filled form is not lost.
 */
export function PrivacyPolicyLink({ className }: { className?: string }) {
  return (
    <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" className={className}>
      Privacy Policy<span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
