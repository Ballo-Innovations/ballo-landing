"use client";

/**
 * Liquid Glass playground — every knob of the nikdelvin/liquid-glass technique,
 * live, over a backdrop you can change and a panel you can drag around (the
 * refraction only reads honestly when the thing behind it moves).
 *
 * The filter is regenerated from the panel's measured size via ResizeObserver,
 * exactly as the upstream component does: the displacement map is pixel-sized,
 * so a map built for the wrong box shifts the rim off the edge.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getBackdropFilter,
  getDisplacementMap,
  supportsBackdropFilterUrl,
  type DisplacementOptions,
  type GlassParams,
} from "@/lib/liquidGlass";

type Preset = {
  id: string;
  label: string;
  note: string;
  params: GlassParams;
  radius: number;
  tint: string;
  rim: string;
  openEdges?: DisplacementOptions["openEdges"];
};

// Upstream defaults are depth 10 / strength 100 / cab 0 / blur 0.
const PRESETS: Preset[] = [
  {
    id: "reference",
    label: "Reference",
    note: "Upstream defaults: depth 10, strength 100, no aberration, no blur.",
    params: { depth: 10, strength: 100, chromaticAberration: 0, blur: 0, brightness: 1.1, saturate: 1.5 },
    radius: 24,
    tint: "rgba(9, 9, 11, 0)",
    rim: "inset 0 0 4px 0 rgba(250, 250, 250, 0.5)",
  },
  {
    id: "nav-pill",
    label: "Nav pill",
    note: "Small, shallow rim, a little blur so text over it stays readable.",
    params: { depth: 6, strength: 60, chromaticAberration: 0, blur: 4, brightness: 1.15, saturate: 1.4 },
    radius: 999,
    tint: "rgba(255, 255, 255, 0.08)",
    rim: "inset 0 0 4px 0 rgba(250, 250, 250, 0.55)",
  },
  {
    id: "card-band",
    label: "Card band",
    note: "What the Who-can-use cards use: rim open at the top so the masked edge cannot seam.",
    params: { depth: 10, strength: 100, chromaticAberration: 0, blur: 10, brightness: 1.1, saturate: 1.5 },
    radius: 20,
    tint: "rgba(9, 9, 11, 0.06)",
    rim: "inset 0 0 4px 0 rgba(250, 250, 250, 0.5)",
    openEdges: ["top"],
  },
  {
    id: "thick",
    label: "Thick gel",
    note: "Deep rim, heavy displacement — the glass reads as a slab, not a sheet.",
    params: { depth: 24, strength: 190, chromaticAberration: 0, blur: 6, brightness: 1.08, saturate: 1.6 },
    radius: 32,
    tint: "rgba(9, 9, 11, 0.04)",
    rim: "inset 0 0 6px 0 rgba(250, 250, 250, 0.6)",
  },
  {
    id: "prism",
    label: "Prism",
    note: "Aberration at 3 — three displacement passes, visible colour fringe. Costly.",
    params: { depth: 14, strength: 120, chromaticAberration: 3, blur: 2, brightness: 1.12, saturate: 1.7 },
    radius: 28,
    tint: "rgba(9, 9, 11, 0.03)",
    rim: "inset 0 0 5px 0 rgba(250, 250, 250, 0.55)",
  },
  {
    id: "frost",
    label: "Frost only",
    note: "Strength 0 — no refraction at all, just the blur chain. The control case.",
    params: { depth: 10, strength: 0, chromaticAberration: 0, blur: 14, brightness: 1.05, saturate: 1.3 },
    radius: 24,
    tint: "rgba(255, 255, 255, 0.06)",
    rim: "inset 0 0 4px 0 rgba(250, 250, 250, 0.4)",
  },
];

const BACKDROPS = [
  {
    id: "photo",
    label: "Photo",
    style: {
      backgroundImage:
        "url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=70)",
      backgroundSize: "cover",
      backgroundPosition: "center",
    } as React.CSSProperties,
  },
  {
    id: "grid",
    label: "Grid",
    style: {
      backgroundColor: "#cdc8e2",
      backgroundImage:
        "linear-gradient(rgba(110,100,150,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(110,100,150,0.35) 1px, transparent 1px)",
      backgroundSize: "48px 48px",
    } as React.CSSProperties,
  },
  {
    id: "mesh",
    label: "Colour mesh",
    style: {
      background:
        "radial-gradient(60% 60% at 20% 25%, #ff6b6b 0%, transparent 60%), radial-gradient(55% 55% at 80% 20%, #4dd4ff 0%, transparent 60%), radial-gradient(70% 70% at 60% 85%, #7c5cff 0%, transparent 65%), #0b1030",
    } as React.CSSProperties,
  },
  {
    id: "type",
    label: "Type",
    style: { backgroundColor: "#0b1030" } as React.CSSProperties,
  },
];

const SHAPES: Record<string, { width: number; height: number; label: string }> = {
  panel: { width: 420, height: 260, label: "Panel" },
  pill: { width: 300, height: 64, label: "Pill" },
  band: { width: 420, height: 130, label: "Card band" },
};

type ShapeKey = "panel" | "pill" | "band";

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <label style={{ display: "block", marginBottom: "1rem" }}>
      <span style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
        <span style={{ color: "rgba(255,255,255,0.82)" }}>{label}</span>
        <span style={{ color: "#5dd7ff", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#5dd7ff" }}
      />
      {hint && (
        <span style={{ display: "block", fontSize: "0.7rem", color: "rgba(255,255,255,0.42)", marginTop: "0.15rem" }}>
          {hint}
        </span>
      )}
    </label>
  );
}

const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: "0.35rem 0.75rem",
  borderRadius: 999,
  fontSize: "0.75rem",
  cursor: "pointer",
  border: `1px solid ${active ? "rgba(93,215,255,0.7)" : "rgba(255,255,255,0.16)"}`,
  background: active ? "rgba(93,215,255,0.14)" : "rgba(255,255,255,0.04)",
  color: active ? "#bdeeff" : "rgba(255,255,255,0.7)",
});

export function GlassPlayground() {
  const [params, setParams] = useState<GlassParams>(PRESETS[0].params);
  const [radius, setRadius] = useState(24);
  const [tint, setTint] = useState("rgba(9, 9, 11, 0)");
  const [rim, setRim] = useState("inset 0 0 4px 0 rgba(250, 250, 250, 0.5)");
  const [openTop, setOpenTop] = useState(false);
  const [shape, setShape] = useState<ShapeKey>("panel");
  const [backdrop, setBackdrop] = useState(BACKDROPS[0]);
  const [supported, setSupported] = useState(true);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const [box, setBox] = useState({ width: SHAPES.panel.width, height: SHAPES.panel.height });

  const stageRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => setSupported(supportsBackdropFilterUrl()), []);

  // The map is pixel-sized: remeasure whenever the panel's box changes, or the
  // rim ends up drawn for the wrong geometry.
  useEffect(() => {
    const el = glassRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      setBox({ width: Math.round(r.width), height: Math.round(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const openEdges = useMemo<DisplacementOptions["openEdges"]>(
    () => (openTop ? ["top"] : []),
    [openTop]
  );

  const backdropFilter = useMemo(
    () => getBackdropFilter(params, { ...box, radius }, openEdges),
    [params, box, radius, openEdges]
  );

  const mapPreview = useMemo(
    () => getDisplacementMap({ ...box, radius, depth: params.depth, openEdges }),
    [box, radius, params.depth, openEdges]
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    setPos({
      x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    });
  }, []);

  const applyPreset = (p: Preset) => {
    setParams(p.params);
    setRadius(p.radius);
    setTint(p.tint);
    setRim(p.rim);
    setOpenTop(Boolean(p.openEdges?.includes("top")));
  };

  const snippet = `/* Generated for a ${box.width}x${box.height} box, radius ${radius}px */
.glass {
  position: relative;
  border-radius: ${radius}px;
  background: ${tint};
  box-shadow: ${rim};
  backdrop-filter: ${backdropFilter};
}`;

  return (
    <main style={{ minHeight: "100vh", background: "#05071c", color: "#fff", padding: "2.5rem 1.5rem 5rem" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <header style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
            Internal · not linked from the site
          </p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0.4rem 0 0.6rem" }}>
            Liquid Glass playground
          </h1>
          <p style={{ color: "rgba(255,255,255,0.68)", maxWidth: "60ch", lineHeight: 1.6 }}>
            SVG displacement-map glass, ported from{" "}
            <a href="https://github.com/nikdelvin/liquid-glass" style={{ color: "#5dd7ff" }}>
              nikdelvin/liquid-glass
            </a>
            . Drag the panel across the backdrop — refraction only reads honestly when what is behind
            it moves.
          </p>
          {!supported && (
            <p style={{ marginTop: "1rem", padding: "0.7rem 1rem", borderRadius: 12, background: "rgba(255,120,120,0.12)", border: "1px solid rgba(255,120,120,0.35)", fontSize: "0.85rem" }}>
              This browser rejects <code>url()</code> inside <code>backdrop-filter</code> (Firefox does).
              You are seeing the blur-only fallback — no displacement.
            </p>
          )}
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: "1.5rem", alignItems: "start" }}>
          {/* ── Stage ─────────────────────────────────────────────────── */}
          <div>
            <div
              ref={stageRef}
              onPointerMove={onPointerMove}
              onPointerUp={() => (dragging.current = false)}
              style={{
                position: "relative",
                height: 520,
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.1)",
                touchAction: "none",
                ...backdrop.style,
              }}
            >
              {backdrop.id === "type" && (
                <div style={{ padding: "1.5rem", fontSize: "1.05rem", lineHeight: 1.5, color: "rgba(255,255,255,0.9)", fontWeight: 700, letterSpacing: "-0.01em" }}>
                  {Array.from({ length: 14 }, (_, i) => (
                    <p key={i} style={{ margin: 0, opacity: 1 - i * 0.045 }}>
                      REFRACTION READS BEST OVER HARD EDGES — 0123456789
                    </p>
                  ))}
                </div>
              )}

              <div
                ref={glassRef}
                onPointerDown={onPointerDown}
                style={{
                  position: "absolute",
                  left: `${pos.x * 100}%`,
                  top: `${pos.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                  width: SHAPES[shape].width,
                  height: SHAPES[shape].height,
                  borderRadius: radius,
                  background: tint,
                  boxShadow: rim,
                  backdropFilter: supported ? backdropFilter : `blur(${params.blur || 12}px) saturate(180%)`,
                  WebkitBackdropFilter: `blur(${params.blur || 12}px) saturate(180%)`,
                  cursor: "grab",
                  display: "grid",
                  placeItems: "center",
                  textShadow: "0 1px 8px rgba(0,0,0,0.45)",
                  fontWeight: 700,
                }}
              >
                Drag me
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
              {BACKDROPS.map((b) => (
                <button key={b.id} onClick={() => setBackdrop(b)} style={chipStyle(b.id === backdrop.id)}>
                  {b.label}
                </button>
              ))}
              <span style={{ width: 1, background: "rgba(255,255,255,0.14)", margin: "0 0.35rem" }} />
              {(Object.keys(SHAPES) as ShapeKey[]).map((k) => (
                <button key={k} onClick={() => setShape(k)} style={chipStyle(k === shape)}>
                  {SHAPES[k].label}
                </button>
              ))}
            </div>

            {/* ── Presets ─────────────────────────────────────────────── */}
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "2rem 0 0.75rem" }}>Variations</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
              {PRESETS.map((p) => (
                <PresetCard key={p.id} preset={p} supported={supported} onApply={() => applyPreset(p)} />
              ))}
            </div>
          </div>

          {/* ── Controls ──────────────────────────────────────────────── */}
          <aside
            style={{
              position: "sticky",
              top: "1.5rem",
              padding: "1.25rem",
              borderRadius: 16,
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Slider label="depth" value={params.depth} min={0} max={40} onChange={(v) => setParams({ ...params, depth: v })} hint="Rim width — how much of the edge refracts." />
            <Slider label="strength" value={params.strength} min={0} max={300} onChange={(v) => setParams({ ...params, strength: v })} hint="Displacement scale. 0 = frost only." />
            <Slider label="chromaticAberration" value={params.chromaticAberration} min={0} max={10} onChange={(v) => setParams({ ...params, chromaticAberration: v })} hint="1–3 recommended. Above 0 costs 3 passes." />
            <Slider label="blur" value={params.blur} min={0} max={24} onChange={(v) => setParams({ ...params, blur: v })} hint="Applied as blur(b/2) before and blur(b) after." />
            <Slider label="brightness" value={params.brightness} min={0.6} max={1.6} step={0.01} onChange={(v) => setParams({ ...params, brightness: v })} />
            <Slider label="saturate" value={params.saturate} min={0.5} max={2.5} step={0.05} onChange={(v) => setParams({ ...params, saturate: v })} />
            <Slider label="radius" value={radius} min={0} max={80} onChange={setRadius} hint="Must match the element's border-radius." />

            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.8rem", margin: "0.5rem 0 1rem", color: "rgba(255,255,255,0.8)" }}>
              <input type="checkbox" checked={openTop} onChange={(e) => setOpenTop(e.target.checked)} />
              open top edge (no rim)
            </label>

            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", margin: "0 0 0.4rem" }}>
              Displacement map ({box.width}×{box.height})
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mapPreview}
              alt="Displacement map"
              style={{ width: "100%", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", display: "block" }}
            />

            <textarea
              readOnly
              value={snippet}
              onFocus={(e) => e.currentTarget.select()}
              style={{
                width: "100%",
                height: 120,
                marginTop: "1rem",
                fontSize: "0.68rem",
                fontFamily: "ui-monospace, monospace",
                color: "rgba(255,255,255,0.75)",
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: "0.6rem",
                resize: "vertical",
              }}
            />
            <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", marginTop: "0.4rem" }}>
              The full <code>backdrop-filter</code> value is ~3KB of encoded SVG; copy it from
              devtools on the panel itself.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

/** One preset, rendered at a fixed size so its map is generated once. */
function PresetCard({
  preset,
  supported,
  onApply,
}: {
  preset: Preset;
  supported: boolean;
  onApply: () => void;
}) {
  const box = { width: 240, height: 150, radius: preset.radius };
  const filter = useMemo(
    () => getBackdropFilter(preset.params, box, preset.openEdges),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [preset]
  );

  return (
    <figure style={{ margin: 0 }}>
      <div
        style={{
          position: "relative",
          height: 150,
          borderRadius: 14,
          overflow: "hidden",
          backgroundImage:
            "url(https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=70)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: preset.openEdges?.includes("top") ? "auto 0 0 0" : "16px",
            height: preset.openEdges?.includes("top") ? "56%" : undefined,
            borderRadius: preset.radius,
            background: preset.tint,
            boxShadow: preset.rim,
            backdropFilter: supported ? filter : `blur(${preset.params.blur || 12}px) saturate(180%)`,
            maskImage: preset.openEdges?.includes("top")
              ? "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 45%, #000 85%)"
              : undefined,
            display: "grid",
            placeItems: "center",
            fontSize: "0.85rem",
            fontWeight: 700,
            textShadow: "0 1px 8px rgba(0,0,0,0.5)",
          }}
        >
          {preset.label}
        </div>
      </div>
      <figcaption style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.45, marginTop: "0.5rem" }}>
        {preset.note}
        <button
          onClick={onApply}
          style={{ ...chipStyle(false), marginTop: "0.5rem", display: "block", padding: "0.25rem 0.6rem" }}
        >
          Load into controls
        </button>
      </figcaption>
    </figure>
  );
}
