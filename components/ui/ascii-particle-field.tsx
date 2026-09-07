"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * AsciiParticleField
 * -------------------
 * Native port of the canvas particle system from the "Zenith Compute
 * Network" hero reference (ASCII glyph nodes + rising light beams,
 * mouse-reactive). Ported directly into React/canvas rather than kept as
 * an iframe with Tailwind/GSAP CDN scripts, so it has no runtime dependency
 * on external CDNs and stays consistent with the rest of the site's theme
 * system (dark/light aware, respects prefers-reduced-motion, pauses off-
 * screen, DPR-capped).
 *
 * Recolored from the reference's sky-blue accent to oneCoreLab's royal
 * blue; neutral glyphs shift between white/black translucent depending on
 * the active theme.
 */
export interface AsciiParticleFieldProps {
  className?: string;
  nodeCount?: number;
  beamCount?: number;
}

const CHARS = "01ABCDEFOCL#$%&*".split("");

type Node = { x: number; y: number; vy: number; char: string };
type Beam = { x: number; y: number; length: number; speed: number; opacity: number };

export function AsciiParticleField({
  className,
  nodeCount = 80,
  beamCount = 22,
}: AsciiParticleFieldProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDark = () =>
      resolvedTheme === "dark" ||
      (resolvedTheme === undefined && document.documentElement.classList.contains("dark"));

    const ROYAL = "37, 99, 235";

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let beams: Beam[] = [];
    let raf = 0;
    let running = true;
    const mouse = { x: -1000, y: -1000 };

    function build() {
      const rect = wrap!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.max(1, Math.floor(width * dpr));
      canvas!.height = Math.max(1, Math.floor(height * dpr));
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mobile = width < 768;
      const nCount = mobile ? Math.round(nodeCount * 0.5) : nodeCount;
      const bCount = mobile ? Math.round(beamCount * 0.5) : beamCount;

      nodes = Array.from({ length: nCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vy: Math.random() * 0.4 + 0.1,
        char: CHARS[Math.floor(Math.random() * CHARS.length)],
      }));

      beams = Array.from({ length: bCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 100 + 50,
        speed: Math.random() * 1.4 + 0.7,
        opacity: Math.random() * 0.4 + 0.25,
      }));
    }

    function onMove(clientX: number, clientY: number) {
      const rect = wrap!.getBoundingClientRect();
      mouse.x = clientX - rect.left;
      mouse.y = clientY - rect.top;
    }
    function onMouseMove(e: MouseEvent) {
      onMove(e.clientX, e.clientY);
    }
    function onTouchMove(e: TouchEvent) {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }
    function onLeave() {
      mouse.x = -1000;
      mouse.y = -1000;
    }

    wrap.addEventListener("mousemove", onMouseMove);
    wrap.addEventListener("touchmove", onTouchMove, { passive: true });
    wrap.addEventListener("mouseleave", onLeave);

    const ro = new ResizeObserver(build);
    ro.observe(wrap);
    build();

    function step() {
      if (!running) return;
      ctx!.clearRect(0, 0, width, height);
      const dark = isDark();
      const neutral = dark ? "156, 163, 175" : "71, 85, 105";
      const glyph = dark ? "209, 213, 219" : "51, 65, 85";

      // Rising beams
      for (const b of beams) {
        b.y -= b.speed;
        if (b.y + b.length < 0) {
          b.y = height + 100;
          b.x = Math.random() * width;
        }
        const g = ctx!.createLinearGradient(b.x, b.y, b.x, b.y + b.length);
        g.addColorStop(0, `rgba(${ROYAL}, ${b.opacity})`);
        g.addColorStop(1, "transparent");
        ctx!.strokeStyle = g;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.moveTo(b.x, b.y);
        ctx!.lineTo(b.x, b.y + b.length);
        ctx!.stroke();
      }

      // Proximity mesh between nodes
      ctx!.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const d = Math.hypot(n1.x - n2.x, n1.y - n2.y);
          if (d < 110) {
            ctx!.strokeStyle = `rgba(${neutral}, ${0.14 * (1 - d / 110)})`;
            ctx!.beginPath();
            ctx!.moveTo(n1.x, n1.y);
            ctx!.lineTo(n2.x, n2.y);
            ctx!.stroke();
          }
        }
      }

      // Glyph nodes
      ctx!.font = "11px var(--font-mono, monospace)";
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      for (const n of nodes) {
        n.y += n.vy;
        if (n.y > height + 20) {
          n.y = -20;
          n.x = Math.random() * width;
        }
        const dist = Math.hypot(mouse.x - n.x, mouse.y - n.y);
        if (dist < 160 || Math.random() > 0.985) {
          n.char = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        if (dist < 160) {
          ctx!.strokeStyle = `rgba(${ROYAL}, ${0.45 * (1 - dist / 160)})`;
          ctx!.beginPath();
          ctx!.moveTo(n.x, n.y);
          ctx!.lineTo(mouse.x, mouse.y);
          ctx!.stroke();
        }
        ctx!.fillStyle = dist < 160 ? `rgb(${ROYAL})` : `rgba(${glyph}, 0.4)`;
        ctx!.fillText(n.char, n.x, n.y);
      }

      raf = requestAnimationFrame(step);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting && !reduceMotion;
        if (running) raf = requestAnimationFrame(step);
        else cancelAnimationFrame(raf);
      },
      { threshold: 0.01 }
    );
    io.observe(wrap);

    if (!reduceMotion) raf = requestAnimationFrame(step);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener("mousemove", onMouseMove);
      wrap.removeEventListener("touchmove", onTouchMove);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, [nodeCount, beamCount, resolvedTheme]);

  return (
    <div ref={wrapRef} className={cn("relative h-full w-full overflow-hidden", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    </div>
  );
}

export default AsciiParticleField;
