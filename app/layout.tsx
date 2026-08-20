import type { Metadata, Viewport } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
// Carlito: open-source, metric-compatible substitute for Calibri (proprietary,
// cannot be served on the web). Self-hosted so body copy renders as the brief's
// "Calibri body" on every platform instead of falling back to Arial.
import "@fontsource/carlito/400.css";
import "@fontsource/carlito/400-italic.css";
import "@fontsource/carlito/700.css";
import "@fontsource/carlito/700-italic.css";
import "./styles/index.css";
import "./globals.css";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import { SmoothScroll } from "./components/ui/SmoothScroll";
import { WaitlistProvider } from "./components/waitlist/WaitlistProvider";
import { resolveSocialLinks } from "./components/social/socialLinks";
import { getSocialLinks } from "@/lib/socialLinksApi";
import { getSiteSettings } from "@/lib/siteSettingsApi";

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ubuntu",
});

const ubuntuMono = Ubuntu_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ubuntu-mono",
});

export const metadata: Metadata = {
  title: "Ballo Ads",
  description: "Ballo Ads",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [fetchedSocialLinks, siteSettings] = await Promise.all([getSocialLinks(), getSiteSettings()]);
  const socialLinks = resolveSocialLinks(fetchedSocialLinks);

  return (
    <html lang="en" className={`${ubuntu.variable} ${ubuntuMono.variable}`}>
      <body className="font-sans antialiased">
        <SmoothScroll>
          <WaitlistProvider>
            <Header />
            {children}
            <Footer
              socialLinks={socialLinks}
              contactPhone={siteSettings.contact_phone}
              contactEmail={siteSettings.contact_email}
            />
          </WaitlistProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}

