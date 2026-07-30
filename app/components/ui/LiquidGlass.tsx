"use client";

// Apple-style "liquid glass" pill — WebGL screen-space refraction with
// prismatic chromatic dispersion. Ported to TypeScript from the reference
// LiquidGlass component. The shader is unchanged; the only structural
// addition is a requestAnimationFrame render loop so the glass keeps
// re-sampling an animated / scrolling background canvas every frame instead
// of only redrawing when a prop changes.
//
// IMPORTANT: this refracts `bgCanvas` (a real <canvas> texture), NOT the live
// DOM. It must be given a stage element to measure against (`stageRef`) and a
// background canvas to sample (`bgCanvasRef`) — see GlassStage.

import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

const VERTEX_SHADER = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform sampler2D uBackground;
  uniform vec2 uResolution;
  uniform vec2 uPointer;          // Normalized pointer [-1, 1]
  uniform vec4 uElementPos;       // [x, y, w, h] normalized in stage screen space
  uniform float uDistortion;      // Lens refraction strength
  uniform float uDispersion;      // Prismatic chromatic dispersion factor
  uniform float uFresnel;         // Fresnel edge rim intensity
  uniform float uHighlight;       // Specular glare brightness
  uniform float uRadius;          // Corner radius factor
  uniform float uAspect;          // Lens element aspect ratio (w / h)
  uniform float uShape;           // 0.0 = Pill/RoundedBox, 1.0 = Circle
  uniform float uMagnification;   // Lens center zoom factor

  varying vec2 vUv;

  // Signed Distance Function (SDF) for Rounded Box / Pill
  float sdRoundedBox(vec2 p, vec2 b, vec4 r) {
    r.x = (p.x > 0.0) ? ((p.y > 0.0) ? r.x : r.y) : ((p.y > 0.0) ? r.z : r.w);
    vec2 q = abs(p) - b + r.x;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    vec2 boxSize = vec2(uAspect * 0.5, 0.5);

    // SDF distance calculation for pill/circle shape
    float cornerRadius = uShape > 0.5 ? 0.5 : min(uAspect * 0.5, 0.5) * uRadius;
    float d = uShape > 0.5
      ? length(p) - 0.48
      : sdRoundedBox(p, boxSize, vec4(cornerRadius));

    // Antialiased edge discard cutoff
    float edgeAlpha = smoothstep(0.002, -0.002, d);
    if (edgeAlpha <= 0.0) {
      discard;
    }

    // Normalized depth heightfield gradient across lens curve
    float borderDist = -d;
    float edgeFactor = clamp(borderDist / (cornerRadius + 0.001), 0.0, 1.0);
    float lensHeight = sqrt(clamp(1.0 - (1.0 - edgeFactor) * (1.0 - edgeFactor), 0.0, 1.0));

    // Surface Normal Vector (Nx, Ny, Nz)
    vec2 normXY = clamp((p / boxSize) * (1.0 - edgeFactor * 0.55), -1.0, 1.0);
    vec3 normal = normalize(vec3(normXY * 2.2, 1.0));

    // Refraction UV offset vector in lens space
    vec2 refractOffset = normXY * uDistortion * (0.12 + (1.0 - lensHeight) * 0.88);

    // Calculate exact screen-space background sample UV coordinate
    vec2 baseScreenUv = uElementPos.xy + vUv * uElementPos.zw;

    // Apply lens magnification zoom
    vec2 centerScreenUv = uElementPos.xy + vec2(0.5) * uElementPos.zw;
    vec2 magnifiedUv = mix(baseScreenUv, centerScreenUv, (1.0 - uMagnification) * (1.0 - edgeFactor * 0.5));

    // --- Chromatic Dispersion (Prismatic RGB Channel Splitting) ---
    vec2 uvR = magnifiedUv - refractOffset * uElementPos.zw * (1.0 + uDispersion * 15.0);
    vec2 uvG = magnifiedUv - refractOffset * uElementPos.zw;
    vec2 uvB = magnifiedUv - refractOffset * uElementPos.zw * (1.0 - uDispersion * 15.0);

    float rChannel = texture2D(uBackground, clamp(uvR, 0.001, 0.999)).r;
    float gChannel = texture2D(uBackground, clamp(uvG, 0.001, 0.999)).g;
    float bChannel = texture2D(uBackground, clamp(uvB, 0.001, 0.999)).b;

    vec3 refractedColor = vec3(rChannel, gChannel, bChannel);

    // --- Fresnel Silhouette Edge Lighting ---
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    float fresnelFactor = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.8);
    vec3 fresnelGlow = vec3(0.95, 0.97, 1.0) * fresnelFactor * uFresnel;

    // --- Dynamic Specular Light Glare Spot ---
    vec2 lightPos = uPointer * vec2(uAspect * 0.5, 0.5);
    vec2 lightDir2D = normalize(lightPos - p);
    float specDot = max(dot(normXY, lightDir2D), 0.0);
    float specularHighlight = pow(specDot, 18.0) * uHighlight * (0.35 + edgeFactor * 0.65);

    // Top subtle specular reflection band
    float topBand = pow(max(0.0, 0.5 - length(p - vec2(0.0, 0.38))), 2.5) * 0.35 * uHighlight;

    // Volumetric Depth Tint
    vec3 internalTint = mix(vec3(0.96, 0.97, 1.0), vec3(1.0), vUv.y);

    // Composite Final Pixel
    vec3 finalColor = refractedColor * internalTint + fresnelGlow + vec3(specularHighlight + topBand);

    gl_FragColor = vec4(finalColor, edgeAlpha);
  }
`;

export type GlassShape = "pill" | "circle" | "rounded";

interface ElementPos {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Pointer {
  x: number;
  y: number;
}

interface WebGLCanvasProps {
  width: number;
  height: number;
  elementPos: ElementPos;
  distortion: number;
  dispersion: number;
  fresnel: number;
  highlight: number;
  radius: number;
  shape: GlassShape;
  magnification: number;
  pointer: Pointer;
  bgCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const compileShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("LiquidGlass shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const LiquidGlassWebGLCanvas: React.FC<WebGLCanvasProps> = ({
  width,
  height,
  elementPos,
  distortion,
  dispersion,
  fresnel,
  highlight,
  radius,
  shape,
  magnification,
  pointer,
  bgCanvasRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});

  // Latest prop values, read inside the rAF loop so the loop doesn't need to
  // be torn down/rebuilt every frame a prop changes.
  const stateRef = useRef({
    width,
    height,
    elementPos,
    distortion,
    dispersion,
    fresnel,
    highlight,
    radius,
    shape,
    magnification,
    pointer,
  });
  stateRef.current = {
    width,
    height,
    elementPos,
    distortion,
    dispersion,
    fresnel,
    highlight,
    radius,
    shape,
    magnification,
    pointer,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      depth: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;
    glRef.current = gl;

    const vertShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("LiquidGlass program link error:", gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    uniformsRef.current = {
      uBackground: gl.getUniformLocation(program, "uBackground"),
      uResolution: gl.getUniformLocation(program, "uResolution"),
      uPointer: gl.getUniformLocation(program, "uPointer"),
      uElementPos: gl.getUniformLocation(program, "uElementPos"),
      uDistortion: gl.getUniformLocation(program, "uDistortion"),
      uDispersion: gl.getUniformLocation(program, "uDispersion"),
      uFresnel: gl.getUniformLocation(program, "uFresnel"),
      uHighlight: gl.getUniformLocation(program, "uHighlight"),
      uRadius: gl.getUniformLocation(program, "uRadius"),
      uAspect: gl.getUniformLocation(program, "uAspect"),
      uShape: gl.getUniformLocation(program, "uShape"),
      uMagnification: gl.getUniformLocation(program, "uMagnification"),
    };

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    textureRef.current = texture;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let raf = 0;
    const uni = uniformsRef.current;

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current;
      const bgCanvas = bgCanvasRef.current;
      if (!bgCanvas || s.width <= 0 || s.height <= 0) return;

      gl.useProgram(program);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgCanvas);
      } catch {
        // Cross-origin canvas taint — skip this frame's upload.
      }

      const aspect = s.width / Math.max(s.height, 1);
      gl.uniform2f(uni.uResolution, s.width, s.height);
      gl.uniform2f(uni.uPointer, s.pointer.x, s.pointer.y);
      gl.uniform4f(uni.uElementPos, s.elementPos.x, s.elementPos.y, s.elementPos.w, s.elementPos.h);
      gl.uniform1f(uni.uDistortion, s.distortion);
      gl.uniform1f(uni.uDispersion, s.dispersion);
      gl.uniform1f(uni.uFresnel, s.fresnel);
      gl.uniform1f(uni.uHighlight, s.highlight);
      gl.uniform1f(uni.uRadius, s.radius);
      gl.uniform1f(uni.uAspect, aspect);
      gl.uniform1f(uni.uShape, s.shape === "circle" ? 1.0 : 0.0);
      gl.uniform1f(uni.uMagnification, s.magnification);

      if (canvas.width !== s.width) canvas.width = s.width;
      if (canvas.height !== s.height) canvas.height = s.height;
      gl.viewport(0, 0, s.width, s.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteTexture(texture);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgCanvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="pointer-events-none absolute inset-0 h-full w-full z-10"
    />
  );
};

export interface LiquidGlassProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  shape?: GlassShape;
  distortion?: number;
  dispersion?: number;
  fresnel?: number;
  highlight?: number;
  radius?: number;
  blur?: number;
  magnification?: number;
  interactive?: boolean;
  draggable?: boolean;
  stageRef: React.RefObject<HTMLElement | null>;
  bgCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  onClick?: () => void;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  className = "",
  style = {},
  shape = "pill",
  distortion = 0.28,
  dispersion = 0.012,
  fresnel = 1.4,
  highlight = 1.1,
  radius = 0.95,
  blur = 1,
  magnification = 1.0,
  interactive = true,
  draggable = false,
  stageRef,
  bgCanvasRef,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 320, height: 96 });
  const [elementPos, setElementPos] = useState<ElementPos>({ x: 0.3, y: 0.4, w: 0.3, h: 0.15 });
  const [pointer, setPointer] = useState<Pointer>({ x: -0.2, y: -0.2 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });

  const updateScreenPosition = () => {
    if (!containerRef.current || !stageRef?.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const stageRect = stageRef.current.getBoundingClientRect();
    if (stageRect.width > 0 && stageRect.height > 0) {
      setSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
      setElementPos({
        x: (rect.left - stageRect.left) / stageRect.width,
        y: (rect.top - stageRect.top) / stageRect.height,
        w: rect.width / stageRect.width,
        h: rect.height / stageRect.height,
      });
    }
  };

  useEffect(() => {
    updateScreenPosition();
    const observer = new ResizeObserver(updateScreenPosition);
    if (containerRef.current) observer.observe(containerRef.current);
    if (stageRef?.current) observer.observe(stageRef.current);
    // Keep the sample window aligned while the page scrolls under a fixed stage.
    window.addEventListener("scroll", updateScreenPosition, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateScreenPosition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, stageRef]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    setPointer({ x: nx, y: ny });
    if (interactive) setTilt({ rx: ny * -6, ry: nx * 6 });
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
      updateScreenPosition();
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!draggable) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    if (!isHovered) setTilt({ rx: 0, ry: 0 });
  };

  const shapeClass =
    shape === "circle"
      ? "rounded-full aspect-square"
      : shape === "pill"
        ? "rounded-full"
        : "rounded-3xl";

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isDragging) setTilt({ rx: 0, ry: 0 });
      }}
      onClick={onClick}
      className={`relative select-none transition-transform duration-150 ${
        draggable ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-pointer"
      } ${shapeClass} ${className}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) perspective(800px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${isHovered ? 1.02 : 1})`,
        boxShadow: isHovered
          ? "0 20px 40px -10px rgba(0, 0, 0, 0.25), 0 0 30px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.8)"
          : "0 10px 25px -5px rgba(0, 0, 0, 0.18), 0 0 15px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.6)",
        transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.2)",
        ...style,
      }}
    >
      <LiquidGlassWebGLCanvas
        width={size.width}
        height={size.height}
        elementPos={elementPos}
        distortion={distortion}
        dispersion={dispersion}
        fresnel={fresnel}
        highlight={highlight}
        radius={radius}
        shape={shape}
        magnification={magnification}
        pointer={pointer}
        bgCanvasRef={bgCanvasRef}
      />

      {blur > 0 && (
        <div
          className={`absolute inset-0 z-0 ${shapeClass}`}
          style={{
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
          }}
        />
      )}

      <div className="relative z-30 flex h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default LiquidGlass;
