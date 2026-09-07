"use client";
// Interactive 3D icon sphere — Fibonacci distribution, drag-to-rotate with
// momentum, auto-rotation, depth scaling and fade.
//
// PERFORMANCE NOTE (why this is written imperatively):
// The first version stored rotation in React state and called setRotation()
// inside requestAnimationFrame. That re-rendered the whole component ~60x a
// second and re-ran an O(n^2) overlap pass over every icon — enough to make
// scrolling stutter badly on a phone, which is why it had to be disabled
// there. Now the rAF loop mutates each element's transform directly through
// refs and React never re-renders during animation, so it's cheap enough to
// run on mobile too. React only renders the icons once.

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SphereIcon {
  id: string;
  name: string;
  render: () => React.ReactNode;
}

export interface IconSphereProps {
  items: SphereIcon[];
  /** Reference (desktop) size; the sphere scales down to fit its container. */
  containerSize?: number;
  sphereRadius?: number;
  dragSensitivity?: number;
  momentumDecay?: number;
  maxRotationSpeed?: number;
  baseItemScale?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  className?: string;
}

type Spherical = { theta: number; phi: number };

const toRad = (d: number) => d * (Math.PI / 180);
const normalize = (a: number) => {
  while (a > 180) a -= 360;
  while (a < -180) a += 360;
  return a;
};

/** Even point distribution over a sphere. Deterministic — no re-randomising. */
function fibonacciPoints(count: number): Spherical[] {
  const golden = (1 + Math.sqrt(5)) / 2;
  const inc = (2 * Math.PI) / golden;
  const out: Spherical[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const phi = Math.acos(1 - 2 * t) * (180 / Math.PI);
    const theta = ((inc * i) * (180 / Math.PI)) % 360;
    out.push({ theta, phi });
  }
  return out;
}

export function IconSphere({
  items,
  containerSize = 520,
  sphereRadius = 220,
  dragSensitivity = 0.45,
  momentumDecay = 0.94,
  maxRotationSpeed = 6,
  baseItemScale = 0.16,
  autoRotate = true,
  autoRotateSpeed = 0.14,
  className = "",
}: IconSphereProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const nodeRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const [renderSize, setRenderSize] = React.useState(containerSize);
  const [mounted, setMounted] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);

  const points = React.useMemo(() => fibonacciPoints(items.length), [items.length]);

  // Mutable animation state — deliberately outside React.
  const rot = React.useRef({ x: 12, y: 15 });
  const vel = React.useRef({ x: 0, y: 0 });
  const dragging = React.useRef(false);
  const lastPointer = React.useRef({ x: 0, y: 0 });
  const active = React.useRef(true);
  const raf = React.useRef(0);

  React.useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Fit to the available width.
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setRenderSize(Math.max(200, Math.min(containerSize, e.contentRect.width)))
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerSize]);

  // Only animate while visible and the tab is focused.
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { active.current = e.isIntersecting; }, { threshold: 0.05 });
    io.observe(el);
    const onVis = () => { if (document.hidden) active.current = false; };
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  // Drag (mouse + touch).
  React.useEffect(() => {
    if (!mounted) return;
    const stage = stageRef.current;
    if (!stage) return;

    const clamp = (v: number) => Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, v));

    const down = (x: number, y: number) => {
      dragging.current = true;
      vel.current = { x: 0, y: 0 };
      lastPointer.current = { x, y };
    };
    const move = (x: number, y: number) => {
      if (!dragging.current) return;
      const dx = x - lastPointer.current.x;
      const dy = y - lastPointer.current.y;
      const d = { x: clamp(-dy * dragSensitivity), y: clamp(dx * dragSensitivity) };
      rot.current = { x: normalize(rot.current.x + d.x), y: normalize(rot.current.y + d.y) };
      vel.current = d;
      lastPointer.current = { x, y };
    };
    const up = () => { dragging.current = false; };

    const onMouseDown = (e: MouseEvent) => { e.preventDefault(); down(e.clientX, e.clientY); };
    const onMouseMove = (e: MouseEvent) => move(e.clientX, e.clientY);
    const onTouchStart = (e: TouchEvent) => { const t = e.touches[0]; if (t) down(t.clientX, t.clientY); };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t || !dragging.current) return;
      // Only swallow the gesture once we're actually dragging the sphere,
      // so a normal vertical page scroll that starts here still works.
      if (e.cancelable) e.preventDefault();
      move(t.clientX, t.clientY);
    };

    stage.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", up);
    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", up);

    return () => {
      stage.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", up);
      stage.removeEventListener("touchstart", onTouchStart);
      stage.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", up);
    };
  }, [mounted, dragSensitivity, maxRotationSpeed]);

  // The animation loop: pure DOM writes, zero React renders.
  React.useEffect(() => {
    if (!mounted || reduced) return;

    const scale = renderSize / containerSize;
    const radius = sphereRadius * scale;
    const itemSize = renderSize * baseItemScale;
    const half = renderSize / 2;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const minFrame = coarse ? 1000 / 30 : 0; // 30fps is plenty on a phone
    let last = 0;

    const clamp = (v: number) => Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, v));

    const tick = (now: number) => {
      raf.current = requestAnimationFrame(tick);
      if (!active.current) return;
      if (minFrame && now - last < minFrame) return;
      last = now;

      if (!dragging.current) {
        vel.current.x *= momentumDecay;
        vel.current.y *= momentumDecay;
        if (!autoRotate && Math.abs(vel.current.x) < 0.01 && Math.abs(vel.current.y) < 0.01) {
          vel.current.x = 0;
          vel.current.y = 0;
        }
        rot.current = {
          x: normalize(rot.current.x + clamp(vel.current.x)),
          y: normalize(rot.current.y + (autoRotate ? autoRotateSpeed : 0) + clamp(vel.current.y)),
        };
      }

      const rx = toRad(rot.current.x);
      const ry = toRad(rot.current.y);
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const cosY = Math.cos(ry), sinY = Math.sin(ry);

      for (let i = 0; i < points.length; i++) {
        const el = nodeRefs.current[i];
        if (!el) continue;
        const p = points[i];
        const th = toRad(p.theta);
        const ph = toRad(p.phi);

        let x = radius * Math.sin(ph) * Math.cos(th);
        let y = radius * Math.cos(ph);
        let z = radius * Math.sin(ph) * Math.sin(th);

        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        x = x1; z = z1;

        const y2 = y * cosX - z * sinX;
        const z2 = y * sinX + z * cosX;
        y = y2; z = z2;

        // Depth: nearer icons render larger and fully opaque.
        const depth = (z + radius) / (2 * radius);          // 0 (back) .. 1 (front)
        const s = 0.55 + depth * 0.55;
        const opacity = 0.25 + depth * 0.75;

        el.style.transform =
          `translate3d(${half + x - itemSize / 2}px, ${half + y - itemSize / 2}px, 0) scale(${s.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.zIndex = String(1000 + Math.round(z));
      }
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [
    mounted, reduced, renderSize, containerSize, sphereRadius, baseItemScale,
    points, autoRotate, autoRotateSpeed, momentumDecay, maxRotationSpeed,
  ]);

  const itemSize = renderSize * baseItemScale;

  // Server render and reduced-motion both get a plain wrapped grid, so the
  // icons are always visible and readable even without the animation.
  if (!mounted || reduced) {
    return (
      <div ref={wrapRef} className={cn("mx-auto w-full", className)} style={{ maxWidth: containerSize }}>
        <ul className="flex flex-wrap justify-center gap-2.5">
          {items.map((item) => (
            <li
              key={item.id}
              title={item.name}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5"
            >
              <span className="sr-only">{item.name}</span>
              <span className="h-[58%] w-[58%]" aria-hidden>{item.render()}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={cn("mx-auto w-full", className)} style={{ maxWidth: containerSize }}>
      <div
        ref={stageRef}
        className="relative mx-auto cursor-grab touch-pan-y select-none active:cursor-grabbing"
        style={{ width: renderSize, height: renderSize }}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            ref={(el) => { nodeRefs.current[i] = el; }}
            title={item.name}
            className="absolute left-0 top-0 flex items-center justify-center rounded-full bg-white shadow-lg shadow-black/25 ring-1 ring-black/5 will-change-transform"
            style={{ width: itemSize, height: itemSize }}
          >
            <span className="sr-only">{item.name}</span>
            <span className="h-[58%] w-[58%]" aria-hidden>{item.render()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IconSphere;