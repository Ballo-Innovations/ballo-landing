"use client";

import * as React from "react";
import { useMotionValueEvent } from "framer-motion";

import { useContainerScrollContext } from "./AnimatedVideoOnScroll";
import { TEXT_SWAP, WHY_OUT } from "./HeroSideExit";
import {
  easePull,
  silkPixelRatio,
  silkStrength,
  SILK_FRAGMENT,
  SILK_PEAK_OPACITY,
  SILK_VERTEX,
  SILK_VISIBLE_MIN,
} from "@/lib/whySilk";

type GLState = {
  gl: WebGLRenderingContext;
  uRes: WebGLUniformLocation | null;
  uTime: WebGLUniformLocation | null;
  uMouse: WebGLUniformLocation | null;
  uPull: WebGLUniformLocation | null;
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
}

function setUp(canvas: HTMLCanvasElement): GLState | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, SILK_VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, SILK_FRAGMENT);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  // One triangle that covers the viewport.
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  return {
    gl,
    uRes: gl.getUniformLocation(prog, "uRes"),
    uTime: gl.getUniformLocation(prog, "uTime"),
    uMouse: gl.getUniformLocation(prog, "uMouse"),
    uPull: gl.getUniformLocation(prog, "uPull"),
  };
}

/**
 * A flowing silk behind the phone while "Why Choose" is on the stage (ADR
 * 0019). Lives in `HeroSideExit`'s `glow` slot, so it sits above the band and
 * behind the device. Opacity follows the pin; the shader only runs while the
 * layer can be seen, the tab is visible and WebGL is available. With none of
 * that it renders nothing and the stage looks as it did before.
 */
export function WhySilk() {
  const { scrollYProgress } = useContainerScrollContext();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const st = React.useRef({
    gl: null as GLState | null,
    failed: false,
    raf: 0,
    strength: 0,
    pull: 0,
    pointerIn: false,
    mouse: [-1e4, -1e4] as [number, number],
    ratio: 0.6,
    last: 0,
    t0: 0,
  });

  const resize = React.useCallback(() => {
    const c = canvasRef.current;
    const s = st.current;
    if (!c) return;
    const w = c.clientWidth;
    const h = c.clientHeight;
    s.ratio = silkPixelRatio(window.devicePixelRatio, w);
    c.width = Math.max(1, Math.round(w * s.ratio));
    c.height = Math.max(1, Math.round(h * s.ratio));
    s.gl?.gl.viewport(0, 0, c.width, c.height);
  }, []);

  const frame = React.useCallback((now: number) => {
    const s = st.current;
    const c = canvasRef.current;
    if (!s.gl || !c || s.strength < SILK_VISIBLE_MIN || document.hidden) {
      s.raf = 0;
      return;
    }
    const dt = s.last ? now - s.last : 16;
    s.last = now;
    s.pull = easePull(s.pull, s.pointerIn ? 1 : 0, dt);
    const { gl, uRes, uTime, uMouse, uPull } = s.gl;
    gl.uniform2f(uRes, c.width, c.height);
    gl.uniform1f(uTime, (now - s.t0) / 1000 + 9);
    gl.uniform2f(uMouse, s.mouse[0] * s.ratio, c.height - s.mouse[1] * s.ratio);
    gl.uniform1f(uPull, s.pull);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    s.raf = requestAnimationFrame(frame);
  }, []);

  const kick = React.useCallback(() => {
    const s = st.current;
    if (s.raf || s.failed || s.strength < SILK_VISIBLE_MIN || document.hidden) return;
    if (!s.gl && canvasRef.current) {
      s.gl = setUp(canvasRef.current);
      if (!s.gl) {
        s.failed = true;
        return;
      }
      s.t0 = performance.now();
      resize();
    }
    s.last = 0;
    s.raf = requestAnimationFrame(frame);
  }, [frame, resize]);

  const place = React.useCallback(
    (p: number) => {
      const s = st.current;
      s.strength = silkStrength(p, TEXT_SWAP, WHY_OUT);
      const el = wrapRef.current;
      if (el) {
        // Written to the DOM by hand, not as a motion value: see the halo in
        // HeroSideExit for why a scroll-linked opacity misbehaves here.
        el.style.opacity = s.failed ? "0" : (s.strength * SILK_PEAK_OPACITY).toFixed(3);
        el.style.visibility = s.strength < SILK_VISIBLE_MIN ? "hidden" : "visible";
      }
      kick();
    },
    [kick],
  );
  useMotionValueEvent(scrollYProgress, "change", place);

  React.useEffect(() => {
    const s = st.current;
    const c = canvasRef.current;
    place(scrollYProgress.get());

    const ro = new ResizeObserver(resize);
    if (c) ro.observe(c);

    // The cursor's swirl. Fine pointers only: on touch a "pointer" is a
    // finger mid-scroll, and the fabric twisting under it reads as lag.
    const fine = window.matchMedia("(pointer: fine)");
    const onMove = (e: PointerEvent) => {
      if (!fine.matches || !c) return;
      const r = c.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      s.mouse = [x, y];
      s.pointerIn = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
    };
    const onLeave = () => {
      s.pointerIn = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    const onVisibility = () => kick();
    document.addEventListener("visibilitychange", onVisibility);

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.gl = null;
    };
    const onRestored = () => kick();
    c?.addEventListener("webglcontextlost", onLost);
    c?.addEventListener("webglcontextrestored", onRestored);

    return () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      c?.removeEventListener("webglcontextlost", onLost);
      c?.removeEventListener("webglcontextrestored", onRestored);
      s.gl?.gl.getExtension("WEBGL_lose_context")?.loseContext();
      s.gl = null;
    };
  }, [kick, place, resize, scrollYProgress]);

  return (
    <div ref={wrapRef} className="why-silk" aria-hidden="true">
      <canvas ref={canvasRef} className="why-silk__canvas" />
    </div>
  );
}
