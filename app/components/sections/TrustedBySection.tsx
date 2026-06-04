import Image from "next/image";

import logoMakhulu  from "@/public/Client Logos/Makhulu High Res Logo white.png";
import logoParamount from "@/public/Client Logos/paramount-1 white.png";
import logoOmphile  from "@/public/Client Logos/Omphile-White.png";
import logoInsizwe  from "@/public/Client Logos/logo-2 white.png";
import logoMudenda  from "@/public/Client Logos/Mudenda Capital Logo to send-03.png";
import logoFI       from "@/public/Client Logos/Financial Insights Logo white.png";
import logoTinge    from "@/public/Client Logos/Tinge logo white.png";
import logoIVLounge from "@/public/Client Logos/iv1.png";
import logoSWR      from "@/public/Client Logos/SWR Logo white.png";
import logoShane    from "@/public/Client Logos/Shane Investments logo.png";
import logoShreeji  from "@/public/Client Logos/Shreeji.png";
import logoBayport  from "@/public/Client Logos/bayport color.png";
import logoSeneca   from "@/public/Client Logos/seneca-logo new-02.png";
import logo9        from "@/public/Client Logos/9.png";

const logos = [
  { src: logoMakhulu,  alt: "Makhulu Investments" },
  { src: logoParamount,alt: "Paramount Logistics" },
  { src: logoOmphile,  alt: "Omphile Visual Direction" },
  { src: logoInsizwe,  alt: "Insizwe" },
  { src: logoMudenda,  alt: "Mudenda Capital" },
  { src: logoFI,       alt: "Financial Insights" },
  { src: logoTinge,    alt: "Tinge Technology" },
  { src: logoIVLounge, alt: "The IV Lounge" },
  { src: logoSWR,      alt: "SWR" },
  { src: logoShane,    alt: "Shane Investments" },
  { src: logoShreeji,  alt: "Shreeji" },
  { src: logoBayport,  alt: "Bayport" },
  { src: logoSeneca,   alt: "Seneca" },
  { src: logo9,        alt: "Client" },
];

const track = [...logos, ...logos];

export function TrustedBySection() {
  return (
    <section className="ds-section" id="trusted-by">
      <div className="ds-grid-12" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
        {/* Sidebar — cols 1–3 */}
        <div className="ds-sidebar">
          <span className="ds-sidebar-label">Trusted by</span>
        </div>

        {/* Content — cols 4–12 */}
        <div className="ds-content">
          <p
            className="ds-section-head mb-10"
            style={{
              fontFamily: "var(--font-outfit, sans-serif)",
              fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
            }}
          >
            Trusted by the very best
          </p>

          <div className="ds-logo-marquee">
            <div className="ds-logo-track">
              {track.map((logo, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center shrink-0"
                  style={{ height: "72px", padding: "0 2.5rem" }}
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    height={40}
                    loading="lazy"
                    sizes="120px"
                    className="h-10 w-auto object-contain"
                    style={{
                      filter:
                        logo.src === logoBayport
                          ? "grayscale(1) contrast(0.9) opacity(0.65)"
                          : "brightness(0) opacity(0.6)",
                      transition: "opacity 0.3s linear, filter 0.3s linear",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
