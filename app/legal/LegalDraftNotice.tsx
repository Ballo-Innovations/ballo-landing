/**
 * Shown while a document is marked "Show review notice" in the CMS, i.e. it is
 * published for review but not yet adopted.
 */
export function LegalDraftNotice({ plural = false }: { plural?: boolean }) {
  return (
    <div role="note" className="legal-notice legal-notice--draft">
      <p>
        <strong>Draft for review.</strong>{" "}
        {plural
          ? "Some of these documents are being reviewed and are not yet in force. Until they are, the terms you accepted when you signed up still apply."
          : "This document is being reviewed and is not yet in force. Until it is, the terms you accepted when you signed up still apply."}{" "}
        <mark className="legal-tbc">Highlighted text</mark> marks details we are still confirming.
      </p>
    </div>
  );
}
