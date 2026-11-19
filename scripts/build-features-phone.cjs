/**
 * Builds the features page phone (public/Assets/features-phone/):
 *   frame.png        the frame of Assets/37.png with its screen cut out
 *   screen-NAME.webp a real web app screenshot from features-phone-shots/,
 *                    under a status bar, sized to the frame's screen opening
 *
 *   node scripts/build-features-phone.cjs public/Assets public/Assets/features-phone
 *
 * The screenshots were taken on 2026-11-19 from the dev web app
 * (dev-ballo-ads.web.app) with a throwaway account (user 51, company 44
 * "Lusaka Fresh Market") at 390 x 824 CSS px, 2x, mobile emulation. To refresh
 * them, capture the same pages at that size and rerun this script. The
 * How it works page (HowItWorksScroll.tsx) reuses the frame and these screens.
 */
const path = require("path");
const sharp = require("sharp");
const [src, out] = process.argv.slice(2);
const HOLE = { l: 611, t: 276, w: 974, h: 2169, r: 160 };
// One screenshot per feature label on the features page, in label order.
const SCREENS = ["sms", "whatsapp", "email", "notifications", "home", "calendar", "brutus", "analytics"];
// Extra screens used elsewhere: "signup" is step 1 on the How it works page
// (dev web app /signup, same size).
SCREENS.push("signup");
(async () => {
  const fs = require("fs"); fs.mkdirSync(out, { recursive: true });
  const holeSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2160" height="2700"><rect x="${HOLE.l}" y="${HOLE.t}" width="${HOLE.w}" height="${HOLE.h}" rx="${HOLE.r}" ry="${HOLE.r}" fill="#000"/></svg>`);
  const pill = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2160" height="2700"><rect x="933" y="298" width="329" height="99" rx="49.5" fill="#050505"/></svg>`);
  const frame = await sharp(`${src}/37.png`).ensureAlpha()
    .composite([{ input: holeSvg, blend: "dest-out" }, { input: pill, blend: "over" }]).png().toBuffer();
  await sharp(frame).resize(1080, 1350).png({ compressionLevel: 9, palette: false }).toFile(`${out}/frame.png`);
  // Screens: real screenshots of the web app (dev, 390 x 824 CSS px at 2x),
  // under a phone status bar so the frame's island does not cover the app.
  const shots = path.join(__dirname, "features-phone-shots");
  for (const name of SCREENS) {
    const file = path.join(shots, `${name}.png`);
    const { data } = await sharp(file).extract({ left: 0, top: 0, width: 40, height: 4 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const [r, g, b] = [data[0], data[1], data[2]];
    const ink = 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#111" : "#fff";
    const bar = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="780" height="88">
      <rect width="780" height="88" fill="rgb(${r},${g},${b})"/>
      <text x="62" y="62" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="30" font-weight="600" fill="${ink}">9:41</text>
      <g fill="${ink}" transform="translate(588 38)">
        <rect x="0" y="16" width="6" height="8" rx="1.5"/><rect x="10" y="11" width="6" height="13" rx="1.5"/>
        <rect x="20" y="6" width="6" height="18" rx="1.5"/><rect x="30" y="0" width="6" height="24" rx="1.5"/>
        <path d="M62 24a3.5 3.5 0 1 0 0.01 0zM51 14a16 16 0 0 1 22 0l-3 3a12 12 0 0 0-16 0zM45 8a24 24 0 0 1 34 0l-3 3a20 20 0 0 0-28 0z"/>
        <rect x="92" y="1" width="40" height="22" rx="6" fill="none" stroke="${ink}" stroke-width="2.5" opacity="0.5"/>
        <rect x="96" y="5" width="30" height="14" rx="3"/><rect x="134" y="8" width="3" height="8" rx="1.5" opacity="0.5"/>
      </g></svg>`);
    const body = await sharp(file).resize(780, 1648).toBuffer();
    const full = await sharp({ create: { width: 780, height: 1736, channels: 3, background: "#ffffff" } })
      .composite([{ input: bar, left: 0, top: 0 }, { input: body, left: 0, top: 88 }]).png().toBuffer();
    await sharp(full).resize(600, Math.round(600 * HOLE.h / HOLE.w), { fit: "fill" })
      .webp({ quality: 86 }).toFile(`${out}/screen-${name}.webp`);
  }
})();
