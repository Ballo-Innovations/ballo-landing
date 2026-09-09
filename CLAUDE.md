# Feature promotion (mandatory)

Never merge all of `Landing` into `main`. Cherry-pick the slice, PR into `main`. New UI takes `isFeatureEnabled` from `lib/featureFlags.ts`. Promote with `NEXT_PUBLIC_FEATURE_CMS_CONTENT=true` after merge. Do not edit `ballo-ads-web-app`. See `docs/feature-promotion.md`.
