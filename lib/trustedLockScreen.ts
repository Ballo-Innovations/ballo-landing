/**
 * Timing for the "Trusted by" lock screen (ADR 0018), kept free of React so it
 * can be unit tested.
 *
 * Two components share one clock: the runway of client logos in the section,
 * and the journey phone's lock screen. Every step a logo leaves the left edge
 * of the runway; RUNWAY_STEPS steps later it reaches the BalloAds mark, and on
 * that same step its notification lands on top of the phone's stack. Driving
 * both from a step counter, rather than two CSS loops started at different
 * moments, is what keeps the logo going in and the notification coming out
 * the same brand.
 *
 * Motion between steps is CSS: the runner's travel is one animation of
 * RUNWAY_STEPS * STEP_MS, and the stack slides by transition.
 */

export const STEP_MS = 2200;
/**
 * How many steps a logo takes to cross the runway, which is also how many
 * logos are on it at once. Small screens pass COMPACT_RUNWAY_STEPS: a
 * 200px runway cannot hold four logos without them overlapping.
 */
export const RUNWAY_STEPS = 4;
export const COMPACT_RUNWAY_STEPS = 2;
/** The least space between two of the widest logos on the runway. */
export const MIN_LOGO_GAP = 56;

/**
 * How many logos the runway carries at once, from its width. Each logo rides
 * in a box `slotWidth` wide (the logo itself is at most 24px narrower) from
 * just off the left edge until its centre reaches the mark, so consecutive
 * logos are `(runwayWidth + slotWidth / 2) / steps` apart. The most logos
 * that still leave MIN_LOGO_GAP between the two widest, between two and
 * RUNWAY_STEPS.
 */
export function runwayStepsFor(
  runwayWidth: number,
  slotWidth: number,
  minGap: number = MIN_LOGO_GAP,
): number {
  const widest = slotWidth - 24;
  const fits = Math.floor((runwayWidth + slotWidth / 2) / (widest + minGap));
  return Math.max(COMPACT_RUNWAY_STEPS, Math.min(RUNWAY_STEPS, fits));
}

/** Notifications kept on the lock screen. */
export const STACK_SIZE = 4;

export interface TickerState {
  step: number;
  /** Bumped on every start, so runners remount with fresh delays. */
  epoch: number;
  /** The step the current epoch started on. */
  epochStart: number;
  /**
   * When the current epoch started, on the page's clock
   * (`performance.now()`). Steps and every logo's position are worked out
   * from it, so a timer that fires late cannot bunch or space them.
   */
  epochT0: number;
}

/** When the logo launched on `launch` should set off, on the epoch's clock. */
export function launchTime(state: TickerState, launch: number, stepMs: number): number {
  return state.epochT0 + (launch - state.epochStart) * stepMs;
}

export interface Runner {
  key: string;
  launch: number;
  /**
   * Negative for a runner that was already on its way when the clock
   * (re)started, so it mounts part-way along instead of at the left edge.
   */
  delayMs: number;
}

export interface Note {
  key: string;
  launch: number;
  /** 0 is the newest; STACK_SIZE is the one fading out. */
  slot: number;
}

export function itemAt<T>(items: readonly T[], n: number): T | undefined {
  if (items.length === 0) return undefined;
  return items[((n % items.length) + items.length) % items.length];
}

export function runwayAt(
  { step, epoch, epochStart }: TickerState,
  runwaySteps: number = RUNWAY_STEPS,
): Runner[] {
  const runners: Runner[] = [];
  for (let launch = step - runwaySteps + 1; launch <= step; launch++) {
    runners.push({
      key: `${epoch}:${launch}`,
      launch,
      delayMs: launch <= epochStart ? (launch - epochStart) * STEP_MS : 0,
    });
  }
  return runners;
}

export function stackAt(step: number, runwaySteps: number = RUNWAY_STEPS): Note[] {
  const newest = step - runwaySteps;
  const notes: Note[] = [];
  for (let slot = 0; slot <= STACK_SIZE; slot++) {
    const launch = newest - slot;
    notes.push({ key: String(launch), launch, slot });
  }
  return notes;
}

/**
 * Clients minus anyone already shown as a backer.
 *
 * On the lock screen every client becomes a sender, so a backer left in the
 * client list (the CMS has carried Airtel, MTN, "MTN Zambia", Meta and ZICTA
 * in both) would show a mobile network or the regulator sending marketing
 * through BalloAds. A client matches a backer on the whole name or the name
 * followed by more words ("MTN Zambia"), never on a shared prefix.
 */
export function withoutBackers<T extends { alt: string }>(
  clients: readonly T[],
  backers: readonly { alt: string }[],
): T[] {
  const names = backers.map((b) => b.alt.trim().toLowerCase()).filter(Boolean);
  if (names.length === 0) return [...clients];
  return clients.filter((client) => {
    const name = client.alt.trim().toLowerCase();
    return !names.some((b) => name === b || name.startsWith(`${b} `));
  });
}

export type Channel = "sms" | "whatsapp" | "email";

/** Illustrative mix of channels: the clients take turns on SMS, WhatsApp and email. */
export function channelFor(brandIndex: number): Channel {
  const channels: Channel[] = ["sms", "whatsapp", "email"];
  return channels[((brandIndex % 3) + 3) % 3];
}

/**
 * Sample message text for a notification. It is shown blurred, the way a
 * phone hides previews on the lock screen, so it reads as a real message
 * without saying anything on a real client's behalf; the lines are neutral
 * anyway (receipts, reminders, opening hours), in case the blur is off.
 */
const PREVIEWS = [
  "Your statement for this month is ready to view in the app.",
  "We are open this Saturday from 08:00 to 13:00. See you then.",
  "Reply YES to confirm your booking for tomorrow at 10:30.",
  "Thank you for your payment. Your receipt is attached.",
  "New stock arrived today. Visit us before the weekend.",
  "Your order is on its way and should arrive tomorrow.",
  "Reminder: your appointment is on Friday at 14:00.",
];

export function previewFor(launch: number): string {
  return PREVIEWS[((launch % PREVIEWS.length) + PREVIEWS.length) % PREVIEWS.length];
}

const LUSAKA = "Africa/Lusaka";
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: LUSAKA,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: LUSAKA,
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** The lock screen's clock: the time and date in Lusaka, whatever the visitor's zone. */
export function lockScreenClock(now: Date): { time: string; date: string } {
  return { time: timeFormat.format(now), date: dateFormat.format(now).replace(",", "") };
}

export interface Ticker {
  getState: () => TickerState;
  subscribe: (listener: () => void) => () => void;
  start: () => void;
  stop: () => void;
}

const pageClock = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

export function createTicker(
  stepMs: number,
  initialStep: number,
  now: () => number = pageClock,
): Ticker {
  let state: TickerState = {
    step: initialStep,
    epoch: 0,
    epochStart: initialStep,
    epochT0: now(),
  };
  let timer: ReturnType<typeof setTimeout> | null = null;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  // Each wake-up works out the step from the time since the epoch began and
  // aims the next one at the next whole step. A late timer (a busy page, a
  // tab coming back) therefore catches up instead of pushing every later
  // step back, and never fires two steps close together.
  const wake = () => {
    const due = state.epochStart + Math.floor((now() - state.epochT0) / stepMs);
    if (due !== state.step) {
      state = { ...state, step: due };
      emit();
    }
    const next = state.epochT0 + (due - state.epochStart + 1) * stepMs;
    timer = setTimeout(wake, Math.max(0, next - now()));
  };

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    start() {
      if (timer) return;
      state = { ...state, epoch: state.epoch + 1, epochStart: state.step, epochT0: now() };
      emit();
      timer = setTimeout(wake, stepMs);
    },
    stop() {
      if (!timer) return;
      clearTimeout(timer);
      timer = null;
    },
  };
}

/**
 * The page's one clock. Starts with a full stack, so the phone never arrives
 * on an empty lock screen.
 */
export const trustedTicker = createTicker(STEP_MS, RUNWAY_STEPS + STACK_SIZE);
