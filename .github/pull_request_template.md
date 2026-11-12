## What changed

## Production readiness (see docs/QUALITY_ASSURANCE.md)
Risk: Low / Medium / High

| Check | Status (PASS / FAIL / NOT RUN / N/A) | Evidence |
| --- | --- | --- |
| Type check (`npm run typecheck`) | | |
| Lint (`npm run lint`, no new errors) | | |
| Build (`npm run build`) | | |
| Visual review at 375 / 430 / 768 / 1280 / 1440 px | | |
| Accessibility (keyboard, focus, axe) | | |
| Performance (bundle size, Lighthouse where relevant) | | |
| Preview deploy checked | | |

- [ ] Targets `balloads-classic`, not `main` (merging to `main` redeploys balloads.com)
- [ ] No em dashes in copy
- [ ] Feature flags set where the change is unapproved UI

Verdict: READY FOR PRODUCTION / TESTED, AWAITING APPROVAL / NOT READY / BLOCKED
