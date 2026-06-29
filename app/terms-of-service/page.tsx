import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — BalloAds",
  description: "Read the Terms of Service governing your use of the BalloAds platform and services.",
};

const sections = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "definitions", title: "2. Definitions" },
  { id: "eligibility", title: "3. Eligibility and Account Registration" },
  { id: "services", title: "4. Description of Services" },
  { id: "acceptable-use", title: "5. Acceptable Use Policy" },
  { id: "advertiser-obligations", title: "6. Advertiser Obligations" },
  { id: "payment", title: "7. Payment Terms and Billing" },
  { id: "intellectual-property", title: "8. Intellectual Property" },
  { id: "data-privacy", title: "9. Data Privacy and Security" },
  { id: "third-party", title: "10. Third-Party Integrations" },
  { id: "disclaimers", title: "11. Disclaimers and Warranties" },
  { id: "liability", title: "12. Limitation of Liability" },
  { id: "indemnification", title: "13. Indemnification" },
  { id: "termination", title: "14. Termination and Suspension" },
  { id: "dispute-resolution", title: "15. Dispute Resolution" },
  { id: "governing-law", title: "16. Governing Law" },
  { id: "changes", title: "17. Changes to Terms" },
  { id: "contact", title: "18. Contact Information" },
];

export default function TermsOfServicePage() {
  return (
    <main
      className="min-h-screen text-white"
      style={{ background: "linear-gradient(180deg, #070858 0%, #000000 100%)" }}
    >
      {/* Hero */}
      <section className="px-4 pt-32 pb-12 md:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-medium text-[var(--cyan)] mb-3 tracking-widest uppercase">
            Legal
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Terms of Service
          </h1>
          <p className="text-white/60 text-sm">
            Effective Date: <span className="text-white/90">November 10, 2025</span>
            &nbsp;·&nbsp;
            Last Updated: <span className="text-white/90">April 21, 2026</span>
            &nbsp;·&nbsp;
            Version: <span className="text-white/90">2.0</span>
          </p>
          <p className="mt-6 text-white/75 text-base md:text-lg leading-relaxed max-w-2xl">
            These Terms of Service govern your access to and use of BalloAds. Please read them
            carefully before using our platform. By accessing our Services, you agree to be bound
            by these Terms.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/privacy-policy"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            >
              Privacy Policy →
            </Link>
            <a
              href="mailto:legal@balloinnovations.com"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            >
              legal@balloinnovations.com
            </a>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="px-4 pb-12 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--cyan)] mb-5">
              Table of Contents
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-sm text-white/60 hover:text-white transition py-1"
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 pb-24 md:px-8">
        <div className="mx-auto max-w-4xl space-y-16">

          {/* 1 */}
          <div id="acceptance" className="scroll-mt-24">
            <SectionHeading>1. Acceptance of Terms</SectionHeading>
            <Body>
              These Terms of Service ("Terms") constitute a legally binding agreement between you
              ("User," "you," or "your") and <strong className="text-white">Ballo Innovations Ltd</strong> ("Ballo," "we," "us," or "our"),
              operators of the BalloAds platform, with offices in Lusaka, Zambia.
            </Body>
            <Body>
              By accessing or using BalloAds, its website, mobile applications, APIs, and related
              services (collectively, the "Services"), you confirm that you have read, understood,
              and agree to be bound by these Terms and our{" "}
              <Link href="/privacy-policy" className="text-[var(--cyan)] hover:underline">
                Privacy Policy
              </Link>
              . If you do not agree to these Terms, you must not access or use our Services.
            </Body>
            <Body>
              If you are using the Services on behalf of an organisation, you represent and warrant
              that you have the authority to bind that organisation to these Terms, and "you" shall
              refer to that organisation.
            </Body>
          </div>

          <Divider />

          {/* 2 */}
          <div id="definitions" className="scroll-mt-24">
            <SectionHeading>2. Definitions</SectionHeading>
            <div className="space-y-3">
              {[
                ["BalloAds / Platform", "The digital marketing and customer engagement platform operated by Ballo Innovations Ltd, including all associated websites, apps, APIs, and tools."],
                ["Services", "All products, features, tools, APIs, dashboards, and support offerings provided by BalloAds."],
                ["Advertiser", "Any organisation or individual that uses BalloAds to create, manage, or deliver marketing campaigns."],
                ["Campaign", "A structured marketing initiative created by an Advertiser on the Platform."],
                ["Content", "Any materials uploaded, submitted, or published by a User on the Platform, including ad creatives, copy, images, and data."],
                ["Account", "A registered user profile granting access to the Platform and its features."],
                ["Subscription", "A recurring paid plan granting access to specific Platform features and usage limits."],
                ["Data", "Any information processed through the Platform, including personal data, campaign data, and analytics."],
              ].map(([term, def]) => (
                <div key={term as string} className="flex flex-col sm:flex-row sm:gap-4 text-sm py-3 border-b border-white/5 last:border-0">
                  <span className="font-semibold text-white shrink-0 sm:w-52">{term}</span>
                  <span className="text-white/60 mt-1 sm:mt-0">{def}</span>
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* 3 */}
          <div id="eligibility" className="scroll-mt-24">
            <SectionHeading>3. Eligibility and Account Registration</SectionHeading>
            <SubHeading>3.1 Eligibility</SubHeading>
            <Body>To use BalloAds, you must:</Body>
            <BulletList items={[
              "Be at least 18 years of age or the legal age of majority in your jurisdiction",
              "Have the legal capacity to enter into binding contracts",
              "Not be prohibited from using the Services under applicable law",
              "Represent a legitimate business entity or operate as a sole proprietor",
            ]} />
            <SubHeading>3.2 Account Registration</SubHeading>
            <Body>You must create an Account to access most features of the Platform. When registering, you agree to:</Body>
            <BulletList items={[
              "Provide accurate, current, and complete information",
              "Maintain and promptly update your account information",
              "Keep your login credentials confidential and secure",
              "Notify us immediately of any unauthorised access to your Account",
              "Accept responsibility for all activities occurring under your Account",
            ]} />
            <Body>
              BalloAds reserves the right to refuse registration, suspend, or terminate any Account at
              our sole discretion, including for suspected fraud, misrepresentation, or violation of
              these Terms.
            </Body>
          </div>

          <Divider />

          {/* 4 */}
          <div id="services" className="scroll-mt-24">
            <SectionHeading>4. Description of Services</SectionHeading>
            <Body>
              BalloAds provides a multi-channel digital marketing and customer engagement platform
              enabling Advertisers to plan, execute, and measure marketing campaigns across:
            </Body>
            <div className="grid gap-3 sm:grid-cols-2 mt-4 mb-4">
              {[
                { channel: "SMS", desc: "Bulk and targeted SMS messaging campaigns" },
                { channel: "WhatsApp", desc: "WhatsApp Business API campaign delivery" },
                { channel: "Email", desc: "Email marketing and automation" },
                { channel: "Web Pop-ups", desc: "On-site engagement and lead capture" },
                { channel: "Push Notifications", desc: "Web and mobile push campaigns" },
                { channel: "Analytics", desc: "Performance measurement and reporting dashboards" },
              ].map((item) => (
                <div key={item.channel} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <span className="text-sm font-semibold text-white">{item.channel}</span>
                  <p className="text-xs text-white/55 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
            <Body>
              BalloAds reserves the right to modify, suspend, or discontinue any feature or aspect of
              the Services at any time with reasonable notice. We will not be liable to you or any
              third party for any modification, suspension, or discontinuation of Services.
            </Body>
          </div>

          <Divider />

          {/* 5 */}
          <div id="acceptable-use" className="scroll-mt-24">
            <SectionHeading>5. Acceptable Use Policy</SectionHeading>
            <SubHeading>5.1 Permitted Use</SubHeading>
            <Body>You may use BalloAds solely for lawful business purposes in accordance with these Terms and all applicable laws and regulations.</Body>
            <SubHeading>5.2 Prohibited Activities</SubHeading>
            <Body>You must not use the Services to:</Body>
            <BulletList items={[
              "Send unsolicited, spam, or deceptive communications to individuals who have not consented to receive them",
              "Distribute malware, viruses, or any malicious code",
              "Engage in phishing, fraud, or any deceptive or misleading practices",
              "Violate any applicable law, regulation, or third-party rights, including intellectual property rights",
              "Collect or process personal data without lawful basis or proper consent",
              "Interfere with or disrupt the integrity or performance of the Platform",
              "Attempt to gain unauthorised access to any part of the Platform or related systems",
              "Reverse engineer, decompile, or disassemble any part of the Platform",
              "Use the Platform to promote illegal products or services",
              "Discriminate against individuals based on race, gender, religion, nationality, disability, or other protected characteristics",
              "Circumvent any security measures, access controls, or usage limits",
              "Resell, sublicense, or otherwise commercialise the Services without prior written consent",
            ]} />
            <Body>
              BalloAds reserves the right to investigate and take appropriate action, including
              suspension or termination of your Account, for any suspected violation of this
              Acceptable Use Policy.
            </Body>
          </div>

          <Divider />

          {/* 6 */}
          <div id="advertiser-obligations" className="scroll-mt-24">
            <SectionHeading>6. Advertiser Obligations</SectionHeading>
            <SubHeading>6.1 Content Standards</SubHeading>
            <Body>All Content submitted to the Platform must:</Body>
            <BulletList items={[
              "Be accurate, truthful, and not misleading",
              "Comply with all applicable advertising standards, laws, and regulations",
              "Respect third-party intellectual property rights",
              "Not contain offensive, harmful, defamatory, or discriminatory material",
              "Include required disclosures and disclaimers as mandated by law",
            ]} />
            <SubHeading>6.2 Consent and Data Compliance</SubHeading>
            <Body>Advertisers are responsible for:</Body>
            <BulletList items={[
              "Obtaining valid consent from all recipients before sending marketing communications",
              "Maintaining records of consent and making them available upon request",
              "Complying with all applicable data protection laws including Zambia's Data Protection Act No. 3 of 2021, GDPR (where applicable), and CCPA (where applicable)",
              "Providing clear and accessible opt-out mechanisms in all communications",
              "Handling all personal data in accordance with BalloAds' Privacy Policy and applicable law",
            ]} />
            <SubHeading>6.3 Content Review</SubHeading>
            <Body>
              BalloAds reserves the right, but not the obligation, to review, reject, or remove any
              Content that violates these Terms or applicable platform policies. Removal of Content
              does not entitle you to a refund.
            </Body>
          </div>

          <Divider />

          {/* 7 */}
          <div id="payment" className="scroll-mt-24">
            <SectionHeading>7. Payment Terms and Billing</SectionHeading>
            <SubHeading>7.1 Fees and Pricing</SubHeading>
            <Body>
              Access to certain features of the Platform requires payment of fees as specified in the
              applicable Subscription plan or as agreed in a separate order form. All fees are quoted
              in the currency specified at the time of purchase and are exclusive of applicable taxes
              unless otherwise stated.
            </Body>
            <SubHeading>7.2 Billing Cycle</SubHeading>
            <BulletList items={[
              "Subscription fees are billed in advance on a monthly or annual basis as selected",
              "Usage-based fees (where applicable) are billed in arrears at the end of each billing period",
              "All fees are non-refundable unless otherwise expressly stated or required by law",
            ]} />
            <SubHeading>7.3 Payment Methods</SubHeading>
            <Body>Payments are processed through PCI-DSS compliant third-party payment gateways. BalloAds does not store full payment card details on its servers. You authorise us to charge your selected payment method for all applicable fees.</Body>
            <SubHeading>7.4 Late Payment and Suspension</SubHeading>
            <Body>
              Failure to pay fees when due may result in suspension or termination of your access to
              the Services. BalloAds reserves the right to charge interest on overdue amounts at the
              rate of 2% per month or the maximum rate permitted by applicable law, whichever is lower.
            </Body>
            <SubHeading>7.5 Price Changes</SubHeading>
            <Body>
              BalloAds may change its fees at any time with at least 30 days' notice. Continued use
              of the Services after the price change takes effect constitutes acceptance of the new fees.
            </Body>
            <SubHeading>7.6 Taxes</SubHeading>
            <Body>You are responsible for all taxes, duties, and levies imposed on your use of the Services by any governmental authority, excluding taxes on BalloAds' net income.</Body>
          </div>

          <Divider />

          {/* 8 */}
          <div id="intellectual-property" className="scroll-mt-24">
            <SectionHeading>8. Intellectual Property</SectionHeading>
            <SubHeading>8.1 BalloAds IP</SubHeading>
            <Body>
              All rights, title, and interest in and to the Platform, including all software, designs,
              trademarks, trade names, logos, documentation, and other materials ("BalloAds IP") are
              and shall remain the exclusive property of Ballo Innovations Ltd. These Terms do not
              grant you any rights to BalloAds IP except the limited licence to use the Services as
              described herein.
            </Body>
            <SubHeading>8.2 Your Content</SubHeading>
            <Body>
              You retain ownership of all Content you submit to the Platform. By submitting Content,
              you grant BalloAds a worldwide, non-exclusive, royalty-free licence to use, host,
              display, and process your Content solely to provide and improve the Services.
            </Body>
            <SubHeading>8.3 Feedback</SubHeading>
            <Body>
              If you submit feedback, suggestions, or ideas regarding the Services, you grant BalloAds
              a perpetual, irrevocable, royalty-free licence to use such feedback for any purpose
              without compensation to you.
            </Body>
            <SubHeading>8.4 Third-Party IP</SubHeading>
            <Body>You are solely responsible for ensuring that your Content does not infringe any third-party intellectual property rights. BalloAds will respond to valid notices of IP infringement in accordance with applicable law.</Body>
          </div>

          <Divider />

          {/* 9 */}
          <div id="data-privacy" className="scroll-mt-24">
            <SectionHeading>9. Data Privacy and Security</SectionHeading>
            <Body>
              Your use of the Services is also governed by our{" "}
              <Link href="/privacy-policy" className="text-[var(--cyan)] hover:underline">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. By using the Services, you
              consent to the data practices described in the Privacy Policy.
            </Body>
            <Body>
              Where BalloAds processes personal data on your behalf as a data processor, we will do
              so in accordance with your documented instructions and applicable data protection law.
              Upon request, we will enter into a Data Processing Agreement (DPA) as required by GDPR
              or other applicable regulations.
            </Body>
            <Body>
              You are responsible for the lawful collection and processing of any personal data you
              upload to or process through the Platform, including obtaining all necessary consents
              and providing required notices to data subjects.
            </Body>
          </div>

          <Divider />

          {/* 10 */}
          <div id="third-party" className="scroll-mt-24">
            <SectionHeading>10. Third-Party Integrations</SectionHeading>
            <Body>
              BalloAds integrates with third-party platforms including Google Ads, Meta Business Suite,
              LinkedIn Campaign Manager, WhatsApp Business API, and others. Your use of these
              integrations is subject to the respective third-party terms of service and privacy policies.
            </Body>
            <Body>
              BalloAds is not responsible for the availability, accuracy, or practices of third-party
              services. We do not endorse and are not liable for any third-party content, products,
              or services. Disruptions or changes to third-party services may affect the functionality
              of certain Platform features without liability to BalloAds.
            </Body>
          </div>

          <Divider />

          {/* 11 */}
          <div id="disclaimers" className="scroll-mt-24">
            <SectionHeading>11. Disclaimers and Warranties</SectionHeading>
            <Body>
              THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF
              ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW,
              BALLO INNOVATIONS LTD DISCLAIMS ALL WARRANTIES INCLUDING, WITHOUT LIMITATION, IMPLIED
              WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </Body>
            <Body>BalloAds does not warrant that:</Body>
            <BulletList items={[
              "The Services will be uninterrupted, timely, secure, or error-free",
              "The results obtained from use of the Services will be accurate or reliable",
              "Any errors in the Services will be corrected",
              "The Platform is free from viruses or other harmful components",
            ]} />
            <Body>
              Some jurisdictions do not allow the exclusion of certain warranties. In such cases,
              the above exclusions apply to the fullest extent permitted by applicable law.
            </Body>
          </div>

          <Divider />

          {/* 12 */}
          <div id="liability" className="scroll-mt-24">
            <SectionHeading>12. Limitation of Liability</SectionHeading>
            <Body>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL BALLO INNOVATIONS
              LTD, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS,
              DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING FROM YOUR USE OF OR INABILITY TO
              USE THE SERVICES.
            </Body>
            <Body>
              IN NO EVENT SHALL BALLO'S TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS RELATING TO
              THE SERVICES EXCEED THE GREATER OF (A) THE AMOUNTS PAID BY YOU TO BALLO IN THE TWELVE
              (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED US DOLLARS (USD $100).
            </Body>
            <Body>
              These limitations apply regardless of the theory of liability (contract, tort,
              negligence, strict liability, or otherwise) and even if BalloAds has been advised of
              the possibility of such damages.
            </Body>
          </div>

          <Divider />

          {/* 13 */}
          <div id="indemnification" className="scroll-mt-24">
            <SectionHeading>13. Indemnification</SectionHeading>
            <Body>
              You agree to indemnify, defend, and hold harmless Ballo Innovations Ltd and its
              officers, directors, employees, contractors, and agents from and against any claims,
              liabilities, damages, losses, costs, and expenses (including reasonable legal fees)
              arising out of or relating to:
            </Body>
            <BulletList items={[
              "Your use of the Services or violation of these Terms",
              "Your Content or the use thereof by BalloAds as permitted under these Terms",
              "Your violation of any applicable law or regulation",
              "Your violation of any third-party rights, including intellectual property or privacy rights",
              "Any fraud, wilful misconduct, or gross negligence by you",
            ]} />
          </div>

          <Divider />

          {/* 14 */}
          <div id="termination" className="scroll-mt-24">
            <SectionHeading>14. Termination and Suspension</SectionHeading>
            <SubHeading>14.1 Termination by You</SubHeading>
            <Body>
              You may terminate your Account at any time by contacting us at{" "}
              <a href="mailto:hello@balloads.com" className="text-[var(--cyan)] hover:underline">hello@balloads.com</a>{" "}
              or through your account settings. Termination does not entitle you to a refund of any
              prepaid fees unless required by applicable law.
            </Body>
            <SubHeading>14.2 Termination or Suspension by BalloAds</SubHeading>
            <Body>BalloAds may suspend or terminate your Account immediately, without prior notice or liability, if:</Body>
            <BulletList items={[
              "You breach any provision of these Terms",
              "Your use of the Services poses a risk to BalloAds, other users, or third parties",
              "You fail to pay fees when due",
              "Required by law or regulatory authority",
              "Your Account remains inactive for an extended period",
            ]} />
            <SubHeading>14.3 Effect of Termination</SubHeading>
            <Body>
              Upon termination, your right to access and use the Services ceases immediately. BalloAds
              may delete your Account data in accordance with our data retention policy. Provisions
              of these Terms that by their nature should survive termination shall survive, including
              intellectual property, limitation of liability, indemnification, and dispute resolution.
            </Body>
          </div>

          <Divider />

          {/* 15 */}
          <div id="dispute-resolution" className="scroll-mt-24">
            <SectionHeading>15. Dispute Resolution</SectionHeading>
            <SubHeading>15.1 Informal Resolution</SubHeading>
            <Body>
              Before initiating formal proceedings, you agree to contact us at{" "}
              <a href="mailto:legal@balloinnovations.com" className="text-[var(--cyan)] hover:underline">legal@balloinnovations.com</a>{" "}
              and attempt to resolve the dispute informally. We will use reasonable efforts to resolve
              the issue within 30 days.
            </Body>
            <SubHeading>15.2 Arbitration</SubHeading>
            <Body>
              If informal resolution fails, any dispute arising from or relating to these Terms or the
              Services shall be resolved by binding arbitration in accordance with the rules of the
              Zambia Association of Arbitrators (ZAA) or such other arbitration body as the parties
              may mutually agree. The arbitration shall be conducted in Lusaka, Zambia, in the
              English language.
            </Body>
            <SubHeading>15.3 Class Action Waiver</SubHeading>
            <Body>
              You agree that any arbitration or legal proceedings shall be conducted on an individual
              basis and not as part of a class, consolidated, or representative action.
            </Body>
          </div>

          <Divider />

          {/* 16 */}
          <div id="governing-law" className="scroll-mt-24">
            <SectionHeading>16. Governing Law</SectionHeading>
            <Body>
              These Terms shall be governed by and construed in accordance with the laws of the
              Republic of Zambia, without regard to its conflict of law principles. Subject to the
              arbitration clause above, you consent to the exclusive jurisdiction of the courts
              located in Lusaka, Zambia for any disputes not subject to arbitration.
            </Body>
            <Body>
              For users located in the European Union, nothing in these Terms affects your rights
              under mandatory local consumer protection law or other mandatory local laws.
            </Body>
          </div>

          <Divider />

          {/* 17 */}
          <div id="changes" className="scroll-mt-24">
            <SectionHeading>17. Changes to Terms</SectionHeading>
            <Body>
              BalloAds reserves the right to modify these Terms at any time. We will provide at least
              30 days' notice of material changes via email to your registered address or through a
              prominent notice on the Platform. The "Last Updated" date at the top of this page will
              be revised accordingly.
            </Body>
            <Body>
              Your continued use of the Services after the effective date of the revised Terms
              constitutes your acceptance of the changes. If you do not agree to the revised Terms,
              you must stop using the Services before the effective date of the changes.
            </Body>
          </div>

          <Divider />

          {/* 18 */}
          <div id="contact" className="scroll-mt-24">
            <SectionHeading>18. Contact Information</SectionHeading>
            <Body>If you have any questions about these Terms, please contact us:</Body>
            <div className="grid gap-4 sm:grid-cols-3 mt-4">
              {[
                {
                  title: "General Enquiries",
                  lines: ["hello@balloads.com", "+260979611334", "Ballo Innovations Ltd", "Lusaka, Zambia"],
                },
                {
                  title: "Legal & Compliance",
                  lines: ["legal@balloinnovations.com", "Legal and Compliance Dept", "Ballo Innovations Ltd", "Lusaka, Zambia"],
                },
                {
                  title: "Data Protection",
                  lines: ["privacy@balloads.com", "Chief Data Officer", "lombe.lusale@balloinnovations.com"],
                },
              ].map((card) => (
                <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h4 className="font-semibold text-white mb-3 text-sm">{card.title}</h4>
                  {card.lines.map((line, i) => (
                    <p key={i} className="text-sm text-white/60 leading-relaxed">{line}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* Acknowledgment */}
          <div className="rounded-2xl border border-[var(--cyan)]/20 bg-[var(--cyan)]/5 p-6 md:p-8">
            <h3 className="font-bold text-white text-lg mb-3">Agreement</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              By using BalloAds Services, you acknowledge that you have read, understood, and agree
              to be bound by these Terms of Service and our Privacy Policy. If you do not agree,
              please do not use our Services.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/50">
              <span>Version: 2.0</span>
              <span>·</span>
              <span>Effective: November 10, 2025</span>
              <span>·</span>
              <span>Last Updated: April 21, 2026</span>
              <span>·</span>
              <span>Next Review: April 2027</span>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/privacy-policy"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm text-white hover:bg-white/10 transition"
            >
              Read Privacy Policy →
            </Link>
            <a
              href="mailto:legal@balloinnovations.com"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand-color-1)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-color-2)] transition"
            >
              Contact Legal Team
            </a>
          </div>

        </div>
      </section>
    </main>
  );
}

/* ── Layout helpers ── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl md:text-3xl font-bold text-white mb-5">{children}</h2>;
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-white/90 mt-6 mb-2">{children}</h3>;
}

function Body({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-sm md:text-base text-white/65 leading-relaxed mb-3 ${className}`}>
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mb-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm text-white/65">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cyan)]" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Divider() {
  return <hr className="border-white/10" />;
}
