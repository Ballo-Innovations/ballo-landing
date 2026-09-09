/**
 * Per-environment feature flags. See docs/feature-promotion.md.
 */

export type FeatureName = "cmsContent" | "siteAssistant";

const STORAGE_KEY = "balloads.feature-overrides";

const FEATURE_ALIASES: Record<string, FeatureName> = {
  cms: "cmsContent",
  cmscontent: "cmsContent",
  brutus: "siteAssistant",
  siteassistant: "siteAssistant",
};

const FEATURE_ENV_VARS: Record<FeatureName, string> = {
  cmsContent: "NEXT_PUBLIC_FEATURE_CMS_CONTENT",
  siteAssistant: "NEXT_PUBLIC_FEATURE_SITE_ASSISTANT",
};

const ALL_FEATURES = Object.keys(FEATURE_ENV_VARS) as FeatureName[];

export function resolveFlag(input: {
  stored?: boolean | null;
  env?: string | boolean | null;
  defaultEnabled: boolean;
}): boolean {
  if (typeof input.stored === "boolean") return input.stored;
  if (input.env === true || input.env === "true" || input.env === "1") return true;
  if (input.env === false || input.env === "false" || input.env === "0") return false;
  return input.defaultEnabled;
}

function seedOverridesFromUrl(): void {
  if (typeof window === "undefined") return;
  const raw = new URLSearchParams(window.location.search).get("features");
  if (!raw) return;
  const overrides = readOverrides();
  const requested = raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  for (const entry of requested) {
    if (entry === "all") for (const name of ALL_FEATURES) overrides[name] = true;
    else if (entry === "none") for (const name of ALL_FEATURES) overrides[name] = false;
    else {
      const name = FEATURE_ALIASES[entry];
      if (name) overrides[name] = true;
    }
  }
  writeOverrides(overrides);
}

function readOverrides(): Partial<Record<FeatureName, boolean>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object") return {};
    const overrides: Partial<Record<FeatureName, boolean>> = {};
    for (const name of ALL_FEATURES) {
      const value = (parsed as Record<string, unknown>)[name];
      if (typeof value === "boolean") overrides[name] = value;
    }
    return overrides;
  } catch {
    return {};
  }
}

function writeOverrides(overrides: Partial<Record<FeatureName, boolean>>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    /* ignore */
  }
}

seedOverridesFromUrl();

const overrides = readOverrides();
const defaultEnabled = process.env.NODE_ENV === "development";

export const featureFlags: Record<FeatureName, boolean> = Object.freeze(
  Object.fromEntries(
    ALL_FEATURES.map((name) => [
      name,
      resolveFlag({
        stored: overrides[name] ?? null,
        env: process.env[FEATURE_ENV_VARS[name]],
        defaultEnabled,
      }),
    ]),
  ) as Record<FeatureName, boolean>,
);

export function isFeatureEnabled(name: FeatureName): boolean {
  return featureFlags[name];
}
