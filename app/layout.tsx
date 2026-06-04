import type { Metadata, Viewport } from "next";
import { Ubuntu, Ubuntu_Mono, Geist, Outfit } from "next/font/google";
import "./styles/index.css";
import "./globals.css";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const outfit = Outfit({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

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
  title: {
    default: "BalloAds — AI-Powered Digital Marketing Platform",
    template: "%s | BalloAds",
  },
  description:
    "Reach the right audience through bulk SMS, WhatsApp marketing, email campaigns, and AI-driven targeting. BalloAds gives businesses the tools to launch impactful campaigns with ease.",
  metadataBase: new URL("https://balloads.com"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(ubuntu.variable, ubuntuMono.variable, "font-sans", geist.variable, outfit.variable)}>
      <body className="font-sans antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

