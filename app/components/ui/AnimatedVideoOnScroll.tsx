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
 * opening out to full bleed) or backwards (see HeroZoomOut, which closes the
 * hero down to a small rounded card).
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
 * Upstream's `HeroVideo` and `HeroButton` are not ported: one is a <video>, the
 * other a lime pill with a hardcoded glow, and neither has anything to do with
 * this hero. The scale `HeroVideo` applied to the video lives in HeroZoomOut
 * instead, on the hero's own content.
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
