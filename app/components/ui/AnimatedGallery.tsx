"use client";

import * as React from "react";
import NextImage from "next/image";
import {
  HTMLMotionProps,
  MotionValue,
  Variants,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * 3D scroll gallery.
 *
 * Ported from "Animated Gallery" by @youcefbnm on 21st.dev
 * (https://21st.dev/@youcefbnm/components/animated-gallery).
 *
 * Deviations from the published source, all deliberate:
 *
 * 1. Imports resolve to `framer-motion`, not `motion/react`. This project
 *    already ships framer-motion 12, which exposes the identical API; adding
 *    the `motion` package would put two copies of the same animation runtime
 *    in the bundle for no behavioural gain.
 *
 * 2. Everything degrades under `prefers-reduced-motion`. The upstream source
 *    has no reduced-motion path: the grid rotates 75deg on the X axis, scales,
 *    and parallaxes its columns regardless of the setting. A 75deg scroll-linked
 *    3D rotation is exactly the kind of motion that setting exists to suppress.
 *    Reduced renders the RESTING state (flat, unscaled, no column drift) rather
 *    than freezing at the tilted opening frame.
 *
 * 3. `GalleryImage` wraps `next/image` instead of a raw <img>. The gallery
 *    holds twelve source files, several of them multi-megabyte PNGs; shipping
 *    those unresized would dwarf everything else on the page.
 */

interface ContainerScrollContextValue {
  scrollYProgress: MotionValue<number>;
  reduced: boolean;
}

const SPRING_CONFIG = {
  type: "spring" as const,
  stiffness: 100,
  damping: 16,
  mass: 0.75,
  restDelta: 0.005,
};

const blurVariants: Variants = {
  hidden: { filter: "blur(10px)", opacity: 0 },
  visible: { filter: "blur(0px)", opacity: 1 },
};

/** Reduced-motion counterpart: same end state, reached without the blur ramp. */
const staticVariants: Variants = {
  hidden: { filter: "blur(0px)", opacity: 1 },
  visible: { filter: "blur(0px)", opacity: 1 },
};

const ContainerScrollContext = React.createContext<
  ContainerScrollContextValue | undefined
>(undefined);

function useContainerScrollContext() {
  const context = React.useContext(ContainerScrollContext);
  if (!context) {
    throw new Error(
      "useContainerScrollContext must be used within a ContainerScroll component"
    );
  }
  return context;
}

export const ContainerScroll = ({
  children,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef });
  // `useReducedMotion` is null until it has read the media query, so the first
  // paint must assume motion is allowed — treating null as "reduced" would
  // flash the flat state at every visitor.
  const reduced = useReducedMotion() === true;

  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress, reduced }}>
      <div
        ref={scrollRef}
        className={cn("relative min-h-[120vh]", className)}
        style={{
          perspective: "1000px",
          perspectiveOrigin: "center top",
          transformStyle: "preserve-3d",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    </ContainerScrollContext.Provider>
  );
};
ContainerScroll.displayName = "ContainerScroll";

export const ContainerSticky = ({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "sticky left-0 top-0 min-h-[30rem] w-full overflow-hidden",
      className
    )}
    style={{
      perspective: "1000px",
      perspectiveOrigin: "center top",
      transformStyle: "preserve-3d",
      transformOrigin: "50% 50%",
      ...style,
    }}
    {...props}
  />
);
ContainerSticky.displayName = "ContainerSticky";

export const GalleryContainer = ({
  children,
  className,
  style,
  zoomTarget,
  zoomRange = [0.78, 1],
  ...props
}: HTMLMotionProps<"div"> & {
  /**
   * A tile inside the grid that should fill the viewport at the end of the
   * scroll. The whole grid scales up about that tile's centre, so the tile
   * grows into full screen while its neighbours scale out past the edges.
   */
  zoomTarget?: React.RefObject<HTMLElement | null>;
  /** Progress window over which the zoom runs. */
  zoomRange?: [number, number];
}) => {
  const { scrollYProgress, reduced } = useContainerScrollContext();
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [75, 0]);
  const baseScale = useTransform(scrollYProgress, [0.5, 0.9], [1.2, 1]);

  const gridRef = React.useRef<HTMLDivElement>(null);
  // Origin is a percentage of the grid box, scale is how much magnification the
  // target tile needs to cover the viewport. Both are measured, not hardcoded,
  // because the tile's slot depends on the column offsets and the breakpoint.
  const [zoom, setZoom] = React.useState({ x: 50, y: 50, scale: 1 });

  React.useLayoutEffect(() => {
    const tile = zoomTarget?.current;
    const grid = gridRef.current;
    if (!tile || !grid) return;

    const measure = () => {
      // offsetLeft/offsetTop/offsetWidth deliberately, NOT
      // getBoundingClientRect: this runs while the grid is still rotated 75deg
      // and scaled 1.2, and a client rect would report those transformed,
      // distorted bounds. The offset* family reports untransformed layout.
      const col = tile.offsetParent as HTMLElement | null;
      if (!col) return;
      const cx = col.offsetLeft + tile.offsetLeft + tile.offsetWidth / 2;
      const cy = col.offsetTop + tile.offsetTop + tile.offsetHeight / 2;
      if (!grid.offsetWidth || !grid.offsetHeight || !tile.offsetWidth) return;
      setZoom({
        x: (cx / grid.offsetWidth) * 100,
        y: (cy / grid.offsetHeight) * 100,
        // `max` so the tile covers rather than letterboxes, times a small
        // overscan. Without it the fit is EXACT — a 16:9 tile at a third of a
        // 1440x900 viewport lands on 900.0px tall — and sub-pixel rounding plus
        // the 8px grid gap leave hairline slivers of the neighbouring tiles
        // showing along the edges at full zoom.
        scale:
          Math.max(
            window.innerWidth / tile.offsetWidth,
            window.innerHeight / tile.offsetHeight
          ) * 1.08,
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [zoomTarget]);

  const zoomScale = useTransform(scrollYProgress, zoomRange, [1, zoom.scale], {
    clamp: true,
  });

  return (
    // Two layers, because an element has only ONE transform-origin and the two
    // moves need different ones: the opening tilt pivots about the grid's centre
    // (50% 50%), while the zoom has to pivot about the target tile. Combining
    // them on one element would drag the tilt's pivot off-centre and skew the
    // whole opening animation.
    <motion.div
      className="size-full"
      style={
        reduced
          ? undefined
          : {
              scale: zoomScale,
              transformOrigin: `${zoom.x}% ${zoom.y}%`,
              // These three are NOT decoration — they keep the tilt looking
              // right. `perspective` applies to an element's CHILDREN, so the
              // foreshortening on the grid's rotateX comes from its PARENT. In
              // the upstream component that parent is ContainerSticky. This
              // wrapper was inserted between the two, and without preserve-3d it
              // flattened the 3D context, so rotateX(75deg) rendered
              // orthographically: a hard vertical squash with no depth, which
              // reads as the tiles being far too steeply tilted. Restating the
              // perspective, its origin, and preserve-3d hands the grid the same
              // 3D context it had before the wrapper existed.
              perspective: "1000px",
              perspectiveOrigin: "center top",
              transformStyle: "preserve-3d",
            }
      }
    >
      <motion.div
        ref={gridRef}
        className={cn(
          "relative grid size-full grid-cols-3 gap-2 rounded-2xl",
          className
        )}
        style={
          reduced
            ? { transformStyle: "preserve-3d", perspective: "1000px", ...style }
            : {
                rotateX,
                scale: baseScale,
                transformOrigin: "50% 50%",
                transformStyle: "preserve-3d",
                perspective: "1000px",
                ...style,
              }
        }
        {...props}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
GalleryContainer.displayName = "GalleryContainer";

export const GalleryCol = ({
  className,
  style,
  yRange = ["0%", "-10%"],
  ...props
}: HTMLMotionProps<"div"> & { yRange?: string[] }) => {
  const { scrollYProgress, reduced } = useContainerScrollContext();
  const y = useTransform(scrollYProgress, [0.5, 1], yRange);

  return (
    <motion.div
      className={cn("relative flex w-full flex-col gap-2", className)}
      style={reduced ? style : { y, ...style }}
      {...props}
    />
  );
};
GalleryCol.displayName = "GalleryCol";

export const ContainerStagger = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, viewport, transition, ...props }, ref) => (
  <motion.div
    className={cn("relative", className)}
    ref={ref}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, ...viewport }}
    transition={{
      staggerChildren: transition?.staggerChildren ?? 0.2,
      ...transition,
    }}
    {...props}
  />
));
ContainerStagger.displayName = "ContainerStagger";

export const ContainerAnimated = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, transition, ...props }, ref) => {
  // Reads the media query directly rather than the scroll context: the header
  // block that uses this sits ABOVE <ContainerScroll>, outside the provider,
  // so a context read here would throw.
  const reduced = useReducedMotion() === true;

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      variants={reduced ? staticVariants : blurVariants}
      // Upstream writes `SPRING_CONFIG || transition`, which always picks the
      // constant and silently discards any caller override. Merge instead.
      transition={reduced ? { duration: 0 } : { ...SPRING_CONFIG, ...transition }}
      {...props}
    />
  );
});
ContainerAnimated.displayName = "ContainerAnimated";

/**
 * One gallery tile.
 *
 * `next/image` rather than the raw <img> the upstream demo uses: the demo
 * pulls pre-sized remote JPEGs from Unsplash, while this gallery points at
 * local source art that runs to several megabytes per file. `fill` inside an
 * aspect-video box keeps the grid geometry identical to upstream while letting
 * Next resize and re-encode.
 */
export const GalleryImage = ({
  src,
  alt,
  priority = false,
  innerRef,
  sizes = "33vw",
}: {
  src: import("next/image").StaticImageData | string;
  alt: string;
  priority?: boolean;
  /** Set on the tile that GalleryContainer should zoom into. */
  innerRef?: React.Ref<HTMLDivElement>;
  /**
   * Defaults to a third of the viewport, which is what a tile occupies in the
   * three-column grid. The ZOOM TARGET must override this to "100vw": it ends
   * up magnified to fill the screen, and a third-width source would visibly
   * upscale at that point.
   */
  sizes?: string;
}) => (
  <div
    ref={innerRef}
    // shrink-0 is load-bearing, not decoration. Tiles are flex children of a
    // column that stretches to the sticky container's full height, and four
    // 16:9 tiles need more height than one viewport gives them (~1092px against
    // 900px at desktop). With the default flex-shrink: 1 the browser resolves
    // that by squashing each tile BELOW its aspect ratio — aspect-video loses to
    // flex sizing — and object-cover then crops the art hard, which reads as
    // stretched images. Locking shrink lets the column overflow instead; the
    // sticky parent clips it and justify-center keeps the overflow even.
    className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md shadow"
  >
    <NextImage
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className="object-cover"
      priority={priority}
      loading={priority ? undefined : "lazy"}
    />
  </div>
);
GalleryImage.displayName = "GalleryImage";
