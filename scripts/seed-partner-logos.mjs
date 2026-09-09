#!/usr/bin/env node
/**
 * Seed the CMS partner-logo list from the logo files in this repo.
 *
 * Both marketing strips are fed by one table: rows with `isBacker` go to the
 * "Backed by" rail, the rest to the "Trusted by the very best" marquee. Until
 * a row exists for a strip the site renders the hardcoded fallback in
 * `app/page.tsx`, so seeding is what hands control of these strips to
 * marketing.
 *
 * Each logo is uploaded first and the URL the upload returns is what gets
 * stored. That matters: the one row that was in the dev CMS pointed at
 * `https://assets.balloads.com/logos/mtn.svg`, which 404s, and a row whose
 * image is dead still counts as a seeded row — it replaces the whole fallback
 * list with one broken logo. Never write a URL by hand here.
 *
 * Usage:
 *   BALLOADS_TOKEN=<backoffice jwt> node scripts/seed-partner-logos.mjs [--env dev|staging|prod] [--dry-run] [--prune]
 *
 * The token needs the MarketingContentManage permission — the same one the CMS
 * "Partner logos" page requires. Get it from the CMS session (Application →
 * Local Storage) or by logging in against the target environment.
 *
 *   --dry-run  print what would be uploaded and created, write nothing
 *   --prune    delete rows already in the CMS whose name is not in this list
 *              (destructive; off by default, and it asks first)
 */

import { readFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const BASES = {
  dev: "https://app-api-dev.balloads.com",
  staging: "https://app-api-staging.balloads.com",
  prod: "https://app-api.balloads.com",
};

const REPO = resolve(import.meta.dirname, "..");

/**
 * Kept deliberately in step with FALLBACK_PARTNER_LOGOS and
 * FALLBACK_BACKER_LOGOS in `app/page.tsx`: seeding should reproduce what the
 * site already shows, not quietly introduce a different set. `sortOrder` is
 * the list order.
 */
const PARTNERS = [
  ["Makhulu Investments", "public/Client Logos/Makhulu High Res Logo white.png"],
  ["Paramount Logistics", "public/Client Logos/paramount-1 white.png"],
  ["Omphile Visual Direction", "public/Client Logos/Omphile-White.png"],
  ["Insizwe", "public/Client Logos/logo-2 white.png"],
  ["Mudenda Capital", "public/Client Logos/Mudenda Capital Logo to send-03.png"],
  ["Financial Insights", "public/Client Logos/Financial Insights Logo white.png"],
  ["Tinge Technology", "public/Client Logos/Tinge logo white.png"],
  ["The IV Lounge", "public/Client Logos/IV Lounge Social Media.png"],
  ["SWR", "public/Client Logos/SWR Logo white.png"],
  ["Shane Investments", "public/Client Logos/Shane Investments logo.png"],
  ["Shreeji", "public/Client Logos/Shreeji.png"],
  ["Bayport", "public/Client Logos/bayport color.png"],
  ["Seneca", "public/Client Logos/seneca-logo new-02.png"],
];

const BACKERS = [
  ["Airtel", "public/Backer Logos/airtel.svg"],
  ["MTN", "public/Backer Logos/mtn.svg"],
  ["Meta", "public/Backer Logos/meta.svg"],
  ["ZICTA", "public/Backer Logos/zicta-white.png"],
];

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function parseArgs(argv) {
  const args = { env: "dev", dryRun: false, prune: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--env") args.env = argv[++i];
    else if (argv[i] === "--dry-run") args.dryRun = true;
    else if (argv[i] === "--prune") args.prune = true;
    else die(`Unknown argument: ${argv[i]}`);
  }
  if (!BASES[args.env]) die(`--env must be one of: ${Object.keys(BASES).join(", ")}`);
  return args;
}

function die(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

async function api(base, token, path, init = {}) {
  const res = await fetch(`${base}/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${init.method ?? "GET"} ${path} → ${res.status} ${body.slice(0, 300)}`);
  }
  return res.status === 204 ? null : res.json();
}

async function uploadLogo(base, token, relPath) {
  const abs = join(REPO, relPath);
  const bytes = await readFile(abs).catch(() => {
    throw new Error(`Missing logo file: ${relPath}`);
  });
  const ext = relPath.slice(relPath.lastIndexOf(".")).toLowerCase();
  const type = MIME[ext] ?? die(`Unsupported logo type: ${ext}`);

  const form = new FormData();
  form.append("file", new Blob([bytes], { type }), basename(relPath));

  const result = await api(base, token, "Backoffice/marketing-content/upload-image", {
    method: "POST",
    body: form,
  });
  const url = result?.url;
  if (!url) throw new Error(`Upload of ${relPath} returned no url: ${JSON.stringify(result)}`);
  return url;
}

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${question} [y/N] `);
  rl.close();
  return answer.trim().toLowerCase() === "y";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const token = process.env.BALLOADS_TOKEN;
  if (!token) die("Set BALLOADS_TOKEN to a backoffice JWT with MarketingContentManage.");

  const base = BASES[args.env];
  const rows = [
    ...PARTNERS.map(([name, file], i) => ({ name, file, isBacker: false, sortOrder: i })),
    ...BACKERS.map(([name, file], i) => ({ name, file, isBacker: true, sortOrder: i })),
  ];

  console.log(`\n  ${args.dryRun ? "DRY RUN — " : ""}seeding ${rows.length} logos into ${base}\n`);

  const existing = await api(base, token, "Backoffice/partner-logos");
  const byName = new Map(existing.map((row) => [row.name.trim().toLowerCase(), row]));
  console.log(`  ${existing.length} row(s) already in the CMS: ${existing.map((r) => r.name).join(", ") || "none"}\n`);

  for (const row of rows) {
    const key = row.name.trim().toLowerCase();
    const current = byName.get(key);
    const verb = current ? "update" : "create";
    const strip = row.isBacker ? "Backed by" : "marquee";

    if (args.dryRun) {
      console.log(`  ${verb.padEnd(6)} ${row.name} (${strip}) ← ${row.file}`);
      continue;
    }

    try {
      const logoUrl = await uploadLogo(base, token, row.file);
      const body = {
        name: row.name,
        logoUrl,
        sortOrder: row.sortOrder,
        isPublished: true,
        isBacker: row.isBacker,
      };
      await api(base, token, current ? `Backoffice/partner-logos/${current.id}` : "Backoffice/partner-logos", {
        method: current ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      console.log(`  ${verb.padEnd(6)} ${row.name} (${strip}) → ${logoUrl}`);
    } catch (err) {
      // Keep going: one bad file should not leave the strip half-seeded with
      // no report of what is missing.
      console.error(`  FAILED ${row.name}: ${err.message}`);
    }
  }

  const seeded = new Set(rows.map((r) => r.name.trim().toLowerCase()));
  const stale = existing.filter((row) => !seeded.has(row.name.trim().toLowerCase()));
  if (stale.length === 0) {
    console.log("\n  No rows left over.\n");
    return;
  }

  console.log(`\n  ${stale.length} row(s) in the CMS are not in this list: ${stale.map((r) => r.name).join(", ")}`);
  if (!args.prune) {
    console.log("  Left alone. Re-run with --prune to delete them.\n");
    return;
  }
  if (args.dryRun) {
    console.log("  Would delete them (--dry-run).\n");
    return;
  }
  if (!(await confirm(`  Delete ${stale.length} row(s) permanently?`))) {
    console.log("  Left alone.\n");
    return;
  }
  for (const row of stale) {
    await api(base, token, `Backoffice/partner-logos/${row.id}`, { method: "DELETE" });
    console.log(`  deleted ${row.name}`);
  }
  console.log("");
}

main().catch((err) => die(err.stack ?? String(err)));
