export type LadderPlatform = "Sms" | "Email" | "WhatsApp" | "WhatsAppUtility";

export type LadderPlatformRate = {
  platform: LadderPlatform;
  amountPerMessage: number;
};

export type LadderBand = {
  thresholdStart: number;
  thresholdEnd: number;
  rates: LadderPlatformRate[];
};

function rateForPlatform(band: LadderBand, platform: LadderPlatform): number | null {
  const rate = band.rates.find((r) => r.platform === platform);
  if (rate) return rate.amountPerMessage;
  // WhatsApp session rates are sometimes only published under the
  // WhatsAppUtility platform key — fall back rather than reporting no rate.
  if (platform === "WhatsApp") {
    const utility = band.rates.find((r) => r.platform === "WhatsAppUtility");
    if (utility) return utility.amountPerMessage;
  }
  return null;
}

/** Finds the tier containing `messages` and returns that tier's rate for `platform`, or null if none matches. */
export function resolveRate(bands: LadderBand[], platform: LadderPlatform, messages: number): number | null {
  if (bands.length === 0) return null;
  const sorted = [...bands].sort((a, b) => a.thresholdStart - b.thresholdStart);
  const exact = sorted.find(
    (b) => messages >= b.thresholdStart && (b.thresholdEnd <= 0 || messages <= b.thresholdEnd),
  );
  if (exact) return rateForPlatform(exact, platform);

  // Message count falls in a gap between configured bands (or past the last
  // one) — use the nearest lower band's rate rather than showing "Contact us"
  // for a count the ladder clearly already covers around.
  const nearestBelow = [...sorted].reverse().find((b) => messages >= b.thresholdStart);
  const fallback = nearestBelow ?? sorted[0];
  return fallback ? rateForPlatform(fallback, platform) : null;
}

export function durationLabel(duration: number): string {
  return duration === 0 ? "No expiry" : `${duration} days`;
}
