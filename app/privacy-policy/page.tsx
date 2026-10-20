import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | BalloAds",
  description:
    "How BalloAds collects, uses, stores and protects personal data, where it is processed, and the rights you have under Zambia's Data Protection Act.",
};

const LAST_UPDATED = "20 October 2026";

const SUB_PROCESSORS = [
  ["Contabo GmbH", "Germany / France", "Hosting of the platform, databases and file storage (data centre in Lauterbourg, France)"],
  ["Resend", "United States", "Sending transactional and campaign email"],
  ["MTN Zambia and Airtel Zambia (via Tumani)", "Zambia", "Delivering SMS; they receive the recipient's number and the message"],
  ["Meta Platforms", "United States", "Delivering WhatsApp messages when a client connects a WhatsApp Business account"],
  ["Anthropic, Google and OpenAI", "United States", "AI features: writing help (business profile and prompts only) and AI-assisted contact import (the photo, recording or text you attach)"],
];

const RIGHTS = [
  ["Access", "ask what personal data we hold about you and receive a copy"],
  ["Rectification", "have inaccurate or incomplete data corrected"],
  ["Erasure", "have your data deleted when it is no longer needed or you withdraw consent"],
  ["Objection", "object to processing, including to direct marketing at any time"],
  ["Restriction", "ask us to pause processing while a question is resolved"],
  ["Portability", "receive the data you gave us in a commonly used format"],
  ["Withdraw consent", "where processing relies on consent, withdraw it at any time without affecting what was done before"],
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4 text-white/80 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[var(--dark-blue)] text-white py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-5xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-xl text-white/80 mb-2">How BalloAds handles personal data, and the rights you have over it.</p>
        <p className="text-sm text-white/60 mb-12">Last updated {LAST_UPDATED}. Governed by the Data Protection Act, No. 3 of 2021 (Zambia).</p>

        <div className="space-y-12">
          <Section id="who" title="1. Who we are">
            <p>
              BalloAds is a messaging and marketing platform operated by Ballo Innovations Limited in Lusaka, Zambia. Businesses
              use it to send SMS, WhatsApp and email campaigns to their own customers.
            </p>
            <p>
              Under the Data Protection Act we act in two roles. For the account details of the people who sign up and use the
              platform, we are the <strong className="text-white">data controller</strong>. For the contact lists our client businesses upload and
              message, we are the <strong className="text-white">data processor</strong>: the client decides what to collect and whom to message,
              and is responsible for having the consent of the people on its list. We process that data only on the client&apos;s instructions.
            </p>
          </Section>

          <Section id="what" title="2. What we collect">
            <p><strong className="text-white">If you have a BalloAds account:</strong> your name, email address, phone number, company details, sign-in and security records, billing and purchase history, and the campaigns, templates and settings you create.</p>
            <p><strong className="text-white">If you are on a client&apos;s contact list:</strong> what the client uploaded about you, typically your name, phone number and email address, and sometimes location, custom fields and tags. We also record whether messages to you were delivered, whether you clicked a link, and your opt-in and opt-out choices.</p>
            <p><strong className="text-white">If you visit this website:</strong> the pages you view and basic technical information such as browser type, and anything you type into the waitlist form or the site assistant chat. Phone numbers and email addresses typed into the chat are removed before the question is sent to the AI model that answers it.</p>
            <p>We do not knowingly collect data about children, and we do not ask for sensitive personal data such as health, religion, ethnicity or biometrics. Clients must not upload it.</p>
          </Section>

          <Section id="why" title="3. Why we use it">
            <ul className="list-disc pl-6 space-y-2">
              <li>To run the platform: creating accounts, sending the messages a client asks us to send, recording delivery and billing.</li>
              <li>To keep it safe: sign-in security, fraud and abuse prevention, and checking that recipients have not opted out before every send.</li>
              <li>To support you: answering questions and notifying you about your account, campaigns and balance.</li>
              <li>To improve the service, using aggregated reports that do not identify individuals.</li>
            </ul>
            <p>
              We rely on your consent (for marketing and for AI-assisted import), on the contract we have with you (to provide the
              service), and on our legitimate interest in keeping the platform secure. Clients rely on the consent of the people they
              message; our platform refuses to send to anyone who has opted out.
            </p>
          </Section>

          <Section id="where" title="4. Where your data is stored, and transfers outside Zambia">
            <p>
              The platform, its databases and uploaded files are hosted by Contabo GmbH in a data centre in Lauterbourg, France, where
              they are protected under the European Union&apos;s data protection law. Email is sent through a provider in the United
              States, and our AI features use providers in the United States. SMS delivery happens through Zambian mobile networks.
            </p>
            <p>
              Because this means personal data is stored and processed outside Zambia, we have declared it to the Data Protection
              Commission in our registration and have applied for authorisation under section 71 of the Act. We put written
              agreements in place with every provider that handles personal data, and we limit what each one receives to what its
              service needs (section 5 below).
            </p>
          </Section>

          <Section id="sharing" title="5. Who we share it with">
            <p>We never sell personal data. We share it only with the providers that run parts of the service:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/20 text-white">
                    <th className="py-2 pr-4 font-semibold">Provider</th>
                    <th className="py-2 pr-4 font-semibold">Location</th>
                    <th className="py-2 font-semibold">What it does</th>
                  </tr>
                </thead>
                <tbody>
                  {SUB_PROCESSORS.map(([name, where, what]) => (
                    <tr key={name} className="border-b border-white/10 align-top">
                      <td className="py-2 pr-4 text-white">{name}</td>
                      <td className="py-2 pr-4">{where}</td>
                      <td className="py-2">{what}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Contact lists are not sent to AI providers. The AI writing assistant receives the client&apos;s business profile and
              prompts; the spreadsheet column check receives only column headings and the shape of the values; cleanup suggestions are
              computed on our own servers. When a client chooses AI-assisted import from a photo, a voice note or pasted text, that
              file is sent to an AI provider to read the contact details, and the client is told so before attaching it.
            </p>
            <p>We may also disclose data when the law requires it, for example to the Data Protection Commission or a court.</p>
          </Section>

          <Section id="retention" title="6. How long we keep it">
            <p>
              Account data is kept while the account is open and for as long as we need it afterwards for billing records and legal
              obligations. A client&apos;s contact lists are kept until the client deletes them or closes its account; opt-out records
              are kept so that we keep honouring them. Delivery logs are kept for operational and billing purposes and then removed.
              Nightly backups are kept for 30 days.
            </p>
          </Section>

          <Section id="security" title="7. How we protect it">
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption in transit for all web, API and messaging traffic, and encryption of stored credentials and secrets.</li>
              <li>Individual accounts with role-based permissions; sign-in is rate-limited and locks after repeated failures.</li>
              <li>Each client&apos;s data is separated and visible only to that client&apos;s users.</li>
              <li>Databases accept connections only from the platform itself; servers are reached by key-based administrative access only.</li>
              <li>A send-time consent check that refuses messages to anyone who has opted out.</li>
              <li>Monitoring, logging with restricted access, nightly backups with tested restores, and a written procedure for notifying the Commission and affected people within the time the Act requires if a breach happens.</li>
            </ul>
          </Section>

          <Section id="rights" title="8. Your rights">
            <p>Under the Act you can ask us to:</p>
            <ul className="list-disc pl-6 space-y-2">
              {RIGHTS.map(([right, what]) => (
                <li key={right}>
                  <strong className="text-white">{right}:</strong> {what}.
                </li>
              ))}
            </ul>
            <p>
              To stop receiving a client&apos;s messages, reply to the message or use the unsubscribe link where one is provided; we
              record the opt-out and block further sends. For anything else, write to the contact below. If the request concerns a
              client&apos;s contact list, we will pass it to that client and help them answer it, because they decide how the list is
              used. We aim to respond within 30 days.
            </p>
            <p>
              You can also complain to the Data Protection Commission of Zambia (dataprotection.gov.zm) if you believe we have not
              handled your data lawfully.
            </p>
          </Section>

          <Section id="cookies" title="9. Cookies">
            <p>
              This website uses only the cookies needed to run it, such as remembering a session. The platform uses cookies and local
              storage to keep you signed in and remember your settings. We do not use advertising cookies.
            </p>
          </Section>

          <Section id="changes" title="10. Changes to this policy">
            <p>
              We update this page when our practices change and show the date at the top. Account holders are told about material
              changes by email or in the platform.
            </p>
          </Section>

          <Section id="contact" title="11. Contact">
            <p>
              Ballo Innovations Limited, Lusaka, Zambia. Email <a href="mailto:hello@balloads.com" className="text-white underline underline-offset-4">hello@balloads.com</a>{" "}
              or call +260 97 961 1334. Write &ldquo;Data protection&rdquo; in the subject line so it reaches our data protection
              officer.
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}
