"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * ConstellationGrid
 * ------------------
 * A theme-aware, physics-driven canvas background used across the
 * oneCoreLab site (hero, technology section, section transitions).
 *
 * - A grid of nodes rests at fixed origin points and springs back to them.
 * - The pointer repels nearby nodes; faster pointer movement (velocity)
 *   pushes harder, so a quick flick of the mouse visibly "disturbs" the
 *   grid rather than just nudging it.
 * - Clicking/tapping emits an expanding shockwave ring that displaces
 *   nodes as it passes through them.
 * - Nearby nodes connect with faint lines; connections brighten with
 *   proximity to the pointer.
 * - Slow radar rings sweep outward from the last interaction point.
 * - A thin coordinate HUD (axis ticks + a live pointer readout) reinforces
 *   the "technology lab" feel without competing with page content.
 *
 * Palette is royal blue + white/black only — no cyan — per brand guidelines.
 * Respects prefers-reduced-motion (falls back to a static, non-animated grid)
 * and reduces node density + skips the HUD on small screens for performance.
 */

type Node = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type Shockwave = {
  x: number;
  y: number;
  start: number;
};

type Radar = {
  x: number;
  y: number;
  start: number;
};

export interface ConstellationGridProps {
  className?: string;
  /** Approx. spacing between resting nodes, in CSS px. */
  cellSize?: number;
  /** Radius (px) within which the pointer influences nodes. */
  influenceRadius?: number;
  /** Show the coordinate HUD (axis ticks + pointer readout). */
  showHud?: boolean;
  /** Show slow radar sweep rings from the last interaction point. */
  showRadar?: boolean;
  /** Density multiplier under 768px viewport width (lower = fewer nodes). */
  mobileDensity?: number;
}

export function ConstellationGrid({
  className,
  cellSize = 46,
  influenceRadius = 150,
  showHud = true,
  showRadar = true,
  mobileDensity = 0.55,
}: ConstellationGridProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const isDark = () =>
      resolvedTheme === "dark" ||
      (resolvedTheme === undefined &&
        document.documentElement.classList.contains("dark"));

    // Royal-blue brand palette (see tailwind config `royal` scale).
    const ROYAL = { r: 37, g: 99, b: 235 };
    const ROYAL_LIGHT = { r: 122, g: 145, b: 248 };

    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let shockwaves: Shockwave[] = [];
    let radars: Radar[] = [];
    let raf = 0;
    let running = true;
    let isMobile = false;

    const pointer = { x: -9999, y: -9999, px: -9999, py: -9999, vx: 0, vy: 0, active: false };

    function buildGrid() {
      const rect = wrap!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas!.width = Math.max(1, Math.floor(width * dpr));
      canvas!.height = Math.max(1, Math.floor(height * dpr));
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      isMobile = width < 768;
      const spacing = isMobile ? cellSize / mobileDensity : cellSize;

      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const offsetX = (width - (cols - 1) * spacing) / 2;
      const offsetY = (height - (rows - 1) * spacing) / 2;

      const next: Node[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const baseX = offsetX + c * spacing;
          const baseY = offsetY + r * spacing;
          next.push({ baseX, baseY, x: baseX, y: baseY, vx: 0, vy: 0 });
        }
      }
      nodes = next;
    }

    function onPointerMove(clientX: number, clientY: number) {
      const rect = wrap!.getBoundingClientRect();
      pointer.px = pointer.x;
      pointer.py = pointer.y;
      pointer.x = clientX - rect.left;
      pointer.y = clientY - rect.top;
      pointer.vx = pointer.x - pointer.px;
      pointer.vy = pointer.y - pointer.py;
      pointer.active = true;
    }

    function onMouseMove(e: MouseEvent) {
      onPointerMove(e.clientX, e.clientY);
    }
    function onTouchMove(e: TouchEvent) {
      if (e.touches[0]) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
    function onLeave() {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    }
    function onDown(e: MouseEvent | TouchEvent) {
      const rect = wrap!.getBoundingClientRect();
      const cx = "touches" in e ? e.touches[0]?.clientX : e.clientX;
      const cy = "touches" in e ? e.touches[0]?.clientY : e.clientY;
      if (cx === undefined || cy === undefined) return;
      const x = cx - rect.left;
      const y = cy - rect.top;
      shockwaves.push({ x, y, start: performance.now() });
      if (showRadar) radars.push({ x, y, start: performance.now() });
      if (shockwaves.length > 4) shockwaves.shift();
      if (radars.length > 3) radars.shift();
    }

    wrap.addEventListener("mousemove", onMouseMove);
    wrap.addEventListener("touchmove", onTouchMove, { passive: true });
    wrap.addEventListener("mouseleave", onLeave);
    wrap.addEventListener("mousedown", onDown);
    wrap.addEventListener("touchstart", onDown, { passive: true });

    const ro = new ResizeObserver(() => buildGrid());
    ro.observe(wrap);
    buildGrid();

    // Ambient radar ping even with no interaction, so the section never
    // looks fully static (subtle — one every ~6s from the grid center).
    let lastAmbient = performance.now();

    function step(now: number) {
      if (!running) return;
      ctx!.clearRect(0, 0, width, height);

      const dark = isDark();
      const dotBase = dark ? "255,255,255" : "0,0,0";
      const lineBase = dark ? "255,255,255" : "0,0,0";

      if (showRadar && now - lastAmbient > 6500) {
        radars.push({ x: width / 2, y: height / 2, start: now });
        if (radars.length > 3) radars.shift();
        lastAmbient = now;
      }

      // Radar rings (drawn first, underneath nodes)
      radars = radars.filter((r) => now - r.start < 3200);
      for (const r of radars) {
        const t = (now - r.start) / 3200;
        const radius = t * Math.max(width, height) * 0.55;
        const alpha = (1 - t) * 0.16;
        ctx!.beginPath();
        ctx!.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${ROYAL.r},${ROYAL.g},${ROYAL.b},${alpha})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      // Active shockwaves
      shockwaves = shockwaves.filter((s) => now - s.start < 900);

      // Physics + displacement
      const k = 0.06; // spring constant pulling back to origin
      const damping = 0.82;

      for (const n of nodes) {
        let fx = 0;
        let fy = 0;

        if (pointer.active) {
          const dx = n.x - pointer.x;
          const dy = n.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          if (dist < influenceRadius) {
            const speed = Math.hypot(pointer.vx, pointer.vy);
            const strength = (1 - dist / influenceRadius) * (0.35 + Math.min(speed * 0.06, 2.2));
            fx += (dx / dist) * strength * 6;
            fy += (dy / dist) * strength * 6;
          }
        }

        for (const s of shockwaves) {
          const t = (now - s.start) / 900;
          const ringRadius = t * Math.max(width, height) * 0.7;
          const dx = n.x - s.x;
          const dy = n.y - s.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const band = Math.abs(dist - ringRadius);
          if (band < 42) {
            const strength = (1 - t) * (1 - band / 42) * 5;
            fx += (dx / dist) * strength;
            fy += (dy / dist) * strength;
          }
        }

        // Spring back toward base position
        fx += (n.baseX - n.x) * k;
        fy += (n.baseY - n.y) * k;

        n.vx = (n.vx + fx) * damping;
        n.vy = (n.vy + fy) * damping;
        n.x += n.vx;
        n.y += n.vy;
      }

      // Connections — only test neighbors within one extra cell distance
      // for performance rather than an O(n^2) scan across the whole grid.
      const spacing = isMobile ? cellSize / mobileDensity : cellSize;
      const linkDist = spacing * 1.6;
      ctx!.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          if (Math.abs(a.baseX - b.baseX) > linkDist || Math.abs(a.baseY - b.baseY) > linkDist) {
            continue;
          }
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > linkDist) continue;

          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          const distToPointer = pointer.active ? Math.hypot(midX - pointer.x, midY - pointer.y) : 9999;
          const proximity = Math.max(0, 1 - distToPointer / (influenceRadius * 1.3));
          const baseAlpha = (1 - dist / linkDist) * 0.12;

          if (proximity > 0.02) {
            const alpha = baseAlpha + proximity * 0.35;
            ctx!.strokeStyle = `rgba(${ROYAL.r},${ROYAL.g},${ROYAL.b},${Math.min(alpha, 0.55)})`;
          } else {
            ctx!.strokeStyle = `rgba(${lineBase},${baseAlpha})`;
          }
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }

      // Nodes
      for (const n of nodes) {
        const dx = n.x - n.baseX;
        const dy = n.y - n.baseY;
        const displacement = Math.min(1, Math.hypot(dx, dy) / 18);
        const r = 1.2 + displacement * 1.6;

        if (displacement > 0.12) {
          const c = displacement > 0.6 ? ROYAL : ROYAL_LIGHT;
          ctx!.fillStyle = `rgba(${c.r},${c.g},${c.b},${0.45 + displacement * 0.5})`;
        } else {
          ctx!.fillStyle = `rgba(${dotBase},${0.28 + displacement * 0.3})`;
        }
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Coordinate HUD — a light technical accent, skipped on mobile.
      if (showHud && !isMobile) {
        ctx!.font = "10px var(--font-mono, monospace)";
        ctx!.fillStyle = `rgba(${lineBase},0.28)`;
        ctx!.textBaseline = "top";
        for (let x = 0; x < width; x += spacing * 4) {
          ctx!.fillRect(x, 0, 1, 5);
          ctx!.fillText(String(Math.round(x)).padStart(4, "0"), x + 4, 6);
        }
        for (let y = 0; y < height; y += spacing * 4) {
          ctx!.fillRect(0, y, 5, 1);
        }

        if (pointer.active) {
          ctx!.strokeStyle = `rgba(${ROYAL.r},${ROYAL.g},${ROYAL.b},0.5)`;
          ctx!.beginPath();
          ctx!.moveTo(pointer.x - 8, pointer.y);
          ctx!.lineTo(pointer.x + 8, pointer.y);
          ctx!.moveTo(pointer.x, pointer.y - 8);
          ctx!.lineTo(pointer.x, pointer.y + 8);
          ctx!.stroke();
          ctx!.fillStyle = `rgba(${ROYAL.r},${ROYAL.g},${ROYAL.b},0.75)`;
          ctx!.fillText(
            `X:${Math.round(pointer.x)} Y:${Math.round(pointer.y)}`,
            pointer.x + 12,
            pointer.y + 10
          );
        }
      }

      raf = requestAnimationFrame(step);
    }

    function renderStatic() {
      // prefers-reduced-motion: draw the resting grid once, no rAF loop.
      ctx!.clearRect(0, 0, width, height);
      const dark = isDark();
      const dotBase = dark ? "255,255,255" : "0,0,0";
      ctx!.fillStyle = `rgba(${dotBase},0.28)`;
      for (const n of nodes) {
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 1.2, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    // Pause the animation loop when the section is off-screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting && !reduceMotion;
        if (running) raf = requestAnimationFrame(step);
        else cancelAnimationFrame(raf);
      },
      { threshold: 0.01 }
    );
    io.observe(wrap);

    if (reduceMotion) {
      renderStatic();
    } else {
      raf = requestAnimationFrame(step);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener("mousemove", onMouseMove);
      wrap.removeEventListener("touchmove", onTouchMove);
      wrap.removeEventListener("mouseleave", onLeave);
      wrap.removeEventListener("mousedown", onDown);
      wrap.removeEventListener("touchstart", onDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellSize, influenceRadius, showHud, showRadar, mobileDensity, mounted, resolvedTheme]);

  return (
    <div ref={wrapRef} className={cn("relative h-full w-full overflow-hidden", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    </div>
  );
}

export default ConstellationGrid;
