# Feature promotion

Production tracks `main`. Integration work lives on `Landing` (and feature
branches). Never merge all of `Landing` into `main`. Cherry-pick the slice
onto a branch off `origin/main`, PR, merge, then turn
`NEXT_PUBLIC_FEATURE_CMS_CONTENT` on in the production Vercel env if the
code shipped dark.

The ads web app is another developer — do not change it from here.

New UI takes `isFeatureEnabled` from `lib/featureFlags.ts`.

| Flag | Env var |
| --- | --- |
| `cmsContent` | `NEXT_PUBLIC_FEATURE_CMS_CONTENT` |
| `siteAssistant` | `NEXT_PUBLIC_FEATURE_SITE_ASSISTANT` |
| `whyFeatureChips` | `NEXT_PUBLIC_FEATURE_WHY_FEATURE_CHIPS` |

QA: `?features=cms`, `?features=chips`, or `?features=all`. A CMS-backed landing slice needs matching PRs in
`ballo-ads-backend-v2` and usually `ballo-cms`.
