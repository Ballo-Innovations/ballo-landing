import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — BalloAds",
  description: "Learn how BalloAds collects, uses, and protects your personal information.",
};

const sections = [
  { id: "introduction", title: "1. Introduction & Business Identification" },
  { id: "information-we-collect", title: "2. Information We Collect" },
  { id: "how-we-use", title: "3. How We Use Information" },
  { id: "legal-basis", title: "4. Legal Basis for Data Processing" },
  { id: "data-sharing", title: "5. Data Sharing and Disclosure" },
  { id: "data-retention", title: "6. Data Retention" },
  { id: "cookies", title: "7. Cookies and Tracking Technologies" },
  { id: "data-security", title: "8. Data Security" },
  { id: "international-transfers", title: "9. International Data Transfers" },
  { id: "your-rights", title: "10. Your Privacy Rights and Choices" },
  { id: "childrens-privacy", title: "11. Children's Privacy" },
  { id: "third-party", title: "12. Third-Party Links and Services" },
  { id: "ccpa", title: "13. California Privacy Rights (CCPA/CPRA)" },
  { id: "gdpr", title: "14. European Privacy Rights (GDPR)" },
  { id: "zambian-compliance", title: "15. Zambian Data Protection Compliance" },
  { id: "meta-compliance", title: "16. Meta and Service Provider Compliance" },
  { id: "changes", title: "17. Changes to This Privacy Policy" },
  { id: "contact", title: "18. Contact Information" },
  { id: "definitions", title: "19. Definitions" },
];

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-white/60 text-sm">
            Effective Date: <span className="text-white/90">November 10, 2025</span>
            &nbsp;·&nbsp;
            Last Updated: <span className="text-white/90">April 21, 2026</span>
            &nbsp;·&nbsp;
            Version: <span className="text-white/90">2.0</span>
          </p>
          <p className="mt-6 text-white/75 text-base md:text-lg leading-relaxed max-w-2xl">
            BalloAds is committed to protecting your privacy. This policy explains how we
            collect, use, disclose, retain, and safeguard your personal information across
            our platform and services.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/terms-of-service"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            >
              Terms of Service →
            </Link>
            <a
              href="mailto:privacy@balloads.com"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            >
              privacy@balloads.com
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
          <div id="introduction" className="scroll-mt-24">
            <SectionHeading>1. Introduction &amp; Business Identification</SectionHeading>
            <SubHeading>1.1 About BalloAds</SubHeading>
            <Body>
              BalloAds is a comprehensive customer engagement and analytics platform operated by{" "}
              <strong className="text-white">Ballo Innovations Ltd</strong> ("Ballo," "we," "us," "our," or
              "Company"), a technology company incorporated and registered in the Republic of Zambia with
              offices located in Lusaka, Zambia.
            </Body>
            <InfoCard>
              <InfoRow label="Legal Entity">Ballo Innovations Ltd</InfoRow>
              <InfoRow label="Principal Place of Business">Lusaka, Zambia</InfoRow>
              <InfoRow label="Primary Service">
                Multi-channel campaign management, customer engagement, analytics, and performance
                measurement services across SMS, WhatsApp, Email, Web Pop-ups, and Push Notifications.
              </InfoRow>
            </InfoCard>
            <SubHeading>1.2 Purpose of This Policy</SubHeading>
            <Body>
              This Privacy Policy ("Policy") explains how BalloAds collects, uses, discloses, retains, and
              safeguards personal information and non-personal data through our platform, mobile
              applications, APIs, websites, and related services (collectively, the "Services"). We are
              committed to protecting your privacy and ensuring that personal information is handled in a
              safe, secure, transparent, and lawful manner in compliance with applicable data protection
              regulations.
            </Body>
            <SubHeading>1.3 Scope and Acknowledgment</SubHeading>
            <Body>This Policy applies to all users of BalloAds Services, including:</Body>
            <BulletList items={[
              "Organisations and businesses using BalloAds to manage, deliver, or analyze marketing campaigns ('Advertisers')",
              "Publishers, content providers, and partners participating in the BalloAds ecosystem ('Publishers')",
              "End users and consumers who interact with advertisements, websites, or digital content served through BalloAds ('End Users')",
              "Visitors to BalloAds websites and digital communication channels",
            ]} />
            <Body>
              By accessing, registering for, or using BalloAds Services, you acknowledge that you have
              read, understood, and agree to be bound by this Privacy Policy. If you do not agree with
              our privacy practices, please do not use our Services.
            </Body>
          </div>

          <Divider />

          {/* 2 */}
          <div id="information-we-collect" className="scroll-mt-24">
            <SectionHeading>2. Information We Collect</SectionHeading>
            <Body>
              We collect information necessary to provide, improve, and secure our Services. Information
              is collected through multiple methods and may be personal or non-personal in nature.
            </Body>

            <SubHeading>2.1 Information You Provide Directly</SubHeading>
            <Body className="font-medium text-white/90">Account Registration &amp; Profile Information:</Body>
            <BulletList items={[
              "Full name, company name, business registration details, and organizational structure",
              "Email address, phone number, and physical business address",
              "Job title, department, and role within your organization",
              "Account preferences and communication preferences",
            ]} />
            <Body className="font-medium text-white/90">Billing and Payment Information:</Body>
            <BulletList items={[
              "Bank account details, credit card information, and payment method preferences",
              "Billing address, tax identification numbers, and invoice preferences",
              "Transaction history and payment records",
              "All payment information is processed securely through PCI-DSS compliant third-party payment gateways and is not stored directly on BalloAds servers",
            ]} />
            <Body className="font-medium text-white/90">Campaign and Content Data:</Body>
            <BulletList items={[
              "Advertisement creatives, copy, images, and multimedia content",
              "Target audience parameters, demographic data, and segmentation criteria",
              "Campaign budgets, scheduling, and performance objectives",
              "Keywords, hashtags, and campaign-related metadata",
            ]} />
            <Body className="font-medium text-white/90">Communication Data:</Body>
            <BulletList items={[
              "Customer support inquiries, complaints, and feedback",
              "Feature requests, bug reports, and product feedback",
              "Communication with our sales, support, or technical teams",
              "Survey responses and user research participation",
            ]} />

            <SubHeading>2.2 Information Collected Automatically</SubHeading>
            <Body className="font-medium text-white/90">Usage and Activity Data:</Body>
            <BulletList items={[
              "Pages visited, features accessed, and functions used within BalloAds",
              "Clicks, interactions, time spent on pages, and navigation patterns",
              "Device information including device type, operating system, and device identifiers",
              "Browser type, version, and user agent information",
              "Internet Protocol (IP) address, geographic location (derived from IP), and connection information",
              "Referral source and exit pages",
            ]} />
            <Body className="font-medium text-white/90">Analytics and Performance Data:</Body>
            <BulletList items={[
              "Campaign metrics including impressions, clicks, conversions, and engagement rates",
              "Reach, frequency, and audience insights",
              "Traffic sources, user flow, and conversion funnels",
              "A/B testing results and optimization data",
            ]} />

            <SubHeading>2.3 Information from Third-Party Sources</SubHeading>
            <BulletList items={[
              "Data received from integrated advertising platforms (Google Ads, Meta Business Suite, LinkedIn Campaign Manager, WhatsApp Business API)",
              "Audience insights and demographic data from data partners and publishers",
              "Publicly available data from business registries and industry databases",
              "Data from payment processors and financial institutions",
            ]} />
          </div>

          <Divider />

          {/* 3 */}
          <div id="how-we-use" className="scroll-mt-24">
            <SectionHeading>3. How We Use Information</SectionHeading>
            <Body>
              We use collected information for legitimate business purposes, lawful operations, and to
              provide and improve our Services. All data processing is conducted in compliance with
              applicable data protection regulations.
            </Body>
            {[
              {
                title: "3.1 Service Delivery and Operations",
                items: [
                  "Account Management: Creating and maintaining user accounts, managing subscriptions, and providing account support",
                  "Campaign Delivery: Delivering advertisements, managing campaigns, and executing marketing initiatives",
                  "Performance Optimization: Analyzing campaign data, optimizing ad delivery, and improving targeting accuracy",
                  "Technical Support: Providing customer support, troubleshooting issues, and resolving technical problems",
                ],
              },
              {
                title: "3.2 Billing, Payments, and Financial Management",
                items: [
                  "Processing transactions and payments for Services",
                  "Generating invoices, receipts, and billing statements",
                  "Fraud detection and prevention in payment processing",
                  "Compliance with tax and financial reporting obligations",
                ],
              },
              {
                title: "3.3 Analytics, Reporting, and Business Intelligence",
                items: [
                  "Measuring campaign reach, engagement, and performance metrics",
                  "Generating performance reports and analytics dashboards",
                  "Creating insights and recommendations for campaign optimization",
                  "Developing aggregate and anonymized business intelligence",
                ],
              },
              {
                title: "3.4 Security, Fraud Prevention, and Compliance",
                items: [
                  "Monitoring platform activity for unauthorized access or misuse",
                  "Detecting and preventing fraud, abuse, and platform violations",
                  "Conducting security audits and vulnerability assessments",
                  "Ensuring compliance with terms of service and acceptable use policies",
                ],
              },
              {
                title: "3.5 Communication and Notifications",
                items: [
                  "Sending service updates, maintenance notices, and platform announcements",
                  "Providing account notifications and transaction confirmations",
                  "Sending marketing communications and promotional offers (with consent)",
                  "Responding to customer inquiries and support requests",
                ],
              },
              {
                title: "3.6 Service Improvement and Development",
                items: [
                  "Analysing user behavior and platform usage patterns",
                  "Identifying areas for platform improvement and optimization",
                  "Developing new features, products, and services",
                  "Testing new functionality and beta features",
                ],
              },
            ].map((sub) => (
              <div key={sub.title}>
                <SubHeading>{sub.title}</SubHeading>
                <BulletList items={sub.items} />
              </div>
            ))}
          </div>

          <Divider />

          {/* 4 */}
          <div id="legal-basis" className="scroll-mt-24">
            <SectionHeading>4. Legal Basis for Data Processing</SectionHeading>
            <Body>
              We process personal information under one or more of the following lawful bases, as
              applicable under relevant data protection regulations including GDPR, CCPA, and Zambian
              data protection frameworks:
            </Body>
            {[
              {
                title: "4.1 Performance of Contract",
                body: "Processing is necessary to fulfill our contractual obligations to you, including delivering Services, processing payments, providing customer support, and executing campaign delivery.",
              },
              {
                title: "4.2 Legitimate Business Interests",
                body: "We process information where we have legitimate business interests that are not overridden by your privacy interests, including improving platform security, analysing usage, conducting business analytics, and protecting our legal rights.",
              },
              {
                title: "4.3 Compliance with Legal Obligations",
                body: "We process information where required by law, including tax and financial reporting, regulatory compliance requirements, legal process and court orders, and law enforcement requests.",
              },
              {
                title: "4.4 Consent",
                body: "For certain processing activities, we rely on your explicit consent, including marketing communications, optional data collection, use of non-essential cookies, and sharing data with third parties for specific purposes. You may withdraw consent at any time by contacting us at privacy@balloads.com or through your account settings.",
              },
            ].map((sub) => (
              <div key={sub.title}>
                <SubHeading>{sub.title}</SubHeading>
                <Body>{sub.body}</Body>
              </div>
            ))}
          </div>

          <Divider />

          {/* 5 */}
          <div id="data-sharing" className="scroll-mt-24">
            <SectionHeading>5. Data Sharing and Disclosure</SectionHeading>
            <Body>
              We share personal information with third parties only when necessary to provide Services,
              comply with legal obligations, or protect our interests. All third-party recipients are
              bound by confidentiality obligations.
            </Body>
            <SubHeading>5.1 Service Providers and Vendors</SubHeading>
            <Body>We share information with carefully selected service providers including:</Body>
            <BulletList items={[
              "Cloud hosting and data center providers (bound by data processing agreements)",
              "Payment processors and payment gateways (PCI-DSS compliant)",
              "Email delivery, SMS, and push notification service providers",
              "Analytics service providers and business intelligence platforms",
              "Customer support and helpdesk platforms",
            ]} />
            <SubHeading>5.2 Integrated Platforms and Partners</SubHeading>
            <Body>We share necessary information with integrated advertising platforms including Google Ads, Meta Business Suite, LinkedIn Campaign Manager, and other advertising networks to deliver your campaigns.</Body>
            <SubHeading>5.3 Affiliates and Ballo Ecosystem</SubHeading>
            <Body>We may share information with other companies within the Ballo Innovations ecosystem (including BalloDash, BalloTask, BalloPay, and other Ballo services) for operational efficiency and service integration.</Body>
            <SubHeading>5.4 Legal and Regulatory Disclosure</SubHeading>
            <Body>We may disclose personal information when required by law, court orders, government or law enforcement requests, or to protect our legal rights and enforce our terms of service.</Body>
            <SubHeading>5.5 Business Transfers</SubHeading>
            <Body>In the event of merger, acquisition, bankruptcy, or sale of assets, personal information may be transferred. You will be notified of any material changes to this Privacy Policy.</Body>
            <SubHeading>5.6 Prohibition on Data Sales</SubHeading>
            <Body>
              <strong className="text-white">BalloAds does not sell personal information to third parties.</strong> We do not engage in the sale, rental, or commercial transfer of personal data for monetary or other valuable consideration.
            </Body>
          </div>

          <Divider />

          {/* 6 */}
          <div id="data-retention" className="scroll-mt-24">
            <SectionHeading>6. Data Retention</SectionHeading>
            <Body>We retain personal information only as long as necessary to fulfill the purposes outlined in this Policy or as required by applicable law.</Body>
            <SubHeading>6.1 Retention Periods by Data Category</SubHeading>
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-5 py-3 text-white/50 font-medium">Data Category</th>
                    <th className="text-left px-5 py-3 text-white/50 font-medium">Retention Period</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Account & Registration Information", "Duration of account + 3 years after termination"],
                    ["Billing & Payment Information", "Duration of relationship + 7 years after final transaction"],
                    ["Campaign & Content Data", "Duration of campaign + 12 months after completion"],
                    ["Communications & Support Data", "2 years after final communication"],
                    ["Individual-level Usage Data", "12 months"],
                    ["Aggregated & Anonymized Data", "Retained indefinitely"],
                    ["Persistent Cookies", "Up to 2 years"],
                    ["Session Cookies", "Deleted upon browser closure"],
                  ].map(([cat, period], i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="px-5 py-3 text-white/80">{cat}</td>
                      <td className="px-5 py-3 text-white/60">{period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Divider />

          {/* 7 */}
          <div id="cookies" className="scroll-mt-24">
            <SectionHeading>7. Cookies and Tracking Technologies</SectionHeading>
            <Body>BalloAds uses cookies and similar tracking technologies to enhance functionality, measure performance, and deliver targeted advertising.</Body>
            {[
              { title: "Essential Cookies", desc: "Session cookies for authentication, security cookies for fraud prevention, and functionality cookies for maintaining user preferences." },
              { title: "Performance & Analytics Cookies", desc: "Analytics cookies for measuring traffic and usage patterns, performance cookies for monitoring platform stability, and conversion tracking cookies." },
              { title: "Advertising & Targeting Cookies", desc: "Advertising cookies for delivering targeted advertisements, retargeting pixels for remarketing campaigns, and audience segmentation cookies." },
              { title: "Third-Party Cookies", desc: "Cookies from integrated advertising platforms (Google, Meta, LinkedIn), analytics providers, and social media platforms." },
            ].map((item) => (
              <div key={item.title} className="mb-4">
                <SubHeading>{item.title}</SubHeading>
                <Body>{item.desc}</Body>
              </div>
            ))}
            <SubHeading>7.2 Cookie Management</SubHeading>
            <Body>You can manage or disable cookies through your browser settings. You may opt out of advertising cookies through industry opt-out mechanisms such as the Digital Advertising Alliance portal. Disabling cookies may limit platform functionality.</Body>
          </div>

          <Divider />

          {/* 8 */}
          <div id="data-security" className="scroll-mt-24">
            <SectionHeading>8. Data Security</SectionHeading>
            <Body>We implement comprehensive security measures to protect personal information from unauthorised access, disclosure, alteration, and destruction.</Body>
            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              {[
                { title: "Encryption", desc: "SSL/TLS for all data in transit; AES-256 for sensitive data at rest." },
                { title: "Access Control", desc: "Multi-factor authentication, role-based access control, and regular access reviews." },
                { title: "Network Security", desc: "Firewalls, intrusion detection systems, DDoS protection, and network segmentation." },
                { title: "Security Audits", desc: "Regular penetration testing, vulnerability assessments, and third-party security assessments." },
                { title: "Incident Response", desc: "Documented incident response plan, security monitoring, and breach notification procedures." },
                { title: "Employee Training", desc: "Data protection training for all employees and confidentiality agreements." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-white/60">{item.desc}</p>
                </div>
              ))}
            </div>
            <Body className="mt-6">
              While we implement industry-standard security measures, no system is completely secure.
              We cannot guarantee absolute security of personal information.
            </Body>
          </div>

          <Divider />

          {/* 9 */}
          <div id="international-transfers" className="scroll-mt-24">
            <SectionHeading>9. International Data Transfers</SectionHeading>
            <Body>BalloAds may transfer personal information across international borders to provide Services and operate our global platform. When personal information is transferred outside your country of residence, we use:</Body>
            <BulletList items={[
              "EU Standard Contractual Clauses (SCCs) for transfers from the EU/EEA",
              "Adequacy decisions where applicable (e.g., EU-US Data Privacy Framework)",
              "Binding corporate rules within the Ballo Innovations group",
              "Explicit consent for certain transfers",
            ]} />
            <Body>Personal information of Zambian users may be processed and stored in Zambia where feasible. We comply with Zambian data localisation requirements and restrictions.</Body>
          </div>

          <Divider />

          {/* 10 */}
          <div id="your-rights" className="scroll-mt-24">
            <SectionHeading>10. Your Privacy Rights and Choices</SectionHeading>
            <Body>Depending on your jurisdiction and applicable data protection laws, you may have the following rights:</Body>
            <div className="space-y-4 mt-4">
              {[
                { right: "Right of Access", desc: "Request confirmation of whether we process your personal information and obtain a copy in a portable format within 30 days." },
                { right: "Right to Rectification", desc: "Correct inaccurate or incomplete personal information through your dashboard or by contacting us." },
                { right: "Right to Erasure", desc: "Request deletion of your personal information under certain circumstances, such as when data is no longer necessary or was obtained without valid consent." },
                { right: "Right to Restrict Processing", desc: "Request we limit processing of your information pending accuracy verification or while you contest the lawfulness of processing." },
                { right: "Right to Data Portability", desc: "Receive your personal information in a structured, commonly-used, machine-readable format within 30 days." },
                { right: "Right to Object", desc: "Object to processing based on legitimate interests, opt out of marketing communications, or object to automated decision-making." },
                { right: "Right to Withdraw Consent", desc: "Withdraw consent for processing at any time without penalty through your account settings or by contacting us." },
                { right: "Right to Lodge a Complaint", desc: "Lodge a complaint with your local data protection authority and seek remedies for privacy violations." },
              ].map((item) => (
                <div key={item.right} className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--cyan)]" />
                  <div>
                    <span className="font-semibold text-white">{item.right}: </span>
                    <span className="text-white/70 text-sm">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <SubHeading>10.9 Exercising Your Rights</SubHeading>
            <InfoCard>
              <InfoRow label="Email">hello@balloads.com</InfoRow>
              <InfoRow label="Mail">Ballo Innovations Ltd, Lusaka, Zambia</InfoRow>
              <InfoRow label="Phone">+260979611334</InfoRow>
              <InfoRow label="Response Timeline">Within 30 days of receipt (extensions of up to 60 additional days may apply for complex requests)</InfoRow>
            </InfoCard>
          </div>

          <Divider />

          {/* 11 */}
          <div id="childrens-privacy" className="scroll-mt-24">
            <SectionHeading>11. Children's Privacy</SectionHeading>
            <Body>BalloAds Services are not intended for children under 16 years of age. We do not knowingly collect personal information from minors. If we discover that a child under 16 has provided personal information, we will promptly delete such information and notify the parent or guardian. Parents may contact us to report suspected collection of children's data.</Body>
          </div>

          <Divider />

          {/* 12 */}
          <div id="third-party" className="scroll-mt-24">
            <SectionHeading>12. Third-Party Links and Services</SectionHeading>
            <Body>BalloAds may contain links to third-party websites, applications, and services operated by other companies. Third-party sites have their own privacy policies, and we are not responsible for their privacy practices. This Privacy Policy applies only to BalloAds Services.</Body>
            <Body>When you authorise BalloAds to integrate with third-party platforms, you grant permission to share data with those platforms. Third-party data handling is governed by their respective privacy policies. You may revoke authorisation through your account settings.</Body>
          </div>

          <Divider />

          {/* 13 */}
          <div id="ccpa" className="scroll-mt-24">
            <SectionHeading>13. California Privacy Rights (CCPA/CPRA)</SectionHeading>
            <Body>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):</Body>
            <BulletList items={[
              "Right to Know — Request what personal information we collect, use, share, and sell",
              "Right to Delete — Request deletion of personal information we have collected, subject to certain exceptions",
              "Right to Opt-Out — Opt out of the sale or sharing of your personal information",
              "Right to Correct — Request correction of inaccurate personal information",
              "Right to Limit Use — Limit our use of sensitive personal information",
              "Non-Discrimination — We will not discriminate against you for exercising your California privacy rights",
            ]} />
          </div>

          <Divider />

          {/* 14 */}
          <div id="gdpr" className="scroll-mt-24">
            <SectionHeading>14. European Privacy Rights (GDPR)</SectionHeading>
            <Body>If you are located in the European Union or European Economic Area, you have rights under the General Data Protection Regulation (GDPR). We process your information under lawful bases including contract performance, legitimate interests, legal compliance, and consent.</Body>
            <InfoCard>
              <InfoRow label="Data Protection Officer">lombe.lusale@balloinnovations.com</InfoRow>
              <InfoRow label="DPA Requests">Available for business customers as required by GDPR — contact privacy@balloads.com</InfoRow>
              <InfoRow label="Supervisory Authority">You have the right to lodge a complaint with your local data protection authority</InfoRow>
            </InfoCard>
          </div>

          <Divider />

          {/* 15 */}
          <div id="zambian-compliance" className="scroll-mt-24">
            <SectionHeading>15. Zambian Data Protection Compliance</SectionHeading>
            <Body>BalloAds complies with the Data Protection Act No. 3 of 2021 of Zambia, including lawful basis for data processing, data subject rights and protections, security and confidentiality requirements, and regulatory compliance and reporting.</Body>
            <Body>We implement enhanced protections for sensitive personal information including health and medical information, financial and banking details, biometric and genetic data, and criminal records and legal information.</Body>
          </div>

          <Divider />

          {/* 16 */}
          <div id="meta-compliance" className="scroll-mt-24">
            <SectionHeading>16. Meta and Service Provider Compliance</SectionHeading>
            <Body>BalloAds is designed to meet the privacy and data handling requirements of major service providers and advertising platforms, including Meta (Facebook, Instagram, WhatsApp) and Google. We comply with platform-specific data policies, pixel and tracking policies, advertising standards, and implement proper user consent and opt-out mechanisms.</Body>
          </div>

          <Divider />

          {/* 17 */}
          <div id="changes" className="scroll-mt-24">
            <SectionHeading>17. Changes to This Privacy Policy</SectionHeading>
            <Body>We may update this Privacy Policy periodically to reflect changes in our data practices, comply with new legal requirements, or improve clarity. The "Last Updated" date will be revised and material changes will be communicated via email or prominent notice on our website. Continued use of BalloAds after updates constitutes acceptance of the revised Policy.</Body>
          </div>

          <Divider />

          {/* 18 */}
          <div id="contact" className="scroll-mt-24">
            <SectionHeading>18. Contact Information</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Privacy Inquiries",
                  lines: ["privacy@balloads.com", "Ballo Innovations Ltd", "Lusaka, Zambia", "Attn: Chief Data Officer"],
                },
                {
                  title: "Data Protection Officer",
                  lines: ["lombe.lusale@balloinnovations.com", "Monday–Friday", "08:00–17:00 CAT"],
                },
                {
                  title: "Legal & Compliance",
                  lines: ["legal@balloinnovations.com", "+260979611334", "Ballo Innovations Ltd", "Legal and Compliance Dept", "Lusaka, Zambia"],
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
            <Body className="mt-6">We will respond to privacy inquiries within 5 business days and provide substantive responses within 30 days.</Body>
          </div>

          <Divider />

          {/* 19 */}
          <div id="definitions" className="scroll-mt-24">
            <SectionHeading>19. Definitions</SectionHeading>
            <div className="space-y-3">
              {[
                ["Personal Information", "Any information relating to an identified or identifiable natural person."],
                ["Processing", "Any operation performed on personal information including collection, use, storage, disclosure, or deletion."],
                ["Data Subject", "The natural person to whom personal information relates."],
                ["Third Party", "Any entity other than BalloAds and the data subject."],
                ["Service Provider", "A third party that processes personal information on behalf of BalloAds."],
                ["Consent", "Freely given, specific, informed, and unambiguous affirmation of willingness to process personal information."],
                ["Breach", "Unauthorised access, disclosure, or loss of personal information."],
              ].map(([term, def]) => (
                <div key={term} className="flex gap-3 text-sm">
                  <span className="font-semibold text-white shrink-0 w-44">{term}</span>
                  <span className="text-white/60">{def}</span>
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* Acknowledgment */}
          <div className="rounded-2xl border border-[var(--cyan)]/20 bg-[var(--cyan)]/5 p-6 md:p-8">
            <h3 className="font-bold text-white text-lg mb-3">Acknowledgment</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              By using BalloAds Services, you acknowledge that you have read, understood, and agree to
              this Privacy Policy. If you do not agree, please do not use our Services.
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
              href="/terms-of-service"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm text-white hover:bg-white/10 transition"
            >
              Read Terms of Service →
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}

/* ── Small layout helpers ── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl md:text-3xl font-bold text-white mb-5">{children}</h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-white/90 mt-6 mb-2">{children}</h3>
  );
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

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mt-4 mb-4 space-y-3">
      {children}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-3 text-sm">
      <span className="font-medium text-white/50 shrink-0 sm:w-48">{label}</span>
      <span className="text-white/80">{children}</span>
    </div>
  );
}

function Divider() {
  return <hr className="border-white/10" />;
}
