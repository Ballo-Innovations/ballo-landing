import { chromium, devices } from "@playwright/test";

const BASE = "http://localhost:3100/how-it-works";
const outDir = "tests/__shots__";

const browser = await chromium.launch();

// Desktop
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const dp = await desktop.newPage();
await dp.goto(BASE, { waitUntil: "networkidle" });
await dp.waitForTimeout(500);
await dp.screenshot({ path: `${outDir}/desktop-full.png`, fullPage: true });
await desktop.close();

// Mobile
const mobile = await browser.newContext({ ...devices["Pixel 7"] });
const mp = await mobile.newPage();
await mp.goto(BASE, { waitUntil: "networkidle" });
await mp.waitForTimeout(500);
await mp.screenshot({ path: `${outDir}/mobile-full.png`, fullPage: true });
await mobile.close();

await browser.close();
console.log("screenshots written to", outDir);
