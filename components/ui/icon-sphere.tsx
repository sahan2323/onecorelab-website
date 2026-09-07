"use client";
// Adapted from the provided SphereImageGrid reference component. Core
// mechanics kept faithful: Fibonacci sphere distribution, 3D rotation
// matrices, drag-to-rotate with momentum physics, auto-rotation,
// depth/distance-based scaling, and collision-avoidance scaling to keep
// items from overlapping. Repurposed from a photo gallery (with a click-to-
// enlarge modal) into a brand-icon "ball" for the Technology section — the
// modal was dropped (enlarging a logo isn't useful) in favor of a small
// hover label, and image nodes became icon badges.

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SphereIcon {
  id: string;
  name: string;
  render: () => React.ReactNode;
}

export interface IconSphereProps {
  items: SphereIcon[];
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

type Position3D = { x: number; y: number; z: number };
type SphericalPosition = { theta: number; phi: number; radius: number };
type WorldPosition = Position3D & {
  scale: number;
  zIndex: number;
  isVisible: boolean;
  fadeOpacity: number;
};

const MATH = {
  toRad: (d: number) => d * (Math.PI / 180),
  normalizeAngle: (angle: number) => {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
  },
};

export function IconSphere({
  items,
  containerSize = 520,
  sphereRadius = 220,
  dragSensitivity = 0.5,
  momentumDecay = 0.95,
  maxRotationSpeed = 5,
  baseItemScale = 0.16,
  autoRotate = true,
  autoRotateSpeed = 0.15,
  className = "",
}: IconSphereProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [rotation, setRotation] = React.useState({ x: 12, y: 15 });
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [positions, setPositions] = React.useState<SphericalPosition[]>([]);

  // containerSize/sphereRadius are the reference (desktop) dimensions; the
  // sphere measures its actual available width and scales everything down
  // proportionally so it never overflows a narrow viewport.
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [renderSize, setRenderSize] = React.useState(containerSize);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const available = entry.contentRect.width;
      setRenderSize(Math.max(220, Math.min(containerSize, available)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerSize]);

  const sizeScale = renderSize / containerSize;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const lastMouse = React.useRef({ x: 0, y: 0 });
  const raf = React.useRef<number | null>(null);
  const isDraggingRef = React.useRef(false);
  const velocityRef = React.useRef({ x: 0, y: 0 });
  const rotationRef = React.useRef({ x: 12, y: 15 });
  const [isDragging, setIsDragging] = React.useState(false);

  const baseItemSize = renderSize * baseItemScale;

  const generatePositions = React.useCallback((): SphericalPosition[] => {
    const out: SphericalPosition[] = [];
    const count = items.length;
    const golden = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = (2 * Math.PI) / golden;

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;

      let phi = inclination * (180 / Math.PI);
      let theta = (azimuth * (180 / Math.PI)) % 360;

      const poleBonus = Math.pow(Math.abs(phi - 90) / 90, 0.6) * 30;
      phi = phi < 90 ? Math.max(8, phi - poleBonus) : Math.min(172, phi + poleBonus);
      phi = 12 + (phi / 180) * 156;

      const jitter = (Math.random() - 0.5) * 14;
      theta = (theta + jitter) % 360;
      phi = Math.max(2, Math.min(178, phi + (Math.random() - 0.5) * 8));

      out.push({ theta, phi, radius: sphereRadius });
    }
    return out;
  }, [items.length, sphereRadius]);

  const worldPositions = React.useMemo((): WorldPosition[] => {
    const base = positions.map((pos) => {
      const thetaRad = MATH.toRad(pos.theta);
      const phiRad = MATH.toRad(pos.phi);
      const rotXRad = MATH.toRad(rotation.x);
      const rotYRad = MATH.toRad(rotation.y);

      let x = pos.radius * Math.sin(phiRad) * Math.cos(thetaRad);
      let y = pos.radius * Math.cos(phiRad);
      let z = pos.radius * Math.sin(phiRad) * Math.sin(thetaRad);

      const x1 = x * Math.cos(rotYRad) + z * Math.sin(rotYRad);
      const z1 = -x * Math.sin(rotYRad) + z * Math.cos(rotYRad);
      x = x1;
      z = z1;

      const y2 = y * Math.cos(rotXRad) - z * Math.sin(rotXRad);
      const z2 = y * Math.sin(rotXRad) + z * Math.cos(rotXRad);
      y = y2;
      z = z2;

      const fadeStart = -10;
      const fadeEnd = -sphereRadius * 0.65;
      const isVisible = z > fadeEnd;
      let fadeOpacity = 1;
      if (z <= fadeStart) fadeOpacity = Math.max(0, (z - fadeEnd) / (fadeStart - fadeEnd));

      const distanceFromCenter = Math.sqrt(x * x + y * y);
      const distanceRatio = Math.min(distanceFromCenter / sphereRadius, 1);
      const centerScale = Math.max(0.35, 1 - distanceRatio * 0.55);
      const depthScale = (z + sphereRadius) / (2 * sphereRadius);
      const scale = centerScale * Math.max(0.55, 0.75 + depthScale * 0.35);

      // x/y/z are computed in stable logical units above (so the layout
      // itself never re-randomizes on resize); only the final screen
      // position is scaled to the actually-available render size.
      return {
        x: x * sizeScale,
        y: y * sizeScale,
        z: z * sizeScale,
        scale,
        zIndex: Math.round(1000 + z),
        isVisible,
        fadeOpacity,
      };
    });

    // Collision avoidance — shrink items that overlap on screen.
    const adjusted = [...base];
    for (let i = 0; i < adjusted.length; i++) {
      const a = adjusted[i];
      if (!a.isVisible) continue;
      let scale = a.scale;
      const sizeA = baseItemSize * scale;
      for (let j = 0; j < adjusted.length; j++) {
        if (i === j) continue;
        const b = adjusted[j];
        if (!b.isVisible) continue;
        const sizeB = baseItemSize * b.scale;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const minDist = (sizeA + sizeB) / 2 + 20;
        if (d < minDist && d > 0) {
          const overlap = minDist - d;
          const reduction = Math.max(0.45, 1 - (overlap / minDist) * 0.55);
          scale = Math.min(scale, scale * reduction);
        }
      }
      adjusted[i] = { ...a, scale: Math.max(0.3, scale) };
    }
    return adjusted;
  }, [positions, rotation, sphereRadius, baseItemSize, sizeScale]);

  const clampSpeed = React.useCallback(
    (v: number) => Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, v)),
    [maxRotationSpeed]
  );

  // Drag handlers — update refs synchronously (no React re-render mid-drag).
  const onPointerDown = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    velocityRef.current = { x: 0, y: 0 };
    lastMouse.current = { x: clientX, y: clientY };
  };
  const onPointerMoveTo = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const dx = clientX - lastMouse.current.x;
    const dy = clientY - lastMouse.current.y;
    const delta = { x: clampSpeed(-dy * dragSensitivity), y: clampSpeed(dx * dragSensitivity) };
    rotationRef.current = {
      x: MATH.normalizeAngle(rotationRef.current.x + delta.x),
      y: MATH.normalizeAngle(rotationRef.current.y + delta.y),
    };
    velocityRef.current = delta;
    setRotation(rotationRef.current);
    lastMouse.current = { x: clientX, y: clientY };
  };
  const onPointerUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  React.useEffect(() => setIsMounted(true), []);
  React.useEffect(() => setPositions(generatePositions()), [generatePositions]);

  // Only spin while actually on screen. Without this the loop ran for the
  // whole page lifetime — on a phone that is a permanent CPU burn even when
  // the sphere is nowhere near the viewport.
  const activeRef = React.useRef(true);
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { activeRef.current = e.isIntersecting; },
      { threshold: 0.05 }
    );
    io.observe(el);
    const onVis = () => { if (document.hidden) activeRef.current = false; };
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;

    // Each tick re-renders React and recomputes every icon's projected
    // position (an O(n^2) overlap pass). At 60fps on a phone that is far
    // more work than the effect is worth, so coarse-pointer devices get a
    // lower cadence and reduced-motion devices get none at all.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minFrameMs = coarse ? 1000 / 24 : 0;
    let last = 0;

    const tick = (now?: number) => {
      const ts = now ?? 0;
      if (reducedMotion || !activeRef.current) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      if (minFrameMs && ts - last < minFrameMs) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      last = ts;

      if (!isDraggingRef.current) {
        const v = velocityRef.current;
        const next = { x: v.x * momentumDecay, y: v.y * momentumDecay };
        velocityRef.current =
          !autoRotate && Math.abs(next.x) < 0.01 && Math.abs(next.y) < 0.01 ? { x: 0, y: 0 } : next;

        let newY = rotationRef.current.y;
        if (autoRotate) newY += autoRotateSpeed;
        newY += clampSpeed(velocityRef.current.y);

        rotationRef.current = {
          x: MATH.normalizeAngle(rotationRef.current.x + clampSpeed(velocityRef.current.x)),
          y: MATH.normalizeAngle(newY),
        };
        setRotation(rotationRef.current);
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [isMounted, momentumDecay, clampSpeed, autoRotate, autoRotateSpeed]);

  React.useEffect(() => {
    if (!isMounted) return;
    const mm = (e: MouseEvent) => onPointerMoveTo(e.clientX, e.clientY);
    const mu = () => onPointerUp();
    const tm = (e: TouchEvent) => {
      if (e.touches[0]) onPointerMoveTo(e.touches[0].clientX, e.touches[0].clientY);
    };
    document.addEventListener("mousemove", mm);
    document.addEventListener("mouseup", mu);
    document.addEventListener("touchmove", tm, { passive: true });
    document.addEventListener("touchend", mu);
    return () => {
      document.removeEventListener("mousemove", mm);
      document.removeEventListener("mouseup", mu);
      document.removeEventListener("touchmove", tm);
      document.removeEventListener("touchend", mu);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  if (!isMounted) {
    /**
     * Server-rendered fallback. The 3D sphere needs measured geometry and
     * rAF, so it can't render on the server — but shipping an empty box
     * would mean crawlers and no-JS visitors see none of the stack at all.
     * A plain wrapped grid of the same icons keeps the content real; the
     * interactive sphere upgrades in after mount.
     */
    return (
      <div ref={wrapRef} className={cn("mx-auto w-full", className)} style={{ maxWidth: containerSize }}>
        <ul className="flex flex-wrap justify-center gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5"
              title={item.name}
            >
              <span className="sr-only">{item.name}</span>
              <div className="h-[58%] w-[58%]" aria-hidden="true">
                {item.render()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={cn("mx-auto w-full", className)} style={{ maxWidth: containerSize }}>
      <div
        ref={containerRef}
        className={cn("relative mx-auto select-none", isDragging ? "cursor-grabbing" : "cursor-grab")}
        style={{ width: renderSize, height: renderSize, perspective: 1200 }}
        onMouseDown={(e) => {
          e.preventDefault();
          onPointerDown(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) onPointerDown(t.clientX, t.clientY);
        }}
      >
        {items.map((item, index) => {
          const pos = worldPositions[index];
          if (!pos || !pos.isVisible) return null;
          const size = baseItemSize * pos.scale;
          return (
            <div
              key={item.id}
              className="absolute flex items-center justify-center rounded-full bg-white shadow-lg shadow-black/30 ring-1 ring-black/5 transition-transform duration-150"
              style={{
                width: size,
                height: size,
                left: renderSize / 2 + pos.x,
                top: renderSize / 2 + pos.y,
                opacity: pos.fadeOpacity,
                transform: `translate(-50%, -50%) scale(${hovered === item.id ? 1.15 : 1})`,
                zIndex: pos.zIndex,
              }}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered((h) => (h === item.id ? null : h))}
            >
              <div className="h-[58%] w-[58%]">{item.render()}</div>
              {hovered === item.id && (
                <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-white">
                  {item.name}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IconSphere;
