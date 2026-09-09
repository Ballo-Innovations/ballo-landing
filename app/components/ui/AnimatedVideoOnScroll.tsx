"use client";

import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
  type Variants,
} from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * The 21st.dev "animated video on scroll" primitives.
 *
 * A scroll track publishes its own progress through context; the pieces inside
 * a `ContainerSticky` read that progress and place themselves against it. The
 * shape of the effect is not in here — it is in the ranges a caller passes, so
 * the same three components run the transform forwards (a pill of video
 * opening out to full bleed) or backwards. Nothing on this page runs it
 * backwards any more: the hero hands over to the phone by leaving sideways
 * rather than by closing down.
 *
 * Two deliberate departures from upstream:
 *
 *   - `framer-motion`, not `motion/react`. Same library, same API; this is the
 *     package the project already has, so the effect adds no dependency.
 *   - `ContainerInset` leaves pointer events alone. Upstream turns them off
 *     because it only ever wraps a video. Ours wraps a hero with a nav, links
 *     and two CTAs, and `pointer-events: none` on the wrapper would make all
 *     of them dead at rest.
 *
 * `HeroVideo` IS ported (see below), with the playback guards upstream leaves
 * out. `HeroButton` is not: it is a lime pill with a hardcoded `#84cc16` glow,
 * and this project has `ShinyButton` in its own palette.
 */

interface ContainerScrollContextValue {
  scrollYProgress: MotionValue<number>;
}

const ContainerScrollContext = React.createContext<
  ContainerScrollContextValue | undefined
>(undefined);

/**
 * The track's progress, or undefined outside one.
 *
 * For things that are rendered into the pinned stage but must also survive
 * being rendered outside it — the marquee band is passed in as a prop and, on
 * the reduced-motion path, ends up in plain flow with no track above it.
 */
export function useOptionalContainerScrollContext() {
  return React.useContext(ContainerScrollContext);
}

export function useContainerScrollContext() {
  const context = React.useContext(ContainerScrollContext);
  if (!context) {
    throw new Error(
      "useContainerScrollContext must be used within a ContainerScroll Component",
    );
  }
  return context;
}

const SPRING_TRANSITION_CONFIG = {
  type: "spring" as const,
  stiffness: 100,
  damping: 16,
  mass: 0.75,
  restDelta: 0.005,
};

const variants: Variants = {
  hidden: { filter: "blur(10px)", opacity: 0 },
  visible: { filter: "blur(0px)", opacity: 1 },
};

/** Framer's own offset type, so a caller gets its literal union completed. */
type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

export const ContainerScroll: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    /** Passed straight to `useScroll`. See the note below on the default. */
    offset?: ScrollOffset;
  }
> = ({ children, className, offset = ["start start", "end end"], ...props }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    // Upstream defaults to ["start center", "end end"] — "start when the top of
    // the track reaches the middle of the screen". For a track that begins at
    // the top of the document that moment is already in the past on load, so
    // the page would open with the effect part-run. Ours starts at
    // ["start start", "end end"] and callers can still override.
    offset,
  });

  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress }}>
      <div
        ref={scrollRef}
        className={cn("relative min-h-svh w-full", className)}
        {...props}
      >
        {children}
      </div>
    </ContainerScrollContext.Provider>
  );
};
ContainerScroll.displayName = "ContainerScroll";

interface ContainerAnimatedProps extends HTMLMotionProps<"div"> {
  inputRange?: number[];
  outputRange?: number[];
}

export const ContainerAnimated = React.forwardRef<
  HTMLDivElement,
  ContainerAnimatedProps
>(
  (
    {
      className,
      transition,
      style,
      inputRange = [0.2, 0.8],
      outputRange = [80, 0],
      ...props
    },
    ref,
  ) => {
    const { scrollYProgress } = useContainerScrollContext();
    const y = useTransform(scrollYProgress, inputRange, outputRange);
    return (
      <motion.div
        ref={ref}
        className={className}
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        style={{ y, ...style }}
        transition={{ ...SPRING_TRANSITION_CONFIG, ...transition }}
        {...props}
      />
    );
  },
);
ContainerAnimated.displayName = "ContainerAnimated";

export const ContainerSticky = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("sticky left-0 top-0 min-h-svh w-full", className)}
      {...props}
    />
  );
});
ContainerSticky.displayName = "ContainerSticky";

interface ContainerInsetProps extends HTMLMotionProps<"div"> {
  insetYRange?: [number, number];
  insetXRange?: [number, number];
  roundednessRange?: [number, number];
  /** Progress at which the inset finishes. Upstream hardcodes 0.8. */
  closeAt?: number;
}

/**
 * The window the content is seen through: a `clip-path: inset(...)` driven by
 * scroll. Every number is a caller's to choose, which is what lets the same
 * component open out or close down.
 */
export const ContainerInset = React.forwardRef<
  HTMLDivElement,
  ContainerInsetProps
>(
  (
    {
      className,
      style,
      insetYRange = [45, 0],
      insetXRange = [45, 0],
      roundednessRange = [1000, 16],
      closeAt = 0.8,
      transition,
      ...props
    },
    ref,
  ) => {
    const { scrollYProgress } = useContainerScrollContext();

    const insetY = useTransform(scrollYProgress, [0, closeAt], insetYRange);
    const insetX = useTransform(scrollYProgress, [0, closeAt], insetXRange);
    const roundedness = useTransform(scrollYProgress, [0, closeAt], roundednessRange);

    const clipPath =
      useMotionTemplate`inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${roundedness}px)`;

    return (
      <motion.div
        ref={ref}
        className={cn("overflow-hidden", className)}
        style={{ clipPath, ...style }}
        {...props}
      />
    );
  },
);
ContainerInset.displayName = "ContainerInset";

/**
 * The video inside a `ContainerInset`, scaling up as the inset opens.
 *
 * The scroll-driven `scale` is upstream's, unchanged. What is added is the
 * handling upstream has no need for on a demo page and this page cannot do
 * without, because this is one section of a long marketing route rather than
 * the whole document:
 *
 *   - `preload="none"` and a `poster`. Upstream sets neither, so the browser
 *     fetches the video on load — for a section most visitors have not
 *     scrolled to yet. Nothing is fetched here until playback is asked for.
 *   - Playback follows visibility. Upstream's `autoPlay` runs the decoder for
 *     the life of the page; this plays on approach and pauses on leaving, so
 *     a video that is not on screen costs nothing.
 *   - It does not autoplay under `prefers-reduced-motion`, where the poster
 *     stands in. A looping clip is exactly the kind of motion that preference
 *     is about.
 *
 * `autoPlay` is deliberately NOT set as an attribute — `play()` is called
 * instead, once the element is actually near the viewport.
 */
export const HeroVideo = React.forwardRef<
  HTMLVideoElement,
  HTMLMotionProps<"video">
>(({ style, className, transition, ...props }, ref) => {
  const { scrollYProgress } = useContainerScrollContext();
  const scale = useTransform(scrollYProgress, [0, 0.8], [0.7, 1]);
  const localRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    const el = localRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Autoplay can be refused (a data-saver mode, a platform policy).
          // The poster is already showing, so a rejection needs no handling
          // beyond not throwing.
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      // Enough margin to have decoded a frame or two before it is on screen.
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.video
      ref={(node) => {
        localRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn("relative z-10 size-auto max-h-full max-w-full", className)}
      muted
      loop
      playsInline
      preload="none"
      style={{ scale, ...style }}
      {...props}
    />
  );
});
HeroVideo.displayName = "HeroVideo";
