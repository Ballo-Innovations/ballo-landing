/**
 * Shown while a document is marked "Show review notice" in the CMS, i.e. it is
 * published for review but not yet adopted.
 */
export function LegalDraftNotice() {
  return (
    <div
      role="note"
      className="max-w-3xl rounded-lg border border-[#ffe08a]/40 bg-[#ffe08a]/[0.07] px-5 py-4 text-[0.975rem] leading-relaxed text-white/85"
    >
      <p>
        <strong className="text-white">Draft for review.</strong> This document is being reviewed and is not yet in
        force. Until it is, the terms you accepted when you signed up still apply.{" "}
        <mark className="legal-tbc">Highlighted text</mark> marks details we are still confirming.
      </p>
    </div>
  );
}
