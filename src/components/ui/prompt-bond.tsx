// Prompt Bond from 000h by Cojeev — MIT licence — see it live at https://cojeev.com/ — the full library: https://cojeev.com/ui/
"use client";

import * as React from "react";
import { useThree } from "@react-three/fiber";
import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";
import { type ClassValue, clsx } from "clsx";
import { animate, type AnimationPlaybackControls, type AnimationSequence, cancelFrame, frame } from "motion";
import { motion } from "motion/react";
import { twMerge } from "tailwind-merge";
import "three";
import { AgentConfig } from "../../types/agent";

// ---- registry/cojeev/lib/utils.ts (inlined) ----
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function subscribePreferences(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", listener);
  document.addEventListener("visibilitychange", listener);
  return () => {
    media.removeEventListener("change", listener);
    document.removeEventListener("visibilitychange", listener);
  };
}
const readPreferences = () => typeof document !== "undefined" && document.visibilityState === "visible" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useMotionVisibility(ref: React.RefObject<Element | null>, mountedElement?: Element | null) {
  const enabled = React.useSyncExternalStore(subscribePreferences, readPreferences, () => false);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const element = mountedElement ?? ref.current;
    if (!element) { setInView(false); return; }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, mountedElement]);
  return { enabled, inView };
}

const BUTTON = "v-btn [display:inline-flex] items-center justify-center gap-[var(--s-2)] rounded-[var(--r-pill)] font-[number:var(--fw-control)] whitespace-nowrap motion-safe:active:[transform:translateY(1px)] -ghost bg-transparent text-[color:var(--v-text)] hover:bg-[var(--v-beige)] py-0";
const SIZE = {
  default: "h-[var(--ctl-md)] px-[var(--s-5)] text-[length:var(--fs-control)]",
  sm: "-sm h-[var(--ctl-sm)] px-[var(--s-4)] text-[length:var(--fs-small)]",
};
type ButtonProps = React.ComponentProps<"button"> & { size?: keyof typeof SIZE };

function Button({ size = "default", className, disabled, type = "button", onClick, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      data-part="root"
      data-state={disabled ? "disabled" : "rest"}
      type={type}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onClick={event => { if (disabled) { event.preventDefault(); return; } onClick?.(event); }}
      className={cn(BUTTON, SIZE[size], "leading-none", className)}
      {...props}
    />
  );
}

const InputControl = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(function InputControl({ className, ...props }, ref) {
  return <input ref={ref} data-slot="input-control" data-part="input" className={cn("min-w-0 flex-1 h-full [border:0] bg-transparent [outline:0] [padding:1px_2px] placeholder:text-[color:var(--v-text-2)]", className)} {...props} />;
});

function BubbleMe({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="bubble-content" data-part="content" className={cn("v-bubble [display:inline-block] [max-width:min(80%,52ch)] [padding:var(--s-3)_var(--s-4)_var(--s-3)] [font-size:var(--fs-control)] [line-height:1.4] [overflow-wrap:anywhere] [position:relative] -me [background:var(--v-pink)] [border-radius:var(--r-card)_var(--r-card)_var(--r-xs)_var(--r-card)] [color:var(--v-on-accent)]", className)} {...props} />;
}

type ThemeMode = "light" | "dark";

function applyTheme(mode: ThemeMode, quiet = false) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (root.dataset.mode === mode) return;
  const set = () => { root.dataset.mode = mode; };
  const still = quiet || document.hidden || matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still || typeof (document as any).startViewTransition !== "function") set();
  else (document as any).startViewTransition(set);
}

const SUN = "M12 5C15.866 5 19 8.134 19 12C19 15.866 15.866 19 12 19C8.134 19 5 15.866 5 12C5 8.134 8.134 5 12 5Z";
const MOON = "M18.9 15.2C17.2 19.3 12.9 21.2 8.8 19.4C4.7 17.6 2.7 13 4.4 8.8C5.4 6.2 7.7 4.3 10.4 3.8C8.1 10.4 12.3 16.8 18.9 15.2Z";
const SPRING = { type: "spring", stiffness: 360, damping: 32, mass: 0.85 } as const;

function ThemeToggle({ mode, onModeChange, responsive = false }: { mode: ThemeMode; onModeChange: (mode: ThemeMode) => void; responsive?: boolean }) {
  const quiet = !React.useSyncExternalStore(subscribePreferences, readPreferences, () => false);
  const dark = mode === "dark";
  const transition = quiet ? { duration: 0 } : SPRING;
  return (
    <Button size="sm" data-label="visible" data-responsive={responsive} role="switch" aria-checked={dark} aria-label="Appearance" title={`Switch appearance`} className="v-theme-toggle" onClick={() => onModeChange(dark ? "light" : "dark")} data-slot="theme-toggle">
      <svg data-slot="theme-toggle-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true" focusable="false">
        <motion.g initial={false} animate={{ rotate: dark ? 45 : 0 }} transition={transition} style={{ transformOrigin: "12px 12px" }}>
          {Array.from({ length: 8 }, (_, i) => (
            <motion.path key={i} d="M12 1.5V3" transform={`rotate(${i * 45} 12 12)`} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" initial={false} animate={{ pathLength: dark ? 0 : 1, opacity: dark ? 0 : 1 }} transition={{ duration: quiet ? 0 : 0.2, delay: quiet ? 0 : i * 0.015 }} />
          ))}
        </motion.g>
        <motion.path initial={false} d={dark ? MOON : SUN} animate={{ d: dark ? MOON : SUN, rotate: dark ? -12 : 0 }} transition={transition} fill="currentColor" style={{ transformOrigin: "12px 12px" }} />
      </svg>
      <span className="v-theme-toggle__label">{dark ? "Dark" : "Light"}</span>
    </Button>
  );
}

type IconPart = string | [tag: "rect" | "circle", attrs: Record<string, string>];
const geometry: Record<string, IconPart[]> = {
  brain: ["M12 18V5", "M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4", "M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5", "M17.997 5.125a4 4 0 0 1 2.526 5.77", "M18 18a4 4 0 0 0 2-7.464", "M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517", "M6 18a4 4 0 0 1-2-7.464", "M6.003 5.125a4 4 0 0 0-2.526 5.77"],
  bot: ["M12 8V4H8", ["rect", {width: "16", height: "12", x: "4", y: "8", rx: "2"}], "M2 14h2", "M20 14h2", "M15 13v2", "M9 13v2"],
  file: ["M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z", "M14 3v5h5"],
  "file-text": ["M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z", "M14 2v5a1 1 0 0 0 1 1h5", "M10 9H8", "M16 13H8", "M16 17H8"],
  sparkles: ["M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z", "M20 2v4", "M22 4h-4", ["circle", {cx: "4", cy: "20", r: "2"}]],
  users: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M16 3.128a4 4 0 0 1 0 7.744", "M22 21v-2a4 4 0 0 0-3-3.87", ["circle", {cx: "9", cy: "7", r: "4"}]],
  bookmark: ["M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"],
  zap: ["M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"],
  check: ["M20 6 9 17l-5-5"],
  play: ["M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"],
  pause: [["rect", {x: "14", y: "3", width: "5", height: "18", rx: "1"}], ["rect", {x: "5", y: "3", width: "5", height: "18", rx: "1"}]],
  "arrow-right": ["M5 12h14", "m12 5 7 7-7 7"],
};

type PartMotion = { parts: "glyph" | number[]; move?: [number, number]; scale?: [number, number]; pivot?: [number, number]; trace?: boolean; delay?: number };
const recipes: Record<string, PartMotion[]> = {
  "file-text": [{ parts: [2], trace: true }, { parts: [3], trace: true, delay: 0.1 }, { parts: [4], trace: true, delay: 0.2 }],
  sparkles: [{ parts: [1, 2], scale: [0.2, 0.2], pivot: [20, 4] }, { parts: [3], scale: [0.18, 0.18], pivot: [4, 20], delay: 0.18 }],
  users: [{ parts: [1, 2], move: [1, 0] }],
  bookmark: [{ parts: "glyph", move: [0, 1.5] }],
  zap: [{ parts: [0], trace: true }],
  check: [{ parts: [0], trace: true }],
  play: [{ parts: "glyph", move: [1.4, 0], scale: [-0.07, -0.07] }],
  pause: [{ parts: [0], move: [-1.2, 0] }, { parts: [1], move: [1.2, 0] }],
  "arrow-right": [{ parts: "glyph", move: [2.5, 0] }],
};

type Frame = Record<string, { transform?: string; draw?: number }>;
function recipeFrame(motions: PartMotion[], p: number): Frame {
  const frameRes: Frame = {};
  for (const motion of motions) {
    const delay = motion.delay ?? 0;
    const t = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
    const pulse = Math.sin(Math.PI * t);
    const [cx, cy] = motion.pivot ?? [12, 12];
    const transform: string[] = [];
    if (motion.move) transform.push(`translate(${motion.move[0] * pulse} ${motion.move[1] * pulse})`);
    if (motion.scale) transform.push(`translate(${cx} ${cy}) scale(${Math.max(0.08, 1 + motion.scale[0] * pulse)} ${Math.max(0.08, 1 + motion.scale[1] * pulse)}) translate(${-cx} ${-cy})`);
    for (const part of motion.parts === "glyph" ? ["glyph"] : motion.parts) {
      frameRes[part] = { ...(transform.length ? { transform: transform.join(" ") } : {}), ...(motion.trace ? { draw: Math.min(1, t * 1.8) } : {}) };
    }
  }
  return frameRes;
}

function createPainter(svg: SVGSVGElement, frames: (p: number) => Frame) {
  const groups = new Map(Array.from(svg.querySelectorAll<SVGGElement>("[data-icon-part]")).map(g => [g.dataset.iconPart!, g]));
  const written = new Map<Element, Map<string, string | null>>();
  const lengths = new Map<SVGGeometryElement, number>();
  const set = (node: Element, name: string, value: string) => {
    let saved = written.get(node);
    if (!saved) written.set(node, (saved = new Map()));
    if (!saved.has(name)) saved.set(name, node.getAttribute(name));
    node.setAttribute(name, value);
  };
  return {
    paint(p: number) {
      for (const [part, f] of Object.entries(frames(p))) {
        const group = groups.get(part);
        if (!group) continue;
        if (f.transform) set(group, "transform", f.transform);
        if (f.draw !== undefined) for (const shape of group.querySelectorAll<SVGGeometryElement>("path,rect,circle")) {
          const length = lengths.get(shape) ?? shape.getTotalLength();
          lengths.set(shape, length);
          set(shape, "stroke-dasharray", `${length} ${length}`);
          set(shape, "stroke-dashoffset", String(length * (1 - f.draw)));
        }
      }
    },
    restore() {
      for (const [node, saved] of written) for (const [name, before] of saved) {
        if (before === null) node.removeAttribute(name);
        else node.setAttribute(name, before);
      }
      written.clear();
    },
  };
}

type IconProps = React.ComponentProps<"svg"> & { name: string; size?: "default" | "sm" };
function Icon({ name, size = "default", className, ...props }: IconProps) {
  return (
    <svg data-slot="icon" data-icon-name={name} data-icon-treatment="outline" viewBox="0 0 24 24" aria-hidden="true" className={cn("v-icon [width:var(--icon-md)] [height:var(--icon-md)] [stroke:currentColor] [stroke-width:var(--icon-stroke)] [stroke-linecap:round] [stroke-linejoin:round] [fill:none] [flex:none]", size !== "default" && `-${size}`, className)} {...props}>
      <g data-icon-ink="">
        <g data-icon-part="glyph">
          {(geometry[name] ?? []).map((part, i) => (
            <g key={i} data-icon-part={i}>
              {typeof part === "string" ? <path d={part} /> : React.createElement(part[0], part[1])}
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}

const BUTTON_LIKE = "button,a[href],[role=button],[role=switch],label";
const BLOCKED = ':disabled,[disabled],[aria-disabled="true"]';

function AnimatedIcon({ name, preset = "auto", active, size = "default", className }: { name: string; preset?: "auto" | "draw"; active?: boolean; size?: "default" | "sm"; className?: string }) {
  const host = React.useRef<HTMLSpanElement>(null);
  const { enabled, inView } = useMotionVisibility(host);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [allowed, setAllowed] = React.useState(false);
  const [replay, setReplay] = React.useState(0);
  const [replaying, setReplaying] = React.useState(false);
  React.useEffect(() => {
    if (!replaying) return;
    const timer = setTimeout(() => setReplaying(false), 550);
    return () => clearTimeout(timer);
  }, [replay, replaying]);
  React.useEffect(() => {
    const node = host.current?.closest<HTMLElement>(BUTTON_LIKE) ?? host.current;
    if (!node) return;
    const eligible = () => !node.closest("[inert],[hidden]") && !node.matches(BLOCKED);
    const sync = () => {
      const ok = eligible();
      setAllowed(ok);
      if (!ok) { setHovered(false); setFocused(false); setReplaying(false); }
    };
    sync();
    const enter = (e: PointerEvent) => { if (e.pointerType !== "touch") setHovered(eligible()); };
    const leave = () => setHovered(false);
    const focus = () => setFocused(eligible());
    const blur = (e: FocusEvent) => { if (!node.contains(e.relatedTarget as Node | null)) setFocused(false); };
    const press = (e: Event) => {
      if (e instanceof KeyboardEvent && (e.repeat || (e.key !== "Enter" && e.key !== " "))) return;
      if (e instanceof PointerEvent && e.button !== 0) return;
      if (eligible()) { setReplay(v => v + 1); setReplaying(true); }
    };
    node.addEventListener("pointerenter", enter);
    node.addEventListener("pointerleave", leave);
    node.addEventListener("focusin", focus);
    node.addEventListener("focusout", blur);
    node.addEventListener("pointerdown", press);
    node.addEventListener("keydown", press);
    const attributes = new MutationObserver(sync);
    for (let el: Element | null = node; el; el = el.parentElement) attributes.observe(el, { attributes: true, attributeFilter: ["disabled", "aria-disabled", "inert", "hidden"] });
    return () => {
      node.removeEventListener("pointerenter", enter);
      node.removeEventListener("pointerleave", leave);
      node.removeEventListener("focusin", focus);
      node.removeEventListener("focusout", blur);
      node.removeEventListener("pointerdown", press);
      node.removeEventListener("keydown", press);
      attributes.disconnect();
    };
  }, []);
  const running = allowed && enabled && inView && (active ?? (hovered || focused || replaying));
  const intent = preset === "auto" ? "semantic" : preset;
  React.useEffect(() => {
    const svg = host.current?.querySelector<SVGSVGElement>("[data-slot=icon]");
    const recipe = recipes[name];
    if (!running || !svg || (intent === "semantic" && !recipe)) return;
    const frames = (p: number): Frame => (intent === "draw" ? { glyph: { draw: p } } : recipeFrame(recipe, p));
    const painter = createPainter(svg, frames);
    painter.paint(0);
    const controls = animate(0, 1, { duration: 0.55, ease: [0.22, 0.72, 0.22, 1], onUpdate: painter.paint, onComplete: painter.restore });
    return () => { controls.stop(); painter.restore(); };
  }, [intent, running, name, active, replay]);
  return (
    <span ref={host} data-slot="animated-icon" data-preset={intent} data-animated={running || undefined} className="v-animated-icon">
      <span><Icon name={name} size={size} className={className} /></span>
    </span>
  );
}

function TextReveal({ text, as: Tag = "span", stagger = 35, duration = 480, className, ...props }: Omit<React.HTMLAttributes<HTMLElement>, "children"> & { text: string; as?: "span" | "p"; stagger?: number; duration?: number }) {
  const host = React.useRef<HTMLElement>(null);
  const [mounted, setMounted] = React.useState<HTMLElement | null>(null);
  const setHost = React.useCallback((el: HTMLElement | null) => { host.current = el; setMounted(el); }, []);
  const { enabled, inView } = useMotionVisibility(host, mounted);
  const played = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!inView || !host.current || played.current === text) return;
    played.current = text;
    if (!enabled) return;
    const words = Array.from(host.current.querySelectorAll<HTMLElement>("[data-reveal-unit]"));
    if (!words.length) return;
    const step = Math.min(stagger / 1000, 0.6 / Math.max(1, words.length - 1));
    const controls = animate(words, { "--reveal-opacity": [0, 1], "--reveal-y": ["0.28em", "0em"], "--reveal-blur": ["5px", "0px"] }, { duration: duration / 1000, delay: (i: number) => i * step, ease: [0.2, 0.65, 0.25, 1] });
    return () => {
      controls.stop();
      const live = words.filter(word => word.isConnected);
      if (live.length) animate(live, { "--reveal-opacity": 1, "--reveal-y": "0em", "--reveal-blur": "0px" }, { duration: 0 });
    };
  }, [text, enabled, inView, duration, stagger]);
  return (
    <Tag {...props} ref={setHost} data-slot="text-reveal" data-reveal-variant="soften" data-reveal-split="word" data-motion-quiet={!enabled || !inView} className={cn("v-text-reveal", className)}>
      <span className="v-text-reveal__accessible">{text}</span>
      <span aria-hidden="true" data-reveal-visual="">
        {text.split(/(\s+)/).map((word, i) => !word || /^\s+$/.test(word) ? word : <span key={i} data-reveal-word="" data-reveal-unit="">{word}</span>)}
      </span>
    </Tag>
  );
}

const bounded = (value: number, min: number, max: number, fallback: number) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
const graphemes = (text: string) => Array.from(new (Intl as any).Segmenter(undefined, { granularity: "grapheme" }).segment(text), (s: any) => s.segment);
function proximityWeight(distance: number, radius: number, from: number, to: number) {
  const p = 1 - bounded(distance / bounded(radius, 1, 1000, 120), 0, 1, 1);
  return from + (to - from) * p * p * (3 - 2 * p);
}

function VariableProximity({ text, paused = false, radius = 150, fromWeight = 350, toWeight = 800, className }: { text: string; paused?: boolean; radius?: number; fromWeight?: number; toWeight?: number; className?: string }) {
  const host = React.useRef<HTMLDivElement>(null);
  const { enabled, inView } = useMotionVisibility(host);
  const running = enabled && inView && !paused;
  const frameId = React.useRef(0), point = React.useRef<{ x: number; y: number } | null>(null);
  const from = bounded(fromWeight, 200, 800, 350), to = bounded(toWeight, 200, 800, 800);
  const paint = React.useCallback(() => {
    host.current?.querySelectorAll<HTMLElement>("[data-proximity-letter]").forEach(letter => {
      const r = letter.getBoundingClientRect();
      const distance = point.current && running ? Math.hypot(point.current.x - r.x - r.width / 2, point.current.y - r.y - r.height / 2) : Infinity;
      letter.style.fontVariationSettings = `"wght" ${proximityWeight(distance, radius, from, to)}, "wdth" 100`;
    });
  }, [running, radius, from, to]);
  React.useEffect(() => { paint(); return () => cancelAnimationFrame(frameId.current); }, [paint, text]);
  return (
    <div ref={host} data-slot="variable-proximity" data-variant="weight" data-size="default" data-running={running} className={cn("v-variable-proximity", className)}
      onPointerMove={e => { if (e.pointerType === "touch" || !running) return; point.current = { x: e.clientX, y: e.clientY }; cancelAnimationFrame(frameId.current); frameId.current = requestAnimationFrame(paint); }}
      onPointerLeave={() => { point.current = null; paint(); }}>
      <span className="v-variable-proximity__accessible">{text}</span>
      <span aria-hidden="true" className="v-variable-proximity__line">
        {text.split(/(\s+)/).map((word, i) => /^\s+$/.test(word) ? word : (
          <span className="v-variable-proximity__word" key={i}>
            {graphemes(word).map((char: any, j: number) => <span key={j} data-proximity-letter="" style={{ fontVariationSettings: `"wght" ${from}, "wdth" 100` }}>{char}</span>)}
          </span>
        ))}
      </span>
    </div>
  );
}

// ---- scripts/export-21st-sources/prompt-bond/shader-background-scene.tsx ----
const shared = {
  control: "props",
  cAzimuthAngle: 180,
  envPreset: "city",
  grain: "on",
  lightType: "3d",
  reflection: 0.1,
  positionY: 0,
  positionZ: 0,
  range: "disabled",
  rangeStart: 0,
  rangeEnd: 40,
  shader: "defaults",
  wireframe: false,
  toggleAxis: false
} as const;

const sourcePresets = {
  dark: { ...shared, brightness: 1, cDistance: 2.8, cPolarAngle: 80, cameraZoom: 9.1, color1: "#606080", color2: "#8d7dca", color3: "#212121", positionX: 0, rotationX: 50, rotationY: 0, rotationZ: -60, type: "waterPlane", uAmplitude: 0, uDensity: 1.5, uFrequency: 0, uSpeed: 0.3, uStrength: 1.5, uTime: 8 },
  light: { ...shared, brightness: 1.2, cDistance: 2.9, cPolarAngle: 120, cameraZoom: 1, color1: "#ebedff", color2: "#f3f2f8", color3: "#dbf8ff", grain: "off", positionX: 0, positionY: 1.8, rotationX: 0, rotationY: 0, rotationZ: -90, type: "waterPlane", uAmplitude: 0, uDensity: 1, uFrequency: 5.5, uSpeed: 0.3, uStrength: 3, uTime: 0.2, zoomOut: true },
} as const;

const sceneOverrides = {
  light: { zoomOut: false, positionY: 0, cDistance: 1.5, enableTransition: false, uSpeed: 0.1, uStrength: 1.2 },
  dark: { color1: "#4a4364", color2: "#8E80BC", color3: "#2b2836", cDistance: 2.4, grain: "off", brightness: 0.9, uSpeed: 0.1, uStrength: 1.1 }
} as const;

function FramePolicy({ moving, mode }: { moving: boolean; mode: string }) {
  const setFrameloop = useThree(s => s.setFrameloop);
  const invalidate = useThree(s => s.invalidate);
  React.useEffect(() => {
    setFrameloop(moving ? "always" : "demand");
    invalidate();
  }, [moving, mode, setFrameloop, invalidate]);
  return null;
}

export function ShaderScene({ mode, moving, envBasePath, original = false }: { mode: "light" | "dark"; moving: boolean; envBasePath?: string; original?: boolean }) {
  return (
    <ShaderGradientCanvas style={{ position: "absolute", inset: 0 }} pixelDensity={1} fov={45} pointerEvents="none" powerPreference="low-power" lazyLoad={false} envBasePath={envBasePath}>
      <ShaderGradient {...sourcePresets[mode]} {...(original ? {} : sceneOverrides[mode])} animate="on" />
      <FramePolicy moving={moving} mode={mode} />
    </ShaderGradientCanvas>
  );
}

// Interactive ambient light shader background for the entire page
export function InteractiveShaderBackground({ mode = "light" }: { mode?: "light" | "dark" }) {
  const [pointer, setPointer] = React.useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

  React.useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPointer({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dynamic ambient mesh with radiant tones */}
      <div
        className="absolute inset-0 transition-all duration-700 opacity-95"
        style={{
          background: mode === 'dark'
            ? 'radial-gradient(circle at 50% 20%, #1e1b4b 0%, #0f172a 60%, #020617 100%)'
            : 'radial-gradient(ellipse at 20% 20%, #e0f2fe 0%, #fdf4ff 35%, #f0fdf4 70%, #f8fafc 100%)',
        }}
      />

      {/* Interactive mouse responsive shader lighting orb */}
      <div
        className="absolute w-[620px] h-[620px] rounded-full blur-[110px] pointer-events-none transition-transform duration-300 ease-out will-change-transform opacity-70"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(168, 85, 247, 0.3) 50%, transparent 70%)',
          left: `calc(${pointer.x * 100}% - 310px)`,
          top: `calc(${pointer.y * 100}% - 310px)`,
        }}
      />

      {/* Floating secondary accent aura */}
      <div
        className="absolute top-[25%] right-[8%] w-[520px] h-[520px] rounded-full blur-[130px] pointer-events-none opacity-45 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(245, 158, 11, 0.25) 50%, transparent 70%)',
          animationDuration: '7s',
        }}
      />

      {/* Minimal grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1.2px, transparent 1.2px)',
          backgroundSize: '36px 36px',
        }}
      />
    </div>
  );
}

// Voice Agent presets for the interactive living prompt
export const VOICE_AGENT_STORIES = [
  {
    prompt: "Dental clinic receptionist assistant",
    role: "Medical Clinic Receptionist",
    voice: "Rachel (Calm female)",
    greeting: "Hello, Dr. Miller Smile Clinic! How can I help you book or reschedule your visit today?",
    firstThought: "Calm, reassuring voice that books checkups & answers dental insurance questions.",
  },
  {
    prompt: "Inbound B2B SaaS sales SDR rep",
    role: "Sales Development Representative",
    voice: "Jessica (Expressive female)",
    greeting: "Hi there! Welcome to CloudFlow. What are your biggest infrastructure bottlenecks this quarter?",
    firstThought: "Qualifies enterprise accounts by cloud spend and books 15-minute live demos.",
  },
  {
    prompt: "Airline flight delay concierge",
    role: "Passenger Care Specialist",
    voice: "George (Reassuring British male)",
    greeting: "Hello, SkyWings Passenger Care. May I have your 6-digit booking reference to check alternatives?",
    firstThought: "Handles cancelled connections, baggage claims, and hotel vouchers with zero friction.",
  },
  {
    prompt: "24/7 IT helpdesk troubleshooting assistant",
    role: "Technical Support Specialist",
    voice: "Daniel (Authoritative male)",
    greeting: "IT Support Helpdesk here. Are you experiencing Wi-Fi or VPN connection issues today?",
    firstThought: "Guides remote employees step-by-step through router resets and escalates unresolved tickets.",
  },
];

interface SimpleLivingHeroProps {
  onPromptSubmit: (text: string) => void;
  isGenerating: boolean;
  suggestedPrompts?: string[];
}

export const SimpleLivingHero: React.FC<SimpleLivingHeroProps> = ({
  onPromptSubmit,
  isGenerating,
  suggestedPrompts = VOICE_AGENT_STORIES.map(s => s.prompt),
}) => {
  const [inputValue, setInputValue] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onPromptSubmit(inputValue.trim());
    }
  };

  const handlePickThought = (text: string) => {
    setInputValue(text);
    onPromptSubmit(text);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-6 sm:py-12 z-20">
      {/* Title with variable proximity feeling */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-slate-800 border border-slate-200/90 shadow-xs backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          <span>Interactive Voice Agent Synthesis</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
          Every voice agent. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
            A little more alive.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Type what you want your agent to say and do. VoiceForge instantly structures conversational turn rules, spoken boundaries, and binds a real ElevenLabs voice.
        </p>
      </div>

      {/* Living Interactive Prompt Capsule */}
      <div className="w-full max-w-2xl px-2 sm:px-0">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-2 p-2 sm:p-2.5 rounded-full bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-200/60 focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/15 transition-all"
        >
          <span className="pl-3.5 text-slate-400 font-mono text-lg font-light">›</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isGenerating}
            placeholder="Type a voice agent idea (e.g., Dental clinic receptionist, SaaS inbound SDR)..."
            className="flex-1 bg-transparent border-0 text-slate-900 placeholder-slate-400 text-sm sm:text-base px-2 py-2 focus:outline-none focus:ring-0 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={isGenerating || !inputValue.trim()}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-600 via-indigo-600 to-fuchsia-600 text-white shadow-md shadow-indigo-500/25 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform active:scale-95 shrink-0"
            title="Synthesize and Forge Voice Agent"
          >
            {isGenerating ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </form>

        {/* Thought Chips to Try */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
            Try a thought:
          </span>
          {suggestedPrompts.slice(0, 4).map((thought, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handlePickThought(thought)}
              className="text-xs px-3.5 py-1.5 rounded-full bg-white/85 hover:bg-white text-slate-700 hover:text-cyan-700 border border-slate-200/90 hover:border-cyan-300 shadow-2xs hover:shadow-xs transition transform hover:-translate-y-0.5"
            >
              "{thought}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const COJEEV_CSS = `
:root {
  --v-pink: #F0A4CC;
  --v-olive: #A8BC75;
  --v-blue: #95BAE8;
  --v-yellow: #F1D369;
  --v-canvas: #F8F6F1;
  --v-paper: #FFFFFF;
  --v-beige: #EEE9E1;
  --v-ink: #26282d;
  --v-text: #26282d;
  --v-text-2: #464951;
  --v-brand: #845c73;
  --v-border: #b4b0ab;
}
`;

export function CojeevStyles() {
  return (
    <style href="000h-prompt-bond" precedence="default">
      {COJEEV_CSS}
    </style>
  );
}
