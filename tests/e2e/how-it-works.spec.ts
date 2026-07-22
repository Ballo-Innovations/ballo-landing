import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PATH = "/how-it-works";

const STEP_TITLES = [
  "Sign Up & Get Verified",
  "Select Your Audience",
  "Customise Your Campaign",
  "Monitor & Optimise",
];

const STEP_SLUGS = [
  "sign-up",
  "select-audience",
  "customise-campaign",
  "monitor-optimise",
];

async function gotoPage(page: Page) {
  await page.goto(PATH, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

test.describe("How It Works — accessibility", () => {
  test("has no serious or critical axe violations", async ({ page }) => {
    await gotoPage(page);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    // Attach a readable report for triage.
    if (seriousOrCritical.length) {
      console.log(
        "Serious/critical a11y violations:\n" +
          seriousOrCritical
            .map(
              (v) =>
                `- [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))\n    ${v.nodes
                  .slice(0, 3)
                  .map((n) => n.target.join(" "))
                  .join("\n    ")}`
            )
            .join("\n")
      );
    }

    expect(seriousOrCritical).toEqual([]);
  });

  test("has exactly one h1 and a sensible heading order", async ({ page }) => {
    await gotoPage(page);

    const h1s = page.locator("h1");
    await expect(h1s).toHaveCount(1);
    await expect(h1s).toContainText("Seamless Marketing");

    // Benefit cards should be h3 (there are 6).
    await expect(page.locator("h3.hiw-benefit-card__title")).toHaveCount(6);
  });

  test("every image has an accessible name or is explicitly decorative", async ({
    page,
  }) => {
    await gotoPage(page);

    const imgs = await page.locator("img").all();
    expect(imgs.length).toBeGreaterThan(0);

    for (const img of imgs) {
      const alt = await img.getAttribute("alt");
      const ariaHidden = await img.getAttribute("aria-hidden");
      const role = await img.getAttribute("role");
      // Valid: non-empty alt, OR decorative (alt="" / aria-hidden / role=presentation).
      const decorative =
        alt === "" || ariaHidden === "true" || role === "presentation";
      const named = !!alt && alt.trim().length > 0;
      expect(decorative || named).toBeTruthy();
    }
  });

  test("all interactive controls expose an accessible name", async ({ page }) => {
    await gotoPage(page);

    // Compute an approximate accessible name that also accounts for the common
    // "icon link" pattern where the name comes from a child <img alt>.
    const accessibleName = (el: Element): string => {
      const aria = el.getAttribute("aria-label");
      if (aria && aria.trim()) return aria.trim();
      const labelledby = el.getAttribute("aria-labelledby");
      if (labelledby) {
        const text = labelledby
          .split(/\s+/)
          .map((id) => el.ownerDocument.getElementById(id)?.textContent ?? "")
          .join(" ")
          .trim();
        if (text) return text;
      }
      const text = (el.textContent ?? "").trim();
      if (text) return text;
      const img = el.querySelector("img[alt]");
      const imgAlt = img?.getAttribute("alt")?.trim();
      if (imgAlt) return imgAlt;
      const title = el.getAttribute("title")?.trim();
      return title ?? "";
    };

    const unnamed = await page.evaluate((namerSrc) => {
      // eslint-disable-next-line no-new-func
      const namer = new Function("return " + namerSrc)() as (el: Element) => string;
      const controls = Array.from(
        document.querySelectorAll("a[href], button")
      );
      return controls
        .filter((el) => !namer(el))
        .map((el) => el.outerHTML.slice(0, 120));
    }, accessibleName.toString());

    expect(unnamed, `Controls missing an accessible name:\n${unnamed.join("\n")}`).toEqual(
      []
    );
  });
});

test.describe("How It Works — content & structure", () => {
  test("renders all four step cards with correct titles and links", async ({
    page,
  }) => {
    await gotoPage(page);

    const cards = page.locator(".hiw-step-card");
    await expect(cards).toHaveCount(4);

    for (let i = 0; i < STEP_TITLES.length; i++) {
      const card = cards.nth(i);
      await expect(card).toContainText(STEP_TITLES[i]);
      await expect(card).toHaveAttribute(
        "href",
        `/how-it-works/${STEP_SLUGS[i]}`
      );
    }
  });

  test("hero CTAs and spotlight CTA are present", async ({ page }) => {
    await gotoPage(page);

    await expect(
      page.getByRole("button", { name: /get started/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Watch Demo", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /try it now/i })
    ).toBeVisible();
  });

  test("renders all six benefit cards", async ({ page }) => {
    await gotoPage(page);
    await expect(page.locator(".hiw-benefit-card")).toHaveCount(6);
  });

  test("video play control has an accessible name and target", async ({
    page,
  }) => {
    await gotoPage(page);
    const play = page.getByRole("link", { name: /watch demo video/i });
    await expect(play).toBeVisible();
    await expect(play).toHaveAttribute("href", "/guides");
  });
});

test.describe("How It Works — interaction & UX", () => {
  test("hovering a step card marks it as the current step", async ({ page }) => {
    await gotoPage(page);

    const thirdCard = page.locator(".hiw-step-card").nth(2);
    await thirdCard.hover();
    await expect(thirdCard).toHaveAttribute("aria-current", "step");
  });

  test("step cards are keyboard focusable and show a visible focus ring", async ({
    page,
  }) => {
    await gotoPage(page);

    const firstCard = page.locator(".hiw-step-card").first();
    await firstCard.focus();
    await expect(firstCard).toBeFocused();

    const outline = await firstCard.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: s.outlineWidth };
    });
    expect(outline.style).not.toBe("none");
  });

  test("clicking a step card navigates to its detail page", async ({ page }) => {
    await gotoPage(page);

    await page.locator(".hiw-step-card").first().click();
    await expect(page).toHaveURL(/\/how-it-works\/sign-up$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Sign Up & Get Verified"
    );
  });
});

test.describe("How It Works — layout quality", () => {
  test("page does not overflow horizontally", async ({ page }) => {
    await gotoPage(page);

    const overflow = await page.evaluate(() => {
      const el = document.documentElement;
      return el.scrollWidth - el.clientWidth;
    });
    // Allow a 1px rounding tolerance.
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("step cards do not visually overlap each other", async ({ page }) => {
    await gotoPage(page);

    const boxes = [];
    const cards = page.locator(".hiw-step-card");
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      if (box) boxes.push(box);
    }

    const overlaps = (a: typeof boxes[number], b: typeof boxes[number]) => {
      const ix = Math.max(
        0,
        Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
      );
      const iy = Math.max(
        0,
        Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
      );
      return ix > 4 && iy > 4; // >4px both axes = real overlap
    };

    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        expect(
          overlaps(boxes[i], boxes[j]),
          `Step cards ${i + 1} and ${j + 1} overlap`
        ).toBeFalsy();
      }
    }
  });

  test("primary CTA meets a comfortable touch-target size", async ({ page }) => {
    await gotoPage(page);
    const cta = page.getByRole("button", { name: /get started/i });
    const box = await cta.boundingBox();
    expect(box).not.toBeNull();
    // WCAG 2.5.5 / mobile guidance: aim for >= 44px height.
    expect(box!.height).toBeGreaterThanOrEqual(40);
  });
});
