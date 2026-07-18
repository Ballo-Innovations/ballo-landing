# BalloAds Landing — Handover

> Handover doc for continuing work (e.g. in Cursor). Covers the project setup,
> everything done in the recent work sessions, the current uncommitted state,
> conventions/patterns to follow, and what's still outstanding.
> Last updated: 2026-07-18.

---

## 1. Project at a glance

- **Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · framer-motion · lucide-react.
- **Nature:** Pre-launch marketing site. **Front-end only** — no auth/real backend yet except a working waitlist endpoint. The waitlist is the one real pre-launch action.
- **Repo path:** `C:\Users\Situ Aj\Documents\ballo-landing` (OneDrive-synced — see gotchas §7).
- **Design source of truth:** a Canva design + the brief PDF (in `Reference folder/`). Reference screenshots are provided ad hoc per task.

### Design system / tokens (`app/styles/variables.css`)
| Token | Value | |
|---|---|---|
| `--dark-blue` / `--brand-color-1` | `#020055` | primary brand navy |
| `--dark-blue-2` | `#0e0e39` | |
| `--brand-color-2` | `#0b4d8c` | |
| `--brand-color-3` | `#2273af` | mid blue |
| `--cyan` / `--brand-color-4` | `#3fdbff` | |
| `--cyan-bright` | `#00d4ff` | |
| Fonts | Ubuntu (headings) · Calibri/Carlito (body) | `--font-ubuntu` |

- Shared classes: `.btn-primary` / `.btn-secondary` (styled for **dark** backgrounds), `.glow-button`, `.glitch-text`, `.text-gradient-cyan`, `.glass-surface-nav` (the project's glass idiom — layered gradients + inset highlights + backdrop-blur + glow blobs; reused conceptually elsewhere).
- CSS lives in `app/styles/` — `pages/*.css` (per-page), `components/*.css`, all pulled in via `app/styles/index.css`.

---

## 2. Git, branches, deploy — READ BEFORE COMMITTING

- **Working branch:** `Landing` (all work happens here; `main` is upstream default).
- **Remotes:**
  - `origin` → `https://github.com/Ballo-Innovations/ballo-landing.git` (company).
  - `personal` → `https://github.com/Ajsitu/ballo-landing.git` (personal, **Vercel deploys from its `main`**).
- **Deploy paths (do both to publish):**
  ```bash
  git push personal Landing:main   # → triggers Vercel (ballo-landing-kappa.vercel.app)
  git push origin  Landing         # → company Landing branch
  ```
  Note: `personal` has **no `Landing` branch** — only `main`. Push `Landing:main` there.
- **Live stakeholder preview:** https://ballo-landing-kappa.vercel.app
- **⚠️ COMMIT MESSAGE RULE — do NOT add any AI attribution.** No `Co-Authored-By: Claude …`, no "Generated with Claude Code" footer. History is reviewed by stakeholders + a senior engineer and must read as human-authored. (The 7 commits that previously had the trailer were rewritten + force-pushed to strip it; a local `backup-pre-trailer-strip` branch holds the old history and can be deleted.)
- Next config has `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` both **on**, so Vercel won't fail on type/lint errors — but it also won't catch them. Run `tsc --noEmit` locally before shipping anything non-trivial.

---

## 2A. Dual-repo push strategy (READ — this is easy to get wrong)

There are **two GitHub remotes**, and **you push to both on every publish.** They serve
different purposes, so keeping them in sync is a deliberate step, not an accident.

### Why two remotes exist
- **`origin` → `Ballo-Innovations/ballo-landing` (company).** This is the **canonical
  source of truth** — where the code officially lives, on branch **`Landing`**. It is
  reviewed by the senior engineer / stakeholders.
- **`personal` → `Ajsitu/ballo-landing` (personal).** This exists **only so Vercel can
  deploy the preview.** The user's Vercel is a personal (Hobby) account whose GitHub App
  only has access to **personal `Ajsitu/*` repos** — it *cannot* import the company org
  repo (that would need org-level Vercel↔GitHub admin approval). So the personal repo is a
  deploy mirror. **Vercel builds from its `main` branch.**

### The branch mapping (the part people trip on)
| Where | Branch | Role |
|---|---|---|
| local | `Landing` | you always work here |
| `origin` (company) | `Landing` | canonical review branch — same name |
| `personal` (Vercel) | **`main`** | deploy branch — **different name!** |

⚠️ The personal repo has **no `Landing` branch** — only `main`. That's why the personal
push uses the `Landing:main` **refspec** (push *local* `Landing` → *remote* `main`), while
the company push is a plain same-name `Landing` → `Landing`.

### The publish sequence (run BOTH, every time)
```bash
# 0. make sure you're on Landing with a clean, committed tree
git branch --show-current          # → Landing
git status --short                 # → empty

# 1. Vercel deploy mirror — local Landing pushes to personal/main
git push personal Landing:main     # → auto-triggers the Vercel redeploy

# 2. Company canonical branch — local Landing pushes to origin/Landing
git push origin Landing
```
- **Order doesn't matter**, but skipping one leaves the two repos out of sync — a common
  mistake. Company gets the commit but the preview doesn't rebuild (or vice-versa). Always
  do both so `personal/main`, `origin/Landing`, and local `Landing` all point at the same
  commit.
- **Normal pushes are fast-forward.** No `--force` needed for ordinary commits.

### When rewriting history (rare — e.g. stripping commit trailers)
Both branches are already published, so a rewrite means force-pushing to both. Use
`--force-with-lease` (aborts if someone else pushed since — safer than bare `--force`):
```bash
git push --force-with-lease personal Landing:main
git push --force-with-lease origin  Landing
```
Then tell any other machine/agent with `Landing` checked out to
`git fetch && git reset --hard origin/Landing` (a plain pull will conflict on rewritten
history). A network push can occasionally time out mid-transfer — just re-run the same
push command; it's idempotent.

### Verify the push landed (all three should match)
```bash
echo "personal/main : $(git ls-remote --heads personal main    | cut -c1-7)"
echo "origin/Landing: $(git ls-remote --heads origin  Landing  | cut -c1-7)"
echo "local  Landing: $(git rev-parse --short HEAD)"
```

### Mental model
> **`origin/Landing` = the record. `personal/main` = the live preview. Local `Landing`
> feeds both.** One commit, two pushes, three refs in sync.

---

## 3. What's been done (recent sessions)

### Committed + pushed (both remotes) — HEAD `5604472`

**Home hero & scroll sections** (`app/page.tsx`, `app/styles/pages/home.css`, `WhoScrollSection.tsx`, `WhyScrollSection.tsx`)
- Two-column carousel hero: rotating copy (left) + rotating person (right), both change as one slide; person "stands" on the full-width "POWERFUL AND VERSATILE" glass card. Per-slide `titleLines` (manual line breaks) and per-slide image framing via CSS vars `--person-scale/--person-x/--person-y`. Pagination dots above CTAs.
- "What We're About": cyan glow orb (`Assets/2.png`) behind the 3D phone.
- "Who can use BalloAds?" mobile → swipe/auto carousel matching desktop.
- Who/Why scroll sections moved to a **900px** mobile breakpoint (was 768px).

**Professional Services** (`app/professional/page.tsx`, `styles/pages/professional.css`) — DARK page: gradient `#070858 → #000`, divider-list accordion (thumbnail + title + subtitle + chevron, CSS grid-rows `0fr→1fr` clip-free expand), `#2373af` dividers, 340×135 thumbnails, support grid over ConcentricRings + CTAs.

**Guides** (`app/guides/page.tsx`, `styles/pages/guides.css`) — NEW page: light demo hero + feature tiles, dark FAQ band, 2-column FAQ accordion, contact card. Interim: "Watch Demo" → `/how-it-works`, "Talk to Brutus" → `/live-chat`, Category filter is a static scaffold.

**Brutus** (`app/brutus/page.tsx`, `styles/pages/brutus.css`) — NEW `/brutus` page for the AI assistant:
- **Hero:** full-bleed **looping muted autoplay video** background (`public/BalloAds Assets 2/BalloAds Asset Videos.mp4`, referenced via `encodeURI` — path has spaces), dark overlay, "A NEW WAY TO THINK AND CREATE" headline (cyan-gradient accent), "Ask Brutus anything…" prompt bar pinned at the bottom (submits → `/live-chat`).
- **WhatsApp section:** background `#000002`; a **dark translucent card** (`rgba(18,20,28,0.55)`) left-aligned with heading + sub-line + white "Read more" pill; phone mockup (`Assets/phone-frame.png`) + `Assets/2.png` glow right-aligned; a **neon half-ring** (`#3af3f7`, 5px, white core + glow) that half-rises from the section boundary (`overflow:hidden` clips the bottom half).
- **Capabilities:** 6 check items over ConcentricRings + Get Started (waitlist) / Contact us (`/live-chat`).

**Waitlist modal → liquid glass** (`app/components/waitlist/WaitlistModal.tsx`, `styles/components/waitlist.css`) — this is the SHARED modal behind every "Sign Up" CTA site-wide.
- Blue-tinted glass card, aurora corner glow (blue→cyan→violet), backdrop-blur, pill fields, gradient cyan submit arrow.
- Keeps the **real** `POST /api/waitlist` (backend requires **name + email + phone** — all three collected as glass pills; email pill carries the gradient arrow submit).
- "Continue with Google / X" are **disabled scaffolds** ("Soon" chip) — no OAuth backend yet. Footer "Talk to us" → `/live-chat`.

**Features** (`app/features/page.tsx`, `styles/pages/features.css`) — hero redesigned:
- Background `#DFE0E1`. A gradient **SVG ring** (light-blue→navy) centered, with the analytics phone (`Assets/38.png`) inside.
- 8 feature labels (4 left / 4 right) with **animated SVG connector lines** drawing outward from the phone (staggered). All white lucide icons on brand-blue badges.
- **Everything lives in one `1000×640` SVG viewBox** so ring, lines, and label anchors align by construction (verified 0px off). Mobile → simple stacked list.

### NOT yet committed (current working tree) — the **How It Works** interactive rebuild
Files:
- `app/how-it-works/steps.ts` **(new)** — single source of truth for the 4 steps (slug, number, title, description, preview `note`, icon, phone `screen`, `screenAlt`, long-form `detail`). Feeds the stage, the cards, and the sub-pages.
- `app/components/sections/HowItWorksStage.tsx` **(new)** — interactive stage.
- `app/how-it-works/[step]/page.tsx` **(new)** — per-step detail sub-pages.
- `app/how-it-works/page.tsx` **(modified)** — wired in the stage + preview cards (hero & benefits untouched).
- `app/styles/pages/how-it-works.css` **(modified)** — all `.hiw-*` styles appended.

What it does (matches the brief's "phone switches on hover/click; preview cards; detail sub-pages"):
- Phone sits center-stage; 4 icon **tiles orbit** it (floating rounded-tile style). **Hover / focus / click** a tile → phone **crossfades** to that step's screen + tile lights up.
- **Auto-tours** the 4 steps (~4.2s each) until the visitor interacts, then hands over control permanently. (Uses the time-derived-index timer pattern — see §5.)
- Caption under the phone names the live step + "Read more" → sub-page.
- 4 **preview note cards** at the bottom (4-up → 2-up → 1-up), each → its sub-page.
- `[step]` sub-pages: intro + 3 body sections + the step's screen + prev/next nav + CTAs; `generateStaticParams` + per-step metadata.
- **Real app screens** mapped to steps (already in repo, RGBA 2160×2700, crossfade in register): `37.png` sign-up · `40.png` channels · `39.png` packages · `38.png` analytics.

Verified: click & hover switch screens, auto-tour stops after takeover, 4/4 screens eager-loaded, sub-pages render with correct metadata/nav, no console/server errors, no horizontal overflow at 375/1280. **→ Needs committing + pushing.**

---

## 4. Immediate next action

Commit the How It Works work and push to both remotes (no AI trailer):
```bash
git add -A
git commit -m "feat(how-it-works): interactive step stage + per-step detail pages"
git push personal Landing:main
git push origin  Landing
```

---

## 5. Conventions & patterns to reuse

- **Design-system first, no hardcoding.** Use tokens/vars; match the surrounding file's idioms. Mobile-first, verify no horizontal overflow at 375px.
- **Scaffolding is expected**, but every CTA needs a valid destination — no dead ends. Mark interim wiring + placeholder copy with `TODO:` comments naming the integration boundary. Don't block on backend.
- **Animation fail-safe pattern (important):** make the *resting* state **visible**, and layer the intro as a keyframe `animation` gated behind an `.is-visible` class — NOT a transition from a hidden resting state. This guarantees content shows even if the animation never runs. (Used on Features.) See `.features-line` / `@keyframes features-draw`.
- **Auto-advance timers:** derive the index from elapsed time (`Math.floor((now - start)/INTERVAL) % N`) instead of incrementing — duplicated timers (React StrictMode double-invoke / Fast Refresh leaks) then recompute the same value instead of doubling the cadence. Used in `HowItWorksStage.tsx` and `WhoScrollSection.tsx`.
- **Radial/positioned diagrams:** put the visual (ring/lines) and the HTML anchors in ONE coordinate system (a shared SVG viewBox + matching % positions) so they align by construction. (Features + How It Works.)
- **Modals:** preserve focus-trap, Esc-to-close, scroll-lock, `aria-modal` (see `WaitlistModal.tsx`).
- Reference images composite cleanly when they're **RGBA + same dimensions** — check with the PNG IHDR color-type before assuming transparency.

---

## 6. Outstanding TODOs / known scaffolds

**How It Works (`steps.ts`)**
- `note` (preview-card copy) and `detail` (long-form sub-page copy) are **scaffold text I wrote** — brief says the real preview notes + longer text are "to be provided." Structure is final; swap the strings.
- `screen` per step points at the current in-app mockups (`37/40/39/38`); swap for updated screens when shared (same 2160×2700 size → no layout change).

**Brutus**
- Prompt bar / "TRY IT NOW" / "Watch demo" are interim (→ `/live-chat` or `/how-it-works`). No real chat/OAuth backend.
- Capabilities section has no earth/globe backdrop image (screenshot showed one; no asset in repo) — on plain black for now. Add the image if provided.
- Nothing links **to** `/brutus` yet — no nav/footer entry, and Guides' "Talk to Brutus" still points at `/live-chat`. Decide whether to route those to `/brutus`.

**Guides** — "Watch Demo" & video tile → `/how-it-works` interim (wire real demo video); "Category" filter is a static pill; no nav link to `/guides` yet.

**Waitlist / auth** — Google/X are disabled placeholders. If real social sign-in / accounts arrive, this modal becomes the integration point (currently pure waitlist).

**Site-wide** — no top nav menu exists (header is logo + "Sign Up" only); new pages (`/brutus`, `/guides`) are reachable only by direct link / in-page CTAs. Consider a nav/footer surface for them.

---

## 7. Gotchas (bite you if ignored)

- **OneDrive + `.next` corruption:** repo is under `Documents\` (OneDrive-synced), so Next's `.next/cache/webpack/*.pack.gz` rename can fail (EPERM/ENOENT) → `SyntaxError: Invalid or unexpected token` / blank page / `routes-manifest.json` ENOENT. Fix: stop dev server, `rm -rf .next`, restart. **Never run `next build` while `next dev` is running on the same `.next`.**
- **Line endings:** Git warns `LF will be replaced by CRLF` on commit — harmless (Windows checkout), not an error.
- **The in-app preview environment used for verification is flaky** (this is a tooling note, not a code issue): screenshots time out, `IntersectionObserver` doesn't fire reliably, and CSS transitions can appear "frozen" (renderer not ticking frames). Verify via computed-style/`getBoundingClientRect` measurements and by removing the trigger class to inspect resting state — don't trust that an unobserved animation is broken. Real browsers are fine. This is why the fail-safe animation pattern (§5) matters.
- **Spaces in asset paths:** `public/BalloAds Assets 2/…` — reference via `encodeURI(...)` for `<video>`/`<img>` src; static `import` works fine for Next `<Image>`.

---

## 8. Brief items still open (bigger picture)

- **Channel pages** (SMS/Email/WhatsApp) exist via `app/components/channel/ChannelPage.tsx` but bodies are placeholder lorem pending stakeholder notes. The 4th "Pop-ups/Web-Push" slide has no page → routes to `/features` interim.
- **BrutusAI** page: built as `/brutus` (see §3). Confirm it satisfies the brief's "AI search UI + rising glowing ring."
- Per-page brief notes not all finalized: Blog bolder hero images; For My Business (George M'sapenda guide detail + menu placement) is a hook/placeholder; Knowledge Base "Ballo Academy"; What's New links to blog.
- Body font is Calibri/Carlito (self-hosted `@fontsource/carlito`; Calibri is proprietary → Carlito is the metric-compatible substitute). Verify the webfont actually loads (`document.fonts.check`) — a named-but-unbundled font silently falls back to Arial.

---

## 9. Key files map

```
app/
  page.tsx                              home (hero carousel, Why/Who, testimonials)
  brutus/page.tsx                       Brutus AI page
  guides/page.tsx                       Guides
  professional/page.tsx                 Professional Services (dark accordion)
  features/page.tsx                     Features (radial ring + connector lines)
  how-it-works/
    page.tsx                            hero + interactive stage + preview cards
    steps.ts                            ← single source of truth for the 4 steps
    [step]/page.tsx                     per-step detail sub-pages
  components/
    sections/HowItWorksStage.tsx        interactive phone/tile stage
    sections/WhoScrollSection.tsx       "Who can use BalloAds?" pinned rising card
    sections/WhyScrollSection.tsx       "Why Choose BalloAds"
    waitlist/WaitlistModal.tsx          shared liquid-glass waitlist modal
    waitlist/WaitlistProvider.tsx       openWaitlist() context
    channel/ChannelPage.tsx             config-driven SMS/Email/WhatsApp pages
    ui/ConcentricRings.tsx              reused ring SVG
    ui/FadeUpReveal.tsx                 scroll-reveal wrapper
  styles/
    variables.css                       design tokens
    index.css                           imports all page/component CSS
    pages/*.css                         per-page styles (home, brutus, features, how-it-works, …)
    components/waitlist.css             glass modal styles
  api/waitlist/route.ts                 POST /api/waitlist (needs name+email+phone)
public/Assets/                          app screens 37-40, glow 2.png, phone-frame.png, ring 8/9.png
```

---
---

# PART B — Working instructions, standards & learnings

> This is the accumulated "how to work on this repo" knowledge from prior sessions —
> the binding engineering contract, the stakeholder's working style, hard-won gotchas,
> and reusable technique notes. Treat §B1 (standards) and §B2 (process) as rules, not
> suggestions. The rest is field experience — read it before large changes.

## B1. The binding engineering contract (non-negotiable)

Act as a **senior front-end engineer**. Accuracy, maintainability, scalability, and
design-system adherence come **before speed**. Quality here is measured by design
accuracy, design-system compliance, maintainability, reusability, accessibility, and
responsiveness — **NOT** by files changed, speed, or lines written. The user set these
down as a contract before implementation and enforces them.

- **No hardcoding.** Never hardcode colors, typography, font sizes, spacing, radius,
  shadows, breakpoints, dimensions, or animation values when a token/var/shared
  primitive exists. Use `variables.css` tokens, Tailwind theme tokens, or existing
  classes. If a token is genuinely missing, *document it and propose adding it* — don't
  silently hardcode. (Pragmatic exception seen in practice: an **exact hex the
  stakeholder explicitly dictates for a one-off** — e.g. `#3af3f7` for the Brutus ring,
  `#DFE0E1` for the Features bg, `#000002` section bg — is used verbatim because it *is*
  the spec. Note it in a comment; don't invent values.)
- **Follow existing patterns first.** Read the codebase, reuse components/layouts/
  conventions, match the surrounding file's idioms (comment density, naming, spacing).
  Don't introduce a new pattern where one exists. Consistency > personal preference.
- **Design-system compliance is mandatory.** Canva/screenshots = the *visual target*;
  the existing design system = the *implementation standard*. Match the visual **through**
  the design system, not around it.
- **Build reusable, config-driven components** for repeated UI (see `ChannelPage.tsx`,
  `steps.ts` as the single source of truth for a page's data). No duplicated markup.
- **Mobile-first.** Design small-screen first, scale up. Verify **375px** and a desktop
  width before calling anything done; **zero horizontal overflow** at every width.
- **No visual guessing.** If layout/spacing/interaction/content is unclear, inspect the
  reference (Canva, related screens, existing impl) or **ask**. Never invent.
- **Preserve architecture.** No unrelated refactors, renames, or folder reorgs. Touch
  only what the task needs.
- **Accessibility is required, not optional:** semantic HTML, correct heading hierarchy,
  keyboard access, focus-visible states, `aria-*` on interactive/decorative elements,
  contrast, `aria-live` for content that swaps, `prefers-reduced-motion` fallbacks.
  (Every interactive thing built here has these — match that bar.)
- **Performance:** avoid needless rerenders, big deps, deep DOM nesting, duplicate
  requests, or heavy animation libs when CSS/existing solutions suffice.

## B2. Per-task process the stakeholder expects

1. **Analyze** the brief + reference (Canva/screenshot) + existing implementation +
   related components *before* writing code.
2. For anything non-trivial, **plan** (components affected, pages affected, design-system
   considerations, risks, dependencies) and, when the direction is genuinely ambiguous or
   reverses a prior decision, **confirm before implementing** (use a focused question with
   a recommended option — see B4). Small, obvious calls: just make them and say so.
3. **Implement only the agreed scope.**
4. **QA** against the brief, the reference, the design system, and responsiveness —
   with real measurements, not vibes (see B3).
5. **Report faithfully**: what's done + verified, what's interim/scaffold, what's a known
   limitation. Never claim "done" for something you couldn't verify — say so explicitly.

## B3. Verification discipline (this is how work was checked here)

- **The in-app browser preview is used to verify — but it is FLAKY in this environment.**
  Concretely: `computer{screenshot}` **times out** (renderer frozen / never idles because
  of a global smooth-scroll rAF loop), `IntersectionObserver` **does not fire reliably**
  (also breaks next/image lazy-loading), and CSS **transitions can appear frozen** at their
  start value. These are *tooling artifacts, not code bugs* — real browsers are fine.
- **So verify with measurements, not screenshots.** Use `javascript_tool` to read
  `getBoundingClientRect`, `getComputedStyle`, `naturalWidth/complete`, class presence,
  `document.documentElement.scrollWidth - clientWidth` (overflow), grid columns, etc.
  This is how alignment (e.g. Features lines landing 0px on their labels), colors, and
  responsive breakpoints were confirmed. To check an animation's *resting* state, remove
  the trigger class via JS and measure — don't conclude "broken" from a frozen transition.
- **Force-load lazy assets to confirm they'll render** (`img.loading='eager'; img.src=img.src`)
  when the preview's lazy observer won't fire; if a decorative below-fold image matters,
  give it `priority`.
- Check `read_console_messages(onlyErrors)` and `preview_logs(level:error)` — but note
  `preview_logs` shows a **historical buffer**; mid-edit errors from earlier transient
  states linger and are NOT current. Confirm against the live DOM.
- Always re-verify at **mobile (375) + at least one desktop width**, and a "tight" width
  (~935–1000px) where centered containers approach the viewport and labels can overflow.

## B4. Stakeholder working style (learned — matters a lot)

- **The reference/screenshot is the source of truth, and it can override earlier verbal
  specs.** When a new screenshot contradicts a previous instruction (e.g. "white card at
  60%" → the later visual clearly showed a *dark* card), follow the newest visual **and
  flag the reversal** so they can correct you. Do the same when a request conflicts with
  the user's *own* prior explicit sign-off — surface it, don't silently comply or revert.
- **Change ONLY what was asked.** A hard-won lesson: when the stakeholder asks for one
  change (e.g. "move the text right"), do *not* also retune adjacent styling (blur, card
  position, colors) — that reads as regressions and gets rejected. Minimal, surgical diffs.
- **They iterate visually and tune by eye.** Expect follow-ups like "make the ring bigger,"
  "half-rising from the next section," "center the phone." Build with easily-tweakable
  values (CSS vars, single clamp/percent knobs) and *tell them which knob to turn*.
- **They care about the history reading clean** — see the no-AI-trailer rule (§2). They're
  handing this to a senior engineer and stakeholders for review.
- **Decisions that change what you build → ask** (functional forks especially: e.g. "should
  this glass module stay a real waitlist or become a scaffolded auth card?"). Give a
  recommended option first. Don't ask about things with an obvious default.
- They run this repo through **multiple agents in parallel** (Cursor/Codex + Claude). So:
  **read the actual working tree (`git diff`/`git status`) — never trust a summary.** On
  handovers you'll find changes you didn't make; review them, judge if they're coherent
  and complete (e.g. "are the new CSS classes actually defined?"), and only then include
  them. This session found + shipped in-tree home-hero work that wasn't mine after
  verifying every new class existed.

## B5. Scope philosophy — integration readiness, not feature completeness

- Goal: build the front-end **architecture + scaffolding** so a backend engineer can wire
  functionality later **without reworking the UI**. Backend is sequenced after front-end.
- **You build:** pages, routes, layouts, components, hover/click/empty/loading states,
  placeholder content *structures*, animation containers, integration hooks.
- **You leave TODO boundaries for backend:** auth/accounts/signup logic, AI search/chat,
  dynamic/CMS content, demo scheduling, API-driven phone screens, video content, OAuth.
  Mark them with `TODO:` comments that name expected inputs/outputs where relevant.
- **CTA rule:** every CTA must lead to a **valid destination** and the flow must be
  complete front-end-wise (routes exist, nav works, pages load). The CTA needn't perform
  its final business function yet — but **no dead ends** (route interim CTAs to a real
  page like `/live-chat` or `/how-it-works` and note it).
- **If the brief references a page, it should exist as a front-end destination** even if
  the final data/content/behavior isn't delivered.
- This governs *scope/flow* only — it does **not** override brand/design-system facts (B1).

## B6. Reusable techniques proven in this codebase

- **Fail-safe intro animations.** Make the *resting* state visible; layer the intro as a
  keyframe `animation` gated behind an `.is-visible` class (added by a client effect) —
  NOT a transition out of a hidden resting state. Guarantees content shows even if the
  animation never runs (and lets you verify the resting layout in the frozen preview).
  See `.features-line` + `@keyframes features-draw`; `HowItWorksStage` screen crossfade.
- **Idempotent auto-advance timers.** Derive the active index from elapsed time
  (`Math.floor((performance.now() - start) / INTERVAL) % N`) instead of `prev+1`. React
  StrictMode double-invoke and Fast-Refresh timer leaks then recompute the *same* value
  instead of doubling the cadence. Used in `HowItWorksStage.tsx`, `WhoScrollSection.tsx`.
- **One coordinate system for diagrams.** Put the visual (SVG ring/lines) and the HTML
  anchors in the SAME space (shared `viewBox` + matching `%` positions) so they align by
  construction, not by trial-and-error. Features + How It Works both do this; alignment
  verified at 0px.
- **Draw-in lines:** SVG `<line pathLength={1}>` + `stroke-dasharray:1; stroke-dashoffset:1→0`
  gives a length-independent, uniform draw regardless of path length. (Keyframe form is
  more robust than a transition in this preview — see B3.)
- **Half-rising ring effect:** a full circle whose center sits on the section's bottom edge
  (`bottom:0; translate:-50% 50%`) with the parent `overflow:hidden` clips the bottom half →
  reads as a dome rising from the next section. See `.brutus-arc`.
- **Reference images composite cleanly when RGBA + identical dimensions.** Check the PNG
  IHDR color-type (6 = RGBA) before assuming transparency; identical sizes crossfade in
  perfect register (How It Works screens: all 2160×2700 RGBA).
- **The project's glass idiom** (`.glass-surface-nav`): layered gradients + inset white
  highlights + `backdrop-filter: blur() saturate()` + soft glow blobs. Reused for the
  waitlist card (`.wl-card`) and Brutus's dark card. Theme it with brand blues/cyan.
- **Modals:** always keep focus-trap, Esc-to-close, body scroll-lock, `aria-modal`,
  focus restore. Copy the pattern in `WaitlistModal.tsx`.
- **Grid-rows `0fr → 1fr`** for clip-free accordion expand (no hardcoded max-height) —
  Professional accordion.
- **`WaitlistButton`** lets server components trigger the shared waitlist modal without
  becoming client components — reuse it instead of new modals.

## B7. Environment & platform gotchas (will waste hours if ignored)

- **OneDrive + `.next` corruption (recurring):** repo is under `Documents\` (OneDrive-synced).
  Next's `.next/cache/webpack/*.pack.gz` rename can fail (EPERM/ENOENT) → runtime
  `SyntaxError: Invalid or unexpected token`, blank page, "missing required error
  components," or `routes-manifest.json` ENOENT. **Fix:** stop dev server, `rm -rf .next`,
  restart. **NEVER run `next build`/`pnpm build` while `next dev` runs on the same `.next`**
  — it clobbers the dev artifacts and triggers the same corruption.
- **Shell:** primary shell is **PowerShell**; a **Bash** tool is also available (POSIX).
  Heredocs with apostrophes in the content will break `bash -c '...'` quoting — prefer the
  editor for appending CSS/text with apostrophes (learned the hard way appending
  how-it-works.css). Use dedicated file tools over `cat`/`sed`/`echo`.
- **Windows line endings:** Git warns `LF will be replaced by CRLF` on nearly every file —
  harmless, not an error.
- **Spaces in asset paths** (`public/BalloAds Assets 2/…`): reference via `encodeURI(...)`
  for `<video>`/`<img>` `src`; static `import` works fine for Next `<Image>`.
- **`gh` CLI is not installed.** Use raw git for GitHub ops here.
- **Auth boundaries — do NOT attempt on the user's behalf:** Vercel CLI login, GitHub
  `vercel login`, GitHub sudo-mode password, OAuth/app grants. These require the *user* to
  authenticate. The GitHub→Vercel dashboard route (user-driven) is what works.

## B8. Deploy specifics (fuller than §2)

- **Live stakeholder alias:** `https://ballo-landing-kappa.vercel.app` — the shareable
  public alias on the user's **personal** Vercel (Hobby). The long immutable
  `ballo-landing-<hash>-<team>.vercel.app` URLs are protected — always share `-kappa`.
- Vercel deploys from **`Ajsitu/ballo-landing` `main`** (personal), which is why the deploy
  step is `git push personal Landing:main`. The company org repo couldn't be imported
  directly (Vercel GitHub App only covers personal `Ajsitu/*` repos).
- **Known preview limitation:** the waitlist POSTs to `/api/waitlist → ${BACKEND}/v1/waitlist`;
  no `BACKEND` env var is set in Vercel, so submitting shows an inline error in preview.
  Fine for visual review — add the env var in Vercel settings when the backend is ready.
- Force-pushes here used `--force-with-lease` (aborts if someone else pushed since) — do
  the same when rewriting shared history.

## B9. Content & brand specifics worth carrying

- **"Brutus"** is BalloAds' AI assistant (the cyan robot mascot, `elements small/ballo-bot.png`),
  now marketed at `/brutus`.
- **BalloDash** = the analytics product name (used in copy across pages).
- Currency in mockups is Zambian Kwacha (**K**); phone/contact examples use +260. The
  audience/market context is Zambian/African — keep examples region-appropriate.
- Body font is **Calibri/Carlito** (self-hosted `@fontsource/carlito`; Calibri is
  proprietary so Carlito is the metric-compatible substitute), headings **Ubuntu**.
  ⚠️ A font *named* in a CSS stack but not bundled silently falls back to Arial — verify
  the webfont actually loads (`document.fonts.check(...)`) if you touch typography.
- Social links config: `app/components/social/socialLinks.ts`; socials live in a top
  header strip (hides on scroll), not the footer.

## B10. If you only remember five things

1. **No hardcoding; reuse the design system; follow existing patterns.** (B1)
2. **Change only what was asked; flag reversals; keep diffs surgical.** (B4)
3. **Verify with measurements, not screenshots — the preview is flaky.** (B3)
4. **No dead-end CTAs; scaffold with `TODO` boundaries; the brief defines scope.** (B5)
5. **No AI attribution in commits; `git push personal Landing:main` + `git push origin Landing` to ship.** (§2)
