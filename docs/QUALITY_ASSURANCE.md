# Quality assurance and production readiness

Adopted by George on 2026-11-12 for every Ballo project. This file is the master copy; each repo
carries it as `docs/QUALITY_ASSURANCE.md` with a repo-specific appendix (tools, commands, gaps) and
references it from its `CLAUDE.md`. When the master changes, update the copies.

## Role

Work as a senior full-stack engineer, QA automation engineer, security engineer and release
gatekeeper. A change is not complete because the code is written or the build passes. Quality
assurance is part of every task: features, tickets, bug fixes, refactors, UI work, API and database
changes, integrations, infrastructure and configuration, performance and security work. Apply the
testing below without being asked.

## 1. Workflow for every ticket

### A. Understand and plan
1. Read the ticket and list its requirements and acceptance criteria.
2. Read the existing implementation; list affected components, APIs, models, services and dependencies.
3. List edge cases, failure scenarios, and security, performance, accessibility and reliability risks.
4. List existing behaviour that could regress.
5. Classify the risk as low, medium or high and build a testing matrix (section 3).

Testing depth follows risk. A typography change needs visual and responsive checks; an API change needs
API and integration tests; a migration needs integrity and migration tests; anything touching money needs
correctness, security, idempotency, failure recovery and integration tests.

### B. Implement with tests
1. Follow the repo's architecture and conventions.
2. Prefer test-driven development: write the failing test first where practical.
3. Cover happy paths, failure paths, boundaries and critical edge cases.
4. Keep changes focused; no unrelated refactors.
5. Update documentation when behaviour changes.

### C. Run quality assurance
1. Run the relevant automated tests, then the broader regression checks.
2. For UI changes, inspect the rendered interface (section 4) and check accessibility and responsiveness.
3. Run integration and end-to-end checks for affected workflows.
4. Run proportionate security and performance checks.
5. Fix failures caused by the change and rerun.

Never report a test as passed unless it ran and you read its result.

### D. Production readiness review
1. Confirm every acceptance criterion.
2. Review the final diff for unintended changes.
3. Confirm no release-blocking issue remains and deployment needs are met.
4. Write the report in section 7.

## 2. Testing catalogue

Evaluate every category for every ticket.

- **A. Code quality:** unit tests, type checking, linting, formatting, build, static analysis. No new type
  errors, lint violations, dead code or duplication; responsibilities separated; architecture respected.
- **B. Frontend, visual and UX:** visual regression, design-system consistency, responsive, cross-browser
  and cross-device, component tests, UI states, forms, navigation, animation, overflow and clipping,
  theme and localisation.
- **C. Accessibility (WCAG 2.2 AA):** automated scans (axe), keyboard navigation, focus management and
  visible focus, labels and accessible names, errors tied to inputs, contrast, zoom to 200%, reduced
  motion, colour never the only signal. Say which manual checks were not done.
- **D. Backend, API, business logic:** endpoints, validation, response schemas, authentication,
  authorisation, business rules, error handling, boundaries, background jobs, caches, pagination,
  filtering and sorting. Test rejections as well as successes; errors never leak sensitive detail; retries
  never duplicate work.
- **E. Database and data integrity:** migrations against existing data, constraints, transactions,
  concurrency, query performance, data lifecycle. Never run destructive tests against production data.
- **F. Integration, end-to-end, acceptance:** whole workflows (for example sign-up to dashboard, form to
  API to database to UI), contract tests, webhooks, third-party sandboxes or mocks. Say clearly which tests
  were mocked and which hit the real provider. Stakeholder acceptance stays pending until that person gives it.
- **G. Security and privacy:** dependency and secret scanning, injection, XSS, CSRF, access control,
  tenant isolation, rate limiting, safe errors, session handling, sensitive data in logs. Only test in
  authorised environments; escalate critical findings instead of working around them.
- **H. Performance:** page load and Core Web Vitals, bundle size, API latency, query plans, memory and CPU.
  Use the repo's budgets; where none exist, propose measurable ones. Run load, stress, spike and soak tests
  in controlled environments, not against production.
- **I. Reliability and recovery:** timeouts, retries, idempotency, slow or failing dependencies, dropped
  connections, duplicate messages, concurrent requests, graceful degradation. Failures must not corrupt data,
  duplicate work or show false success. Extra scrutiny for money and messaging.
- **J. Deployment and operations:** CI, environment variables documented, reproducible builds,
  deployment-safe migrations, feature flags, health checks, logs, metrics and alerts, staging and
  production smoke tests, rollback steps. Never change production infrastructure or deploy to production
  just to run a test; use the approved deploy paths.

## 3. Risk-based test selection

For each ticket mark every category REQUIRED, RECOMMENDED or NOT APPLICABLE. Never skip a relevant critical
test because the change looks simple, and do not impose checks on areas the change cannot affect. Justify
significant omissions in the report.

## 4. Frontend review (every UI change)

1. Run the app, open the affected pages with browser automation, and take screenshots.
2. Compare them with the design system, approved references and the existing pages.
3. Check typography, hierarchy, spacing, alignment, colour and contrast, radius and shadows, icon
   consistency, proportions, empty space, overflow and clipping.
4. Check widths of about 375, 430, 768, 1280 and 1440 px plus any breakpoint the layout depends on, in
   light and dark themes where the app has both.
5. Check the states that apply: default, hover, focus, active, disabled, loading, empty, success, error,
   validation failure, slow network, long or unexpected content.
6. Check keyboard use and run an accessibility scan.
7. Fix what you find, take new screenshots and look again.

A page that loads and an end-to-end test that passes do not make a UI production-ready. Where screenshot
regression tests exist, never approve new baselines just to make a test pass; update them only for
intentional changes. If browser automation is unavailable, say what could not be verified.

## 5. Automation and CI

Prefer the tools a repo already uses. Add a tool only when it does real work for that repo. Standard
command names (create them only when the tooling exists): `lint`, `typecheck`, `test`, `test:integration`,
`test:e2e`, `test:a11y`, `test:visual`, `build`.

Every pull request should run lint, type check, build, unit and integration tests, secret and dependency
scans, and the affected critical end-to-end, visual and accessibility checks. Before major releases or on a
schedule: wider regression, cross-browser, performance, deeper security, deployment and recovery checks.
Make critical checks required for merging where the repo allows it. A failed required gate is investigated
and fixed before approval.

## 6. Failing tests

Find the root cause; decide whether the defect is in the code, test, fixture, environment or configuration;
fix it; rerun; check for regressions. Never delete a valid test, weaken an assertion, disable a security
check, regenerate snapshots blindly, mock away the behaviour under test, or hide errors. Investigate and
document flaky tests. A test that could not run is NOT RUN, never PASSED. If a real problem is outside the
task, report it with its production impact.

Coverage: aim for meaningful coverage of critical logic, auth, money, transactions, error handling,
high-risk edge cases and essential workflows. Every bug fix gets a regression test that fails without the
fix. Keep existing coverage thresholds.

## 7. Definition of done and the report

Statuses: IMPLEMENTATION COMPLETE (code written, verification incomplete), TESTED (checks passed, approval or
operational checks remain), READY FOR PRODUCTION (every release gate met), PRODUCTION VERIFIED (deployed and
verified after release). READY FOR PRODUCTION needs: acceptance criteria met, code quality and applicable
tests passing, integrations and regressions checked, UI visually and responsively checked, accessibility
assessed, security satisfied, performance within budget, database changes validated, failure and recovery
tested, no release blockers, required reviews and stakeholder approvals done, docs updated, deployment and
monitoring ready. Otherwise the ticket is NOT READY or BLOCKED with the reason. Never assume an approval.

End every ticket with this report:

```
## Production Readiness Report
Ticket: ...   Feature: ...   Risk: Low | Medium | High   Implementation: Complete | Partial | Blocked

### Implementation summary
...

### Tests executed
| Category | Status (PASS / FAIL / NOT RUN / N/A) | Evidence |
| Code quality | | commands and results |
| Unit | | counts |
| Integration | | |
| API | | |
| End-to-end | | |
| Visual | | screenshots reviewed |
| Responsive | | widths |
| Accessibility | | scanner and manual checks |
| Security | | checks run |
| Performance | | measurements |
| Database | | |
| Reliability | | |
| Deployment readiness | | |

### Issues found and fixed
### Remaining risks and limitations (tests not run, manual reviews, external dependencies, known defects)
### Verdict: READY FOR PRODUCTION | TESTED, AWAITING APPROVAL | NOT READY | BLOCKED, with the evidence
```

## 8. Working autonomously

For a ticket: analyse, plan, set acceptance criteria, choose tests, implement, write tests, run them,
inspect UI, fix, rerun, review readiness, report. Do not stop after implementation to ask whether to test.
Ask for approval before destructive changes, production operations, paid external services or other
consequential actions. Where test infrastructure is missing, build a maintainable foundation if permitted;
otherwise document the gap instead of inventing results. Keep effort proportional.

## 9. Continuous improvement

When testing exposes a recurring weakness, add the proportionate prevention (a reusable test, lint rule,
validation helper or quality gate), document it, and let later tickets benefit.

No feature is complete until it is implemented, tested in proportion to its risk, verified against its
acceptance criteria and assessed for production readiness.

These rules sit alongside the workspace rules in `AGENTS.md` (flags, deploys, QA tester portal, em dashes,
the web app ownership rule). Where they overlap, follow both.

---

## Appendix: this repo (ballo-landing, balloads.com)

Audited 2026-11-12 on `balloads-classic` at c602ce5 with Node 20.19.

### Branches and deploys
- `upstream` is the org repo Vercel builds; `origin` is a personal fork and deploys nothing.
- balloads.com serves the `balloads-classic` branch, put there by hand with `vercel promote` of a classic
  preview. Landing work goes to a PR into `balloads-classic`, then the new preview is promoted.
- Vercel's production branch is still `main`, with no ignored-build step: merging anything into `main`
  redeploys balloads.com from `main` and replaces classic. Never merge to `main` without George's approval.
- `NEXT_PUBLIC_FEATURE_*` flags are inlined at build time; changing one in Vercel needs a redeploy.
- After a promote, `vercel inspect balloads.com` must show your new deployment id (other sessions promote too).

### Commands and current results
| Category | Command | Result on 2026-11-12 |
| --- | --- | --- |
| Lint | `npm run lint` | FAIL: 58 errors (`react/no-unescaped-entities`) and 31 warnings (`no-unused-vars`), all pre-existing |
| Type check | `npm run typecheck` (`tsc --noEmit`) | PASS, 0 errors. Needs `next-env.d.ts`, which `next dev` or `next build` writes (it is git-ignored); in a fresh clone build first |
| Build | `npm run build` | PASS, 36 routes. `next.config.ts` sets `ignoreDuringBuilds` and `ignoreBuildErrors`, so the build does not catch lint or type errors; run `typecheck` separately |
| Unit tests | none | NOT RUN: no test framework |
| End-to-end, visual, accessibility | none in the repo | NOT RUN: use the scratch Playwright workflow below |
| CI | `.github/workflows/ci.yml` | type check and build on every pull request into `balloads-classic` or `main` |

### How to verify UI here
- Never run `next dev` or `next build` in the shared checkout; other sessions run servers there and share
  one `.next`. Use a separate worktree (symlink or install `node_modules`, copy `.env.local`) on a spare port.
- Playwright is not a dependency: install it in the session scratchpad with the cached Chromium and take
  screenshots at 375, 430, 768, 1280 and 1440 px. Lenis owns scrolling, so nudge with `mouse.wheel` and wait
  for reveal animations before capturing.
- Two footer stylesheets depend on CSS chunk order; after any layout or import change, measure the page
  width at 390 px (it once widened to 539 px).

### Known gaps and minimum next steps
1. Fix the 58 lint errors, then add `npm run lint` to CI as a required check.
2. `balloads-classic` has no `package-lock.json`, so builds are not reproducible; commit one.
3. Add a Playwright smoke and axe scan for home, pricing, the subscription form and the waitlist flow.
4. Add unit tests (vitest) for `lib/` helpers such as the feature flags.
5. Remove `ignoreBuildErrors` once type checking is a required CI check.
6. Align Vercel's production branch with the branch that is actually live (the planned classic to main merge at launch).
