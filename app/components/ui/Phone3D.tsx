"use client";

import { useRef, useEffect } from "react";

interface Props {
  children: React.ReactNode;
  floating?: React.ReactNode;
  /**
   * Pointer tilt. Turning this off does not freeze the phone mid-lean: the loop
   * keeps running and eases it back to flat, then stops.
   *
   * The hero uses that to have both things at once. It wants the same hover
   * tilt this phone has in "What We're About", but its zoom-out lands on the
   * Next button's measured rect, and `getBoundingClientRect` on a rotated
   * element reports an axis-aligned bounding box rather than the button's real
   * corners. So the hero leaves the tilt on while the phone is arriving and
   * switches it off partway through the close, and the phone is flat — and the
   * rect exact — well before the card arrives.
   */
  interactive?: boolean;
}

export function Phone3D({ children, floating, interactive = true }: Props) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const interactiveRef = useRef(interactive);
  const flattenRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const tiltEl = tiltRef.current;
    const phoneEl = phoneRef.current;
    if (!tiltEl || !phoneEl) return;

    // Pointer tilt is a hover affordance — skip the whole rig on touch devices,
    // where it can never fire but the rAF loop would still run.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const IDLE_DELAY = 1500;
    const MAX_TILT = 25;
    // Below this, the remaining lerp distance is far under one screen pixel of
    // rotation, so the loop can stop instead of easing toward zero forever.
    const REST_EPSILON = 0.01;

    let targetRx = 0, targetRy = 0;
    let rx = 0, ry = 0;
    let isTracking = false;
    let lastMoveTime = 0;
    let rafId: number | null = null;
    let isVisible = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      rafId = null;

      if (isTracking && performance.now() - lastMoveTime > IDLE_DELAY) {
        isTracking = false;
        targetRx = 0;
        targetRy = 0;
      }

      // A forced flatten is a deadline, not a drift: the hero switches the tilt
      // off because it is about to land on this phone, so ease back at tracking
      // speed rather than the leisurely idle rate.
      const lerpFactor = isTracking ? 0.08 : interactiveRef.current ? 0.015 : 0.08;
      rx = lerp(rx, targetRx, lerpFactor);
      ry = lerp(ry, targetRy, lerpFactor);

      const atRest =
        !isTracking &&
        Math.abs(rx - targetRx) < REST_EPSILON &&
        Math.abs(ry - targetRy) < REST_EPSILON;

      if (atRest) {
        // Snap exactly onto the target and drop the compositing hint, so an
        // untouched phone costs nothing at all.
        rx = targetRx;
        ry = targetRy;
        tiltEl.style.willChange = "";
      }

      tiltEl.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;

      // The old loop re-queued itself unconditionally while visible, so it ran
      // at 60fps for the life of the page even with the phone sitting still.
      if (isVisible && !atRest) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const wake = () => {
      if (rafId === null && isVisible) {
        tiltEl.style.willChange = "transform";
        rafId = requestAnimationFrame(tick);
      }
    };

    // Lets the effect below flatten the phone without tearing the loop down.
    flattenRef.current = () => {
      isTracking = false;
      targetRx = 0;
      targetRy = 0;
      wake();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) wake();
      },
      { rootMargin: "300px" }
    );
    observer.observe(phoneEl);

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactiveRef.current) return;
      if (!isVisible) return;
      isTracking = true;
      lastMoveTime = performance.now();
      const rect = phoneEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const maxDist = Math.min(window.innerWidth, window.innerHeight) * 0.45;
      targetRy = Math.max(-MAX_TILT, Math.min(MAX_TILT, (dx / maxDist) * MAX_TILT));
      targetRx = Math.max(-MAX_TILT, Math.min(MAX_TILT, -(dy / maxDist) * MAX_TILT));
      wake();
    };

    const handleMouseLeave = () => {
      isTracking = false;
      targetRx = 0;
      targetRy = 0;
      wake();
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      flattenRef.current = null;
    };
  }, []);

  // Kept out of the effect above on purpose: rebuilding the whole rig on every
  // toggle would drop the phone's current lean and restart it from flat.
  useEffect(() => {
    interactiveRef.current = interactive;
    if (!interactive) flattenRef.current?.();
  }, [interactive]);

  return (
    <div className="phone3d-scene scale-110">
      <div
        ref={tiltRef}
        style={{ position: "relative", transformStyle: "preserve-3d" }}
      >
        <div ref={phoneRef} className="phone3d">
          <div className="phone3d-back" />
          <div className="phone3d-edge phone3d-edge-r" />
          <div className="phone3d-edge phone3d-edge-l" />
          <div className="phone3d-edge phone3d-edge-t" />
          <div className="phone3d-edge phone3d-edge-b" />

          {(["tl", "tr", "bl", "br"] as const).map((pos) => (
            <div key={pos} className={`phone3d-corner phone3d-corner-${pos}`}>
              {Array.from({ length: 16 }, (_, i) => (
                <div
                  key={i}
                  className="phone3d-clayer"
                  style={{ transform: `translateZ(-${i + 1}px)` }}
                />
              ))}
            </div>
          ))}

          {/* Side buttons, visible head-on as nubs at the rail — the layout in
              phone-frame.png: action + volume up/down on the left, power on the
              right. Positioned in % so they hold at the mobile size. */}
          <span className="phone3d-side-btn phone3d-side-btn--action" />
          <span className="phone3d-side-btn phone3d-side-btn--volup" />
          <span className="phone3d-side-btn phone3d-side-btn--voldown" />
          <span className="phone3d-side-btn phone3d-side-btn--power" />

          <div className="phone3d-bezel">
            <div className="phone3d-inner-shell">
              <div className="phone3d-screen">
                {children}
                {/* Dynamic-island cutout with the front camera at its right
                    end, replacing the single round dot this used to have. */}
                <div className="phone3d-island" aria-hidden="true">
                  <span className="phone3d-lens" />
                </div>
                <div className="phone3d-home-bar" />
              </div>
            </div>
          </div>
        </div>

        {floating}
      </div>
    </div>
  );
}
