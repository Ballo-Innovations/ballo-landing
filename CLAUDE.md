# ballo-landing (balloads.com)

## Quality assurance (mandatory)

Read `docs/QUALITY_ASSURANCE.md` before any task and follow it for every change: plan with a risk level and
a testing matrix, prefer test-driven development, run the applicable checks, inspect UI changes in a real
browser at 375, 430, 768, 1280 and 1440 px, and end with the Production Readiness Report and one verdict.
Never report a check as passed unless it ran. The appendix lists this repo's commands, current results and gaps.

## Deploys (mandatory)

balloads.com serves the `balloads-classic` branch through a manual `vercel promote`. Vercel's production
branch is `main`, so merging into `main` replaces balloads.com: never do it without George's approval.
Work goes to PRs into `balloads-classic` on the `upstream` (org) remote.
