/**
 * Builds the features page phone (public/Assets/features-phone/):
 * frame.png is the frame of Assets/37.png with its screen cut out, and
 * screen-NN.webp are the screens cut out of Assets/37-45.png, sized to that
 * opening. The page shows one frame and swaps only the screen inside it.
 *
 *   node scripts/build-features-phone.cjs public/Assets public/Assets/features-phone
 *
 * BOX holds each mockup's inner screen edge (the inside of the black bezel),
 * measured by hand. Screen 40 was drawn on a bigger phone with a bigger
 * island, so its crop starts below that island.
 */
const sharp = require("sharp");
const [src, out] = process.argv.slice(2);
const HOLE = { l: 611, t: 276, w: 974, h: 2169, r: 160 };
// Inner screen box per source image (bezel inner edge, measured; 38/40 bottoms from the device's proportions).
const BOX = {
  37: [611, 276, 974, 2169], 38: [544, 277, 976, 2174], 39: [556, 265, 979, 2180],
  40: [561, 186, 1062, 2336], 41: [611, 253, 983, 2192], 42: [607, 273, 968, 2159],
  43: [607, 273, 968, 2159], 44: [635, 253, 983, 2192], 45: [605, 269, 970, 2160],
};
(async () => {
  const fs = require("fs"); fs.mkdirSync(out, { recursive: true });
  const holeSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2160" height="2700"><rect x="${HOLE.l}" y="${HOLE.t}" width="${HOLE.w}" height="${HOLE.h}" rx="${HOLE.r}" ry="${HOLE.r}" fill="#000"/></svg>`);
  const pill = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2160" height="2700"><rect x="933" y="298" width="329" height="99" rx="49.5" fill="#050505"/></svg>`);
  const frame = await sharp(`${src}/37.png`).ensureAlpha()
    .composite([{ input: holeSvg, blend: "dest-out" }, { input: pill, blend: "over" }]).png().toBuffer();
  await sharp(frame).resize(1080, 1350).png({ compressionLevel: 9, palette: false }).toFile(`${out}/frame.png`);
  for (const [n, [l, t, w, h]] of Object.entries(BOX)) {
    const inset = 4;
    const input = `${src}/${n}.png`;
    if (n === "40") {
      // Drawn on a bigger phone with a bigger island (~460x132) that the shared
      // frame's island cannot cover, so this crop starts just below it.
      await sharp(input).extract({ left: 575, top: 384, width: 1035, height: 2130 })
        .resize(600, Math.round(600 * HOLE.h / HOLE.w), { fit: "cover", position: "top" })
        .flatten({ background: "#f2f2f2" }).webp({ quality: 86 }).toFile(`${out}/screen-${n}.webp`);
      continue;
    }
    await sharp(input).extract({ left: l + inset, top: t + inset, width: w - 2 * inset, height: h - 2 * inset })
      .resize(600, Math.round(600 * HOLE.h / HOLE.w), { fit: "cover", position: "top" }).flatten({ background: "#f2f2f2" })
      .webp({ quality: 86 }).toFile(`${out}/screen-${n}.webp`);
  }
})();
