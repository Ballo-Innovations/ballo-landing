"use client";

// Liquid-glass lab: a self-contained stage (canvas background + WebGL pill)
// for locking the look/feel of the effect inside this project before wiring
// it onto the nav. Mirrors the reference app's Image-2 preset (grid + badge).

import React, { useEffect, useRef, useState } from "react";
import { LiquidGlass } from "@/app/components/ui/LiquidGlass";

export default function GlassLabPage() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [distortion, setDistortion] = useState(0.32);
  const [dispersion, setDispersion] = useState(0.016);
  const [fresnel, setFresnel] = useState(1.45);
  const [highlight, setHighlight] = useState(1.1);
  const [blur, setBlur] = useState(1);
  const [pillText, setPillText] = useState("Liquid Glass Kit");

  // Draw the sampled scene into the background canvas every frame.
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const renderScene = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Crisp purple backdrop
      ctx.fillStyle = "#cdc8e2";
      ctx.fillRect(0, 0, w, h);

      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.6);
      bgGrad.addColorStop(0, "rgba(235, 230, 250, 0.6)");
      bgGrad.addColorStop(1, "rgba(185, 178, 210, 0.4)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Precision grid (refracted under the glass)
      ctx.strokeStyle = "rgba(110, 100, 150, 0.28)";
      ctx.lineWidth = 1.5;
      const gridSize = 90;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Crimson "12" badge — glass refracts its red caustics
      const badgeX = w * 0.68;
      const badgeY = h * 0.3;
      const badgeRadius = 36;
      const badgeGrad = ctx.createRadialGradient(
        badgeX - 10,
        badgeY - 10,
        5,
        badgeX,
        badgeY,
        badgeRadius
      );
      badgeGrad.addColorStop(0, "#ff4d6d");
      badgeGrad.addColorStop(0.7, "#e60039");
      badgeGrad.addColorStop(1, "#a30029");
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
      ctx.fillStyle = badgeGrad;
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("12", badgeX, badgeY);

      animId = requestAnimationFrame(renderScene);
    };
    renderScene();
    return () => cancelAnimationFrame(animId);
  }, []);

  const sliders: {
    label: string;
    value: number;
    set: (n: number) => void;
    min: number;
    max: number;
    step: number;
  }[] = [
    { label: "Refraction (distortion)", value: distortion, set: setDistortion, min: 0, max: 0.6, step: 0.01 },
    { label: "Chromatic dispersion", value: dispersion, set: setDispersion, min: 0, max: 0.04, step: 0.001 },
    { label: "Fresnel edge glow", value: fresnel, set: setFresnel, min: 0, max: 3, step: 0.05 },
    { label: "Specular highlight", value: highlight, set: setHighlight, min: 0, max: 2.5, step: 0.1 },
    { label: "Backdrop blur (px)", value: blur, set: setBlur, min: 0, max: 8, step: 0.5 },
  ];

  return (
    <main className="grid min-h-screen grid-cols-1 bg-slate-950 text-slate-100 lg:grid-cols-12">
      {/* Stage */}
      <div
        ref={stageRef}
        className="relative flex min-h-[560px] items-center justify-center overflow-hidden p-6 lg:col-span-8"
      >
        <canvas
          ref={bgCanvasRef}
          width={1200}
          height={700}
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />

        <div className="absolute left-6 top-6 z-20 rounded-full border border-white/60 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-slate-800 shadow-lg">
          Drag the pill across the grid + badge to see live refraction
        </div>

        <div className="relative z-10 flex h-[360px] w-full max-w-xl items-center justify-center">
          <LiquidGlass
            shape="pill"
            distortion={distortion}
            dispersion={dispersion}
            fresnel={fresnel}
            highlight={highlight}
            blur={blur}
            draggable
            stageRef={stageRef}
            bgCanvasRef={bgCanvasRef}
            className="h-[106px] w-[420px]"
          >
            <span className="text-4xl font-medium tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
              {pillText}
            </span>
          </LiquidGlass>
        </div>
      </div>

      {/* Tuner */}
      <aside className="flex flex-col gap-6 border-t border-slate-800 bg-slate-900/90 p-6 lg:col-span-4 lg:border-l lg:border-t-0">
        <h1 className="text-sm font-bold uppercase tracking-wider text-slate-200">
          Liquid Glass — tuner
        </h1>

        <label className="space-y-2 text-xs font-semibold text-slate-300">
          Pill label
          <input
            type="text"
            value={pillText}
            onChange={(e) => setPillText(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
        </label>

        {sliders.map((s) => (
          <div key={s.label} className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-200">{s.label}</span>
              <span className="font-mono font-bold text-indigo-400">{s.value.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={s.value}
              onChange={(e) => s.set(Number(e.target.value))}
              className="w-full cursor-pointer accent-indigo-500"
            />
          </div>
        ))}

        <p className="mt-auto text-[11px] leading-relaxed text-slate-400">
          This lab refracts a <b>canvas</b> backdrop (the grid + badge), which is
          the only thing WebGL can sample. To put this on the global nav, the
          header needs a fixed canvas backdrop behind it — the one art-direction
          decision still open.
        </p>
      </aside>
    </main>
  );
}
