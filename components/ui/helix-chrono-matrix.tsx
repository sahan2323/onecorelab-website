'use client';
// Adapted from the supplied HelixChronoMatrix component.
// Physics and rendering kept faithful (stratified 3D ribbon rings, projected
// with perspective, pointer attraction field, traveling particles, eased
// topology morphing). Adapted for oneCoreLab:
//   - the demo chrome (topology switcher, freeze button, giant headline) is
//     now opt-in via `showControls` / `headline`, so it can sit behind real
//     content as a background band instead of as a standalone toy
//   - colours read from the site's theme class rather than the OS media
//     query, so it follows the header's dark/light toggle like everything else
//   - honours prefers-reduced-motion, and pauses its rAF loop when scrolled
//     out of view (the original ran a full physics pass forever, off-screen)
//   - ring/particle counts scale down on small viewports

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FiberPoint {
    x: number;
    y: number;
    baseY: number;
    vy: number;
    excitation: number;
}

interface FiberRing {
    points: FiberPoint[];
    radius: number;
    baseRadius: number;
    yOffset: number;
    rotationSpeed: number;
    angle: number;
    harmonicOffset: number;
}

interface Particle {
    ringIndex: number;
    progress: number;
    speed: number;
    size: number;
}

export type TopologyMode = 'DOUBLE_HELIX' | 'NEURAL_STRATA' | 'QUANTUM_RIBBONS';

export interface HelixChronoMatrixProps {
    headline?: string;
    className?: string;
    /** Show the topology switcher + freeze button. Off for background use. */
    showControls?: boolean;
    /** Paint an opaque backdrop. Off lets the section's own bg show through. */
    opaque?: boolean;
    mode?: TopologyMode;
}

export function HelixChronoMatrix({
    headline,
    className = "",
    showControls = false,
    opaque = true,
    mode: initialMode = 'DOUBLE_HELIX',
}: HelixChronoMatrixProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [isRunning, setIsRunning] = useState(true);
    const [topology, setTopology] = useState<TopologyMode>(initialMode);

    const pointerRef = useRef({ x: -2000, y: -2000, targetX: -2000, targetY: -2000, radius: 220 });
    const ringsRef = useRef<FiberRing[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const dimensionsRef = useRef({ width: 0, height: 0 });
    const visibleRef = useRef(true);
    const topologyTransitionRef = useRef({
        progress: 1,
        from: initialMode,
        to: initialMode,
    });

    const initTopology = useCallback((width: number, height: number) => {
        const rings: FiberRing[] = [];
        const compact = width < 768;
        const ringCount = compact ? 16 : 28;
        const pointsPerRing = compact ? 72 : 120;

        for (let r = 0; r < ringCount; r++) {
            const progress = r / ringCount;
            const points: FiberPoint[] = [];
            const baseRadius = Math.min(width, height) * 0.35 * (0.4 + progress * 0.6);
            const yOffset = (progress - 0.5) * (height * 0.45);

            for (let p = 0; p < pointsPerRing; p++) {
                points.push({ x: 0, y: 0, baseY: yOffset, vy: 0, excitation: 0 });
            }

            rings.push({
                points,
                radius: baseRadius,
                baseRadius,
                yOffset,
                rotationSpeed: (r % 2 === 0 ? 1 : -1) * (0.002 + (r / ringCount) * 0.0025),
                angle: (r * Math.PI) / ringCount,
                harmonicOffset: r * 0.2,
            });
        }
        ringsRef.current = rings;

        const particles: Particle[] = [];
        const particleCount = compact ? 22 : 45;
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                ringIndex: Math.floor(Math.random() * ringCount),
                progress: Math.random(),
                speed: (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
                size: Math.random() * 1.5 + 1.5,
            });
        }
        particlesRef.current = particles;
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;
        const ctx = canvas.getContext('2d', { alpha: !opaque });
        if (!ctx) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const rect = entry.contentRect;
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                dimensionsRef.current = { width: rect.width, height: rect.height };
                canvas.width = Math.floor(rect.width * dpr);
                canvas.height = Math.floor(rect.height * dpr);
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(dpr, dpr);
                initTopology(rect.width, rect.height);
            }
        });
        resizeObserver.observe(container);

        // Don't burn a physics pass + full repaint while scrolled past.
        const io = new IntersectionObserver(
            ([e]) => { visibleRef.current = e.isIntersecting; },
            { threshold: 0.01 }
        );
        io.observe(container);

        return () => { resizeObserver.disconnect(); io.disconnect(); };
    }, [initTopology, opaque]);

    const handleTopologyChange = (newMode: TopologyMode) => {
        if (newMode === topology) return;
        topologyTransitionRef.current = { progress: 0, from: topology, to: newMode };
        setTopology(newMode);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: !opaque });
        if (!ctx) return;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let animId = 0;
        let time = 0;

        const render = () => {
            if (!isRunning || !visibleRef.current) {
                animId = requestAnimationFrame(render);
                return;
            }
            if (!reduced) time += 0.012;

            const { width, height } = dimensionsRef.current;
            const pointer = pointerRef.current;
            const rings = ringsRef.current;
            const particles = particlesRef.current;
            const trans = topologyTransitionRef.current;

            if (trans.progress < 1) trans.progress = Math.min(1, trans.progress + 0.05);

            pointer.x += (pointer.targetX - pointer.x) * 0.1;
            pointer.y += (pointer.targetY - pointer.y) * 0.1;

            // Follow the site's own theme toggle, not the OS setting.
            const isDark = document.documentElement.classList.contains('dark');
            const strokeBase = isDark ? '255, 255, 255' : '15, 23, 42';

            if (opaque) {
                ctx.fillStyle = isDark ? '#0a0b0f' : '#f8fafc';
                ctx.fillRect(0, 0, width, height);
            } else {
                ctx.clearRect(0, 0, width, height);
            }

            const centerX = width / 2;
            const centerY = height / 2;

            for (let rIdx = 0; rIdx < rings.length; rIdx++) {
                const ring = rings[rIdx];
                if (!reduced) ring.angle += ring.rotationSpeed;

                const points = ring.points;
                const numPoints = points.length;

                ctx.beginPath();
                let firstProjX = 0;
                let firstProjY = 0;
                let avgExcitation = 0;

                for (let pIdx = 0; pIdx < numPoints; pIdx++) {
                    const pt = points[pIdx];
                    const theta = (pIdx / numPoints) * Math.PI * 2 + ring.angle;

                    const getPos = (m: TopologyMode) => {
                        let x = Math.cos(theta) * ring.radius;
                        const z = Math.sin(theta) * ring.radius;
                        let y = ring.yOffset;
                        if (m === 'DOUBLE_HELIX') {
                            y += Math.sin(theta * 2 + time * 2 + ring.harmonicOffset) * 45;
                        } else if (m === 'NEURAL_STRATA') {
                            x += Math.sin(y * 0.02 + time * 1.5) * 35;
                            y += Math.cos(theta * 3 + time) * 30;
                        } else {
                            x *= 1 + Math.sin(theta * 4 + time * 1.2) * 0.15;
                            y += Math.sin(x * 0.008 + time * 2) * 50;
                        }
                        return { x, y, z };
                    };

                    const posFrom = getPos(trans.from);
                    const posTo = getPos(trans.to);
                    const e = trans.progress < 0.5
                        ? 2 * trans.progress * trans.progress
                        : -1 + (4 - 2 * trans.progress) * trans.progress;

                    const x3D = posFrom.x + (posTo.x - posFrom.x) * e;
                    const y3D = posFrom.y + (posTo.y - posFrom.y) * e;
                    const z3D = posFrom.z + (posTo.z - posFrom.z) * e;

                    const scale = 600 / (550 + z3D);
                    const projX = centerX + x3D * scale;
                    const projY = centerY + (y3D + pt.vy) * scale;

                    const dx = projX - pointer.x;
                    const dy = projY - pointer.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < pointer.radius && dist > 0) {
                        const ratio = 1 - dist / pointer.radius;
                        const targetVy = Math.sin(theta + time) * ratio * 15;
                        pt.vy += (targetVy - pt.vy) * 0.1;
                        pt.excitation = Math.max(pt.excitation, ratio);
                    } else {
                        pt.vy *= 0.92;
                    }
                    pt.excitation *= 0.92;
                    avgExcitation += pt.excitation;

                    if (pIdx === 0) {
                        firstProjX = projX; firstProjY = projY;
                        ctx.moveTo(projX, projY);
                    } else {
                        ctx.lineTo(projX, projY);
                    }
                }

                ctx.lineTo(firstProjX, firstProjY);
                avgExcitation /= numPoints;

                const depthAlpha = 0.15 + (rIdx / rings.length) * 0.45;
                if (avgExcitation > 0.05) {
                    // Excitation reads in the brand blue rather than plain white.
                    ctx.strokeStyle = `rgba(17, 100, 183, ${Math.min(1, 0.45 + avgExcitation * 0.55)})`;
                    ctx.lineWidth = 1.2 + avgExcitation * 1.5;
                } else {
                    ctx.strokeStyle = `rgba(${strokeBase}, ${depthAlpha * 0.55})`;
                    ctx.lineWidth = 0.75;
                }
                ctx.stroke();
            }

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (!reduced) p.progress = (p.progress + p.speed + 1) % 1;

                const ring = rings[p.ringIndex];
                if (!ring) continue;

                const numPoints = ring.points.length;
                const exact = p.progress * numPoints;
                const i1 = Math.floor(exact) % numPoints;
                const i2 = (i1 + 1) % numPoints;
                const blend = exact - Math.floor(exact);

                const t1 = (i1 / numPoints) * Math.PI * 2 + ring.angle;
                const t2 = (i2 / numPoints) * Math.PI * 2 + ring.angle;
                const x1 = Math.cos(t1) * ring.radius, z1 = Math.sin(t1) * ring.radius;
                const x2 = Math.cos(t2) * ring.radius, z2 = Math.sin(t2) * ring.radius;

                const x3D = x1 + (x2 - x1) * blend;
                const z3D = z1 + (z2 - z1) * blend;
                const scale = 600 / (550 + z3D);
                const projX = centerX + x3D * scale;
                const projY = centerY + ring.yOffset * scale;

                const dist = Math.hypot(projX - pointer.x, projY - pointer.y);

                ctx.beginPath();
                ctx.arc(projX, projY, p.size * scale, 0, Math.PI * 2);
                ctx.fillStyle = dist < pointer.radius
                    ? '#1164B7'
                    : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.45)');
                ctx.fill();
            }

            animId = requestAnimationFrame(render);
        };

        animId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animId);
    }, [isRunning, topology, opaque]);

    const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        pointerRef.current.targetX = e.clientX - rect.left;
        pointerRef.current.targetY = e.clientY - rect.top;
    };

    const handlePointerLeave = () => {
        pointerRef.current.targetX = -2000;
        pointerRef.current.targetY = -2000;
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
            className={cn("group relative h-full w-full select-none overflow-hidden", className)}
        >
            <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />

            {(showControls || headline) && (
                <div className="relative z-20 flex h-full w-full flex-col justify-between p-6 md:p-10">
                    {showControls ? (
                        <header className="flex w-full flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1 rounded-full border border-border bg-background/80 p-1 shadow-sm backdrop-blur-md">
                                {(['DOUBLE_HELIX', 'NEURAL_STRATA', 'QUANTUM_RIBBONS'] as TopologyMode[]).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => handleTopologyChange(m)}
                                        className={cn(
                                            "rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
                                            topology === m
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {m.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setIsRunning((v) => !v)}
                                aria-label={isRunning ? "Pause animation" : "Play animation"}
                                className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-2 shadow-sm backdrop-blur-md transition-colors hover:bg-surface"
                            >
                                {isRunning ? <Pause className="size-3" /> : <Play className="size-3" />}
                                <span className="text-[10px] font-medium uppercase tracking-wider">
                                    {isRunning ? "Pause" : "Play"}
                                </span>
                            </button>
                        </header>
                    ) : <div />}

                    {headline && (
                        <main className="pointer-events-none flex flex-col items-center justify-center text-center">
                            <h2 className="font-display text-5xl font-bold uppercase tracking-tighter sm:text-7xl">
                                {headline}
                            </h2>
                        </main>
                    )}
                    <div />
                </div>
            )}
        </div>
    );
}

export default HelixChronoMatrix;
