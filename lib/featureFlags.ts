/**
 * Per-environment feature flags for the balloads-classic build.
 *
 * Same shape as `lib/featureFlags.ts` on the Landing branch, trimmed to the
 * flags this branch actually has. A flag defaults on only in development;
 * deployed builds need `NEXT_PUBLIC_FEATURE_*` set in Vercel (it is inlined at
 * build time, so redeploy after changing it).
 *
 * | Flag       | Env var                         |
 * | ---------- | ------------------------------- |
 * | `bookDemo` | `NEXT_PUBLIC_FEATURE_BOOK_DEMO` |
 *
 * `bookDemo` has no `?features=` runtime override on purpose: the pages it
 * guards 404 on the server, so a browser-only override could never reach them,
 * and a client-only value would make server and client render different links.
 */

export type FeatureName = "bookDemo";

/**
 * Each flag's environment value, read through a LITERAL `process.env.X`.
 * Next.js only inlines `process.env.NEXT_PUBLIC_FOO` written out as text; a
 * computed `process.env[name]` reads `undefined` in the browser. Adding a flag
 * means adding its line here.
 */
const FEATURE_ENV_VALUES: Record<FeatureName, string | undefined> = {
  bookDemo: process.env.NEXT_PUBLIC_FEATURE_BOOK_DEMO,
};

const ALL_FEATURES = Object.keys(FEATURE_ENV_VALUES) as FeatureName[];

export function resolveFlag(input: {
  env?: string | boolean | null;
  defaultEnabled: boolean;
}): boolean {
  if (input.env === true || input.env === "true" || input.env === "1") return true;
  if (input.env === false || input.env === "false" || input.env === "0") return false;
  return input.defaultEnabled;
}

const defaultEnabled = process.env.NODE_ENV === "development";

export const featureFlags: Record<FeatureName, boolean> = Object.freeze(
  Object.fromEntries(
    ALL_FEATURES.map((name) => [
      name,
      resolveFlag({ env: FEATURE_ENV_VALUES[name], defaultEnabled }),
    ]),
  ) as Record<FeatureName, boolean>,
);

export function isFeatureEnabled(name: FeatureName): boolean {
  return featureFlags[name];
}
