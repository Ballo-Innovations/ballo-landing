"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Renderer, Camera, Transform, Plane, Program, Mesh, Texture, type OGLRenderingContext } from 'ogl';

type GL = OGLRenderingContext;

interface ScreenSize   { width: number; height: number; }
interface ViewportSize { width: number; height: number; }
interface ScrollState  { position?: number; ease: number; current: number; target: number; last: number; }
interface AutoBindOptions { include?: Array<string | RegExp>; exclude?: Array<string | RegExp>; }

interface MediaParams {
  gl: GL; geometry: Plane; scene: Transform; screen: ScreenSize; viewport: ViewportSize;
  image: string; length: number; index: number; planeWidth: number; planeHeight: number; distortion: number;
}

interface CanvasParams {
  container: HTMLElement; canvas: HTMLCanvasElement; items: string[];
  planeWidth: number; planeHeight: number; distortion: number;
  scrollEase: number; cameraFov: number; cameraZ: number;
  disableWheel?: boolean; initialIndex?: number;
}

// ─── Shaders ─────────────────────────────────────────────────────────────────

const vertexShader = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float uPosition;
uniform float uTime;
uniform float uSpeed;
uniform vec3 distortionAxis;
uniform vec3 rotationAxis;
uniform float uDistortion;
varying vec2 vUv;
varying vec3 vNormal;
float PI = 3.141592653589793238;
mat4 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle); float c = cos(angle); float oc = 1.0 - c;
  return mat4(
    oc*axis.x*axis.x+c,           oc*axis.x*axis.y-axis.z*s,  oc*axis.z*axis.x+axis.y*s, 0.0,
    oc*axis.x*axis.y+axis.z*s,    oc*axis.y*axis.y+c,         oc*axis.y*axis.z-axis.x*s, 0.0,
    oc*axis.z*axis.x-axis.y*s,    oc*axis.y*axis.z+axis.x*s,  oc*axis.z*axis.z+c,        0.0,
    0.0, 0.0, 0.0, 1.0);
}
vec3 rotate(vec3 v, vec3 axis, float angle) {
  return (rotationMatrix(axis, angle) * vec4(v, 1.0)).xyz;
}
float qinticInOut(float t) {
  return t < 0.5 ? 16.0*pow(t,5.0) : -0.5*abs(pow(2.0*t-2.0,5.0))+1.0;
}
void main() {
  vUv = uv;
  float norm = 0.5;
  vec3 newpos = position;
  float offset = (dot(distortionAxis, position) + norm/2.) / norm;
  float localprogress = clamp(
    (fract(uPosition*5.0*0.01) - 0.01*uDistortion*offset) / (1. - 0.01*uDistortion), 0., 2.
  );
  localprogress = qinticInOut(localprogress) * PI;
  newpos = rotate(newpos, rotationAxis, localprogress);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newpos, 1.0);
}`;

const fragmentShader = `
precision highp float;
uniform vec2 uImageSize;
uniform vec2 uPlaneSize;
uniform sampler2D tMap;
varying vec2 vUv;
void main() {
  float imageAspect = uImageSize.x / uImageSize.y;
  float planeAspect = uPlaneSize.x / uPlaneSize.y;
  vec2 scale = vec2(1.0);
  if (planeAspect > imageAspect) scale.x = imageAspect / planeAspect;
  else scale.y = planeAspect / imageAspect;
  vec2 uv = vUv * scale + (1.0 - scale) * 0.5;
  gl_FragColor = texture2D(tMap, uv);
}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function AutoBind(self: any, { include, exclude }: AutoBindOptions = {}) {
  const getAllProperties = (o: any): Set<[any, string | symbol]> => {
    const props = new Set<[any, string | symbol]>();
    do { for (const k of Reflect.ownKeys(o)) props.add([o, k]); }
    while ((o = Reflect.getPrototypeOf(o)) && o !== Object.prototype);
    return props;
  };
  const filter = (k: string | symbol) => {
    const match = (p: string | RegExp) =>
      typeof p === 'string' ? k === p : (p as RegExp).test(k.toString());
    if (include) return include.some(match);
    if (exclude) return !exclude.some(match);
    return true;
  };
  for (const [obj, key] of getAllProperties(self.constructor.prototype)) {
    if (key === 'constructor' || !filter(key)) continue;
    const d = Reflect.getOwnPropertyDescriptor(obj, key);
    if (d && typeof d.value === 'function') self[key] = self[key].bind(self);
  }
  return self;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const map  = (n: number, a: number, b: number, c: number, d: number) =>
  ((n - a) / (b - a)) * (d - c) + c;

// ─── Media ───────────────────────────────────────────────────────────────────

class Media {
  gl: GL; geometry: Plane; scene: Transform; screen: ScreenSize; viewport: ViewportSize;
  image: string; length: number; index: number; planeWidth: number; planeHeight: number; distortion: number;
  program!: Program; plane!: Mesh;
  extra = 0; padding = 0; height = 0; heightTotal = 0; y = 0;

  constructor(p: MediaParams) {
    this.gl = p.gl; this.geometry = p.geometry; this.scene = p.scene;
    this.screen = p.screen; this.viewport = p.viewport; this.image = p.image;
    this.length = p.length; this.index = p.index;
    this.planeWidth = p.planeWidth; this.planeHeight = p.planeHeight; this.distortion = p.distortion;
    this.createShader(); this.createMesh(); this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: false });
    this.program = new Program(this.gl, {
      depthTest: false, depthWrite: false, fragment: fragmentShader, vertex: vertexShader,
      uniforms: {
        tMap: { value: texture }, uPosition: { value: 0 }, uPlaneSize: { value: [0, 0] },
        uImageSize: { value: [0, 0] }, uSpeed: { value: 0 },
        rotationAxis: { value: [0, 1, 0] }, distortionAxis: { value: [1, 1, 0] },
        uDistortion: { value: this.distortion },
        uViewportSize: { value: [this.viewport.width, this.viewport.height] }, uTime: { value: 0 },
      },
      cullFace: false,
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSize.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.plane.setParent(this.scene);
  }

  setScale() {
    this.plane.scale.x = (this.viewport.width  * this.planeWidth)  / this.screen.width;
    this.plane.scale.y = (this.viewport.height * this.planeHeight) / this.screen.height;
    this.plane.position.x = 0;
    this.program.uniforms.uPlaneSize.value = [this.plane.scale.x, this.plane.scale.y];
  }

  onResize({ screen, viewport }: { screen?: ScreenSize; viewport?: ViewportSize } = {}) {
    if (screen)   this.screen   = screen;
    if (viewport) {
      this.viewport = viewport;
      this.program.uniforms.uViewportSize.value = [viewport.width, viewport.height];
    }
    this.setScale();
    this.padding     = 5;
    this.height      = this.plane.scale.y + this.padding;
    this.heightTotal = this.height * this.length;
    this.y           = -this.heightTotal / 2 + (this.index + 0.5) * this.height;
  }

  update(scroll: ScrollState) {
    this.plane.position.y = this.y - scroll.current - this.extra;
    const pos = map(this.plane.position.y, -this.viewport.height, this.viewport.height, 5, 15);
    this.program.uniforms.uPosition.value  = pos;
    this.program.uniforms.uTime.value     += 0.04;
    this.program.uniforms.uSpeed.value     = scroll.current;
    const ph = this.plane.scale.y, vh = this.viewport.height;
    if (this.plane.position.y + ph / 2 < -vh / 2) this.extra -= this.heightTotal;
    else if (this.plane.position.y - ph / 2 >  vh / 2) this.extra += this.heightTotal;
  }
}

// ─── Canvas ──────────────────────────────────────────────────────────────────

class Canvas {
  container: HTMLElement; canvas: HTMLCanvasElement; items: string[];
  planeWidth: number; planeHeight: number; distortion: number; scroll: ScrollState;
  cameraFov: number; cameraZ: number; disableWheel: boolean;
  renderer!: Renderer; gl!: GL; camera!: Camera; scene!: Transform;
  planeGeometry!: Plane; medias!: Media[]; screen!: ScreenSize; viewport!: ViewportSize;
  isDown = false; start = 0;
  rafId = 0; // stop condition for rAF loop
  ro: ResizeObserver | null = null;

  constructor(p: CanvasParams) {
    this.container    = p.container;  this.canvas      = p.canvas;
    this.items        = p.items;      this.planeWidth  = p.planeWidth;
    this.planeHeight  = p.planeHeight; this.distortion = p.distortion;
    this.cameraFov    = p.cameraFov;  this.cameraZ     = p.cameraZ;
    this.disableWheel = p.disableWheel ?? false;
    this.scroll = { ease: p.scrollEase, current: 0, target: 0, last: 0 };
    AutoBind(this);
    this.createRenderer(); this.createCamera(); this.createScene();
    this.onResize(); this.createGeometry(); this.createMedias();
    // Snap (no fly) so the FIRST poster shown is items[initialIndex] — the planes
    // are stacked vertically, so a raw scroll=0 would centre the MIDDLE plane and
    // desync from the caller's active item (and the mobile carousel).
    const startOffset = this.offsetForIndex(p.initialIndex ?? 0);
    this.scroll.current = startOffset;
    this.scroll.target  = startOffset;
    this.rafId = requestAnimationFrame(this.update);
    // Resize must always be observed (even when wheel is driven externally) so the
    // WebGL planes re-measure on viewport/orientation/layout changes — otherwise a
    // poster created at the wrong container size stays mis-scaled (e.g. on mobile).
    window.addEventListener('resize', this.onResize);
    this.ro = new ResizeObserver(() => this.onResize());
    this.ro.observe(this.container);
    if (!this.disableWheel) this.addEventListeners();
  }

  // ── public API ──

  /** Scroll offset that centres the plane at `index`. */
  offsetForIndex(index: number) {
    if (!this.medias?.length) return 0;
    const { height, heightTotal } = this.medias[0];
    // plane.position.y = y - scroll.current = 0  →  offset = y_for_index
    return -heightTotal / 2 + (index + 0.5) * height;
  }

  /** Drive scroll to centre item at `index` — called from GSAP onUpdate */
  scrollToIndex(index: number) {
    this.scroll.target = this.offsetForIndex(index);
  }

  // ── setup ──

  createRenderer() {
    this.renderer = new Renderer({
      canvas: this.canvas, alpha: true, antialias: true,
      dpr: Math.min(window.devicePixelRatio, 2),
    });
    this.gl = this.renderer.gl;
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = this.cameraFov;
    this.camera.position.z = this.cameraZ;
  }

  createScene()    { this.scene = new Transform(); }
  createGeometry() { this.planeGeometry = new Plane(this.gl, { heightSegments: 1, widthSegments: 100 }); }

  createMedias() {
    this.medias = this.items.map((image, index) =>
      new Media({
        gl: this.gl, geometry: this.planeGeometry, scene: this.scene,
        screen: this.screen, viewport: this.viewport, image,
        length: this.items.length, index,
        planeWidth: this.planeWidth, planeHeight: this.planeHeight, distortion: this.distortion,
      })
    );
  }

  // ── resize ──

  onResize() {
    const rect = this.container.getBoundingClientRect();
    this.screen = { width: rect.width, height: rect.height };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.gl.canvas.width / this.gl.canvas.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const h   = 2 * Math.tan(fov / 2) * this.camera.position.z;
    this.viewport = { width: h * this.camera.aspect, height: h };
    this.medias?.forEach(m => m.onResize({ screen: this.screen, viewport: this.viewport }));
  }

  // ── events (only used when disableWheel=false) ──

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY;
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    if (!this.isDown || this.scroll.position == null) return;
    const y = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY;
    this.scroll.target = this.scroll.position + (this.start - y) * 0.1;
  }

  onTouchUp() { this.isDown = false; }

  onWheel(e: WheelEvent) { this.scroll.target += e.deltaY * 0.005; }

  // ── rAF loop (has stop condition via this.rafId + cancelAnimationFrame in destroy) ──

  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    this.medias?.forEach(m => m.update(this.scroll));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.rafId = requestAnimationFrame(this.update); // ID stored → stop condition in destroy()
  }

  addEventListeners() {
    // 'resize' is bound in the constructor (always-on); only interaction
    // listeners are added here when the caller isn't driving scroll.
    window.addEventListener('wheel',      this.onWheel);
    window.addEventListener('mousedown',  this.onTouchDown);
    window.addEventListener('mousemove',  this.onTouchMove);
    window.addEventListener('mouseup',    this.onTouchUp);
    window.addEventListener('touchstart', this.onTouchDown as EventListener);
    window.addEventListener('touchmove',  this.onTouchMove as EventListener);
    window.addEventListener('touchend',   this.onTouchUp   as EventListener);
  }

  destroy() {
    cancelAnimationFrame(this.rafId); // stop condition — terminates the rAF loop
    this.ro?.disconnect();
    window.removeEventListener('resize',     this.onResize);
    window.removeEventListener('wheel',      this.onWheel);
    window.removeEventListener('mousedown',  this.onTouchDown);
    window.removeEventListener('mousemove',  this.onTouchMove);
    window.removeEventListener('mouseup',    this.onTouchUp);
    window.removeEventListener('touchstart', this.onTouchDown as EventListener);
    window.removeEventListener('touchmove',  this.onTouchMove as EventListener);
    window.removeEventListener('touchend',   this.onTouchUp   as EventListener);
  }
}

// ─── React component ─────────────────────────────────────────────────────────

export interface FlyingPostersHandle {
  scrollToIndex: (index: number) => void;
}

interface FlyingPostersProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: string[];
  planeWidth?: number;
  planeHeight?: number;
  distortion?: number;
  scrollEase?: number;
  cameraFov?: number;
  cameraZ?: number;
  /** When true, wheel/touch/mouse listeners are suppressed so the caller drives scroll */
  disableWheel?: boolean;
  /** Plane to centre on first paint (keeps it in sync with the caller's active item) */
  initialIndex?: number;
}

const FlyingPosters = forwardRef<FlyingPostersHandle, FlyingPostersProps>(function FlyingPosters(
  {
    items = [], planeWidth = 320, planeHeight = 320, distortion = 3,
    scrollEase = 0.05, cameraFov = 45, cameraZ = 20,
    disableWheel = false, initialIndex = 0, className, ...props
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const instanceRef  = useRef<Canvas | null>(null);

  // Expose scrollToIndex to parent (e.g. GSAP onUpdate)
  useImperativeHandle(ref, () => ({
    scrollToIndex: (index: number) => instanceRef.current?.scrollToIndex(index),
  }));

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    instanceRef.current = new Canvas({
      container: containerRef.current, canvas: canvasRef.current, items,
      planeWidth, planeHeight, distortion, scrollEase, cameraFov, cameraZ, disableWheel, initialIndex,
    });
    return () => { instanceRef.current?.destroy(); instanceRef.current = null; };
  }, [items, planeWidth, planeHeight, distortion, scrollEase, cameraFov, cameraZ, disableWheel, initialIndex]);

  // Canvas-level passive:false wheel handler (needed for preventDefault when not in GSAP mode)
  useEffect(() => {
    if (disableWheel || !canvasRef.current) return;
    const el = canvasRef.current;
    const onWheel      = (e: WheelEvent)  => { e.preventDefault(); instanceRef.current?.onWheel(e); };
    const onTouchMove  = (e: TouchEvent)  => { e.preventDefault(); };
    el.addEventListener('wheel',     onWheel,     { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      el.removeEventListener('wheel',     onWheel);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [disableWheel]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full overflow-visible relative ${className ?? ''}`}
      style={{ willChange: 'transform' }} // promote canvas container to own compositor layer
      {...props}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
});

export default FlyingPosters;
