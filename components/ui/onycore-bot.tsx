"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export type OnycoreMood = "idle" | "happy" | "thinking" | "sleepy";

type OnycoreBotProps = {
  className?: string;
  /** "full" = the whole character, "head" = helmet only (for small avatars). */
  variant?: "full" | "head";
  mood?: OnycoreMood;
  /** Plays one wave of the right hand. Flip to true; it resets itself visually. */
  waving?: boolean;
  /** Hands go up while he's being carried around. */
  dragging?: boolean;
  /** Eyes and head follow the mouse (desktop only, ignored on touch). */
  track?: boolean;
  /** false = no idle animation at all (still renders the same character). */
  animated?: boolean;
  title?: string;
};

/**
 * Onycore — oneCoreLab's AI assistant, drawn as SVG so each part can move on
 * its own: blinking eyes, a breathing belt light, floating mitten hands and a
 * wave. Everything animates with CSS transforms/opacity only (compositor
 * friendly), and the mouse-follow writes straight to the DOM through refs, so
 * nothing here re-renders React per frame.
 */
export function OnycoreBot({
  className,
  variant = "full",
  mood = "idle",
  waving = false,
  dragging = false,
  track = false,
  animated = true,
  title = "Onycore",
}: OnycoreBotProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `ocb-${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;

  const svgRef = React.useRef<SVGSVGElement>(null);
  const eyesRef = React.useRef<SVGGElement>(null);
  const headRef = React.useRef<SVGGElement>(null);

  // Mouse-follow. Fine pointers only, never with reduced motion.
  React.useEffect(() => {
    if (!track || !animated) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let raf = 0;
    let px = 0;
    let py = 0;
    const apply = () => {
      raf = 0;
      const svg = svgRef.current;
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      const dx = px - (r.left + r.width / 2);
      const dy = py - (r.top + r.height * 0.35);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 320);
      const ex = (dx / d) * 3.6 * k;
      const ey = (dy / d) * 2.6 * k;
      if (eyesRef.current) eyesRef.current.style.transform = `translate(${ex}px, ${ey}px)`;
      if (headRef.current)
        headRef.current.style.transform = `translate(${ex * 0.35}px, ${ey * 0.3}px) rotate(${ex * 1.3}deg)`;
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [track, animated]);

  const head = (
    <g ref={headRef} className="ocb-track ocb-tb">
      <g transform="rotate(-7 60 46)">
        {/* Helmet shell */}
        <path d="M60 18 C86 18 92.5 24.5 92.5 45 C92.5 66 84 74.5 60 74.5 C36 74.5 27.5 66 27.5 45 C27.5 24.5 34 18 60 18 Z" fill={url("shell")} />
        <path d="M60 18 C86 18 92.5 24.5 92.5 45 C92.5 66 84 74.5 60 74.5 C36 74.5 27.5 66 27.5 45 C27.5 24.5 34 18 60 18 Z" fill="none" stroke={url("rimStroke")} strokeWidth="1.1" />
        {/* Visor */}
        <path d="M60 22.5 C81.5 22.5 87.5 28 87.5 43 C87.5 58.5 80.5 65.5 60 65.5 C39.5 65.5 32.5 58.5 32.5 43 C32.5 28 38.5 22.5 60 22.5 Z" fill={url("visor")} stroke="#000" strokeWidth="1.4" />
        {/* Visor reflections */}
        <path d="M38.5 31.5 Q44 25.6 63 25.8" fill="none" stroke="#fff" strokeOpacity=".42" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M39 37 Q41 30 49 27.5" fill="none" stroke="#fff" strokeOpacity=".08" strokeWidth="4" strokeLinecap="round" />

        {/* Eyes */}
        <g ref={eyesRef} className="ocb-track">
          <g className="ocb-mood ocb-tb">
            <g className="ocb-open">
              <ellipse cx="49" cy="44" rx="10" ry="12" fill={url("eyeGlow")} />
              <ellipse cx="71" cy="44" rx="10" ry="12" fill={url("eyeGlow")} />
              <g className="ocb-blink ocb-tb">
                <ellipse cx="49" cy="44" rx="4.9" ry="6.9" fill={url("eye")} />
                <ellipse cx="71" cy="44" rx="4.9" ry="6.9" fill={url("eye")} />
              </g>
            </g>
          </g>
          {/* Happy ^ ^ eyes */}
          <g className="ocb-happy" fill="none" stroke="#4d8bff" strokeWidth="2.8" strokeLinecap="round">
            <path d="M44.2 46.5 Q49 39.5 53.8 46.5" />
            <path d="M66.2 46.5 Q71 39.5 75.8 46.5" />
          </g>
        </g>
      </g>
    </g>
  );

  const defs = (
    <defs>
      <radialGradient id={id("body")} cx="38%" cy="26%" r="78%">
        <stop offset="0" stopColor="#40444e" />
        <stop offset=".35" stopColor="#1b1d23" />
        <stop offset=".75" stopColor="#0a0b0e" />
        <stop offset="1" stopColor="#050608" />
      </radialGradient>
      <radialGradient id={id("rim")} cx="50%" cy="46%" r="52%">
        <stop offset=".8" stopColor="#1d6bff" stopOpacity="0" />
        <stop offset="1" stopColor="#3f86ff" stopOpacity=".55" />
      </radialGradient>
      <linearGradient id={id("shell")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#30343c" />
        <stop offset=".55" stopColor="#15171c" />
        <stop offset="1" stopColor="#0b0c10" />
      </linearGradient>
      <linearGradient id={id("rimStroke")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5b9bff" stopOpacity=".55" />
        <stop offset=".5" stopColor="#5b9bff" stopOpacity=".12" />
        <stop offset="1" stopColor="#5b9bff" stopOpacity=".6" />
      </linearGradient>
      <radialGradient id={id("visor")} cx="48%" cy="38%" r="70%">
        <stop offset="0" stopColor="#141821" />
        <stop offset=".7" stopColor="#050609" />
        <stop offset="1" stopColor="#000" />
      </radialGradient>
      <radialGradient id={id("eye")} cx="45%" cy="38%" r="70%">
        <stop offset="0" stopColor="#a9c9ff" />
        <stop offset=".4" stopColor="#4a86ff" />
        <stop offset="1" stopColor="#1e4fe6" />
      </radialGradient>
      <radialGradient id={id("eyeGlow")}>
        <stop offset="0" stopColor="#2f6bff" stopOpacity=".7" />
        <stop offset="1" stopColor="#2f6bff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={id("hand")} cx="36%" cy="30%" r="80%">
        <stop offset="0" stopColor="#3d414a" />
        <stop offset=".55" stopColor="#15171c" />
        <stop offset="1" stopColor="#07080a" />
      </radialGradient>
      <linearGradient id={id("handRim")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#4f92ff" stopOpacity=".7" />
        <stop offset=".45" stopColor="#4f92ff" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={id("ground")}>
        <stop offset="0" stopColor="#1d64ff" stopOpacity=".55" />
        <stop offset="1" stopColor="#1d64ff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={id("spec")}>
        <stop offset="0" stopColor="#fff" stopOpacity=".16" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
    </defs>
  );

  const hand = (side: "l" | "r") => (
    <g transform={side === "l" ? "translate(13.5 82)" : "translate(106.5 82) scale(-1 1)"}>
      <g className={cn("ocb-hf", side)}>
        <g className="ocb-pose">
          <g className={cn("ocb-wave", side)}>
            <ellipse cx="0" cy="2" rx="7.3" ry="9.4" fill={url("hand")} />
            <ellipse cx="0" cy="2" rx="7.3" ry="9.4" fill="none" stroke={url("handRim")} strokeWidth=".9" />
            <ellipse cx="3.6" cy="-6.6" rx="3" ry="3.9" transform="rotate(24 3.6 -6.6)" fill={url("hand")} />
          </g>
        </g>
      </g>
    </g>
  );

  return (
    <svg
      ref={svgRef}
      viewBox={variant === "head" ? "22 12 76 68" : "0 6 120 126"}
      className={cn("ocb", !animated && "ocb-static", className)}
      data-mood={mood}
      data-wave={waving ? "true" : "false"}
      data-drag={dragging ? "true" : "false"}
      role="img"
      aria-label={title}
    >
      <style>{CSS}</style>
      {defs}
      {variant === "head" ? (
        head
      ) : (
        <>
          <ellipse cx="60" cy="125" rx="30" ry="4.5" fill={url("ground")} className="ocb-ground" />
          <g className="ocb-float">
            {hand("l")}
            {hand("r")}
            {/* Body */}
            <ellipse cx="60" cy="86" rx="31" ry="32" fill={url("body")} />
            <ellipse cx="60" cy="86" rx="31" ry="32" fill={url("rim")} />
            <ellipse cx="47" cy="102" rx="12" ry="7" fill={url("spec")} />
            {/* Belt light */}
            <g className="ocb-belt" fill="none" strokeLinecap="round">
              <path d="M29.1 89 Q60 99.5 90.9 89" stroke="#2a6bff" strokeOpacity=".25" strokeWidth="7" />
              <path d="M29.1 89 Q60 99.5 90.9 89" stroke="#3d84ff" strokeOpacity=".8" strokeWidth="2.8" />
              <path d="M29.1 89 Q60 99.5 90.9 89" stroke="#cfe4ff" strokeWidth="1.1" />
            </g>
            {/* Contact shadow under the helmet */}
            <ellipse cx="60" cy="73" rx="27" ry="5.5" fill="#000" opacity=".5" />
            {head}
          </g>
        </>
      )}
    </svg>
  );
}

const CSS = `
.ocb{overflow:visible}
.ocb-tb,.ocb-pose,.ocb-wave{transform-box:fill-box;transform-origin:50% 50%}
.ocb-pose,.ocb-wave{transform-origin:50% 100%}
.ocb-float{animation:ocb-float 3.4s ease-in-out infinite}
.ocb-hf{animation:ocb-float 3.4s ease-in-out infinite;animation-delay:-.6s}
.ocb-hf.r{animation-delay:-1.3s}
.ocb-ground{animation:ocb-ground 3.4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 50%}
.ocb-blink{animation:ocb-blink 5.2s infinite}
.ocb-belt{animation:ocb-belt 3s ease-in-out infinite}
.ocb-track{transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.ocb-mood{transition:transform .35s ease}
.ocb-open,.ocb-happy{transition:opacity .2s ease}
.ocb-happy{opacity:0}
.ocb[data-mood=happy] .ocb-happy{opacity:1}
.ocb[data-mood=happy] .ocb-open{opacity:0}
.ocb[data-mood=sleepy] .ocb-mood{transform:translateY(2px) scaleY(.2)}
.ocb[data-mood=sleepy] .ocb-belt{animation-duration:6s;opacity:.55}
.ocb[data-mood=thinking] .ocb-mood{animation:ocb-scan 1.3s ease-in-out infinite}
.ocb-pose{transition:transform .35s cubic-bezier(.3,1.5,.5,1)}
.ocb[data-drag=true] .ocb-pose{transform:translateY(-9px) rotate(-30deg)}
.ocb[data-wave=true] .ocb-wave.r{animation:ocb-wave 1.8s ease-in-out}
@keyframes ocb-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3.5px)}}
@keyframes ocb-ground{0%,100%{transform:scaleX(1);opacity:1}50%{transform:scaleX(.88);opacity:.75}}
@keyframes ocb-blink{0%,92%,96%,100%{transform:scaleY(1)}94%{transform:scaleY(.1)}}
@keyframes ocb-belt{0%,100%{opacity:.78}50%{opacity:1}}
@keyframes ocb-scan{0%,100%{transform:translateX(-2.6px)}50%{transform:translateX(2.6px)}}
@keyframes ocb-wave{
  0%{transform:translate(0,0) rotate(0)}
  14%{transform:translate(-3px,-16px) rotate(-12deg)}
  28%{transform:translate(-3px,-16px) rotate(22deg)}
  42%{transform:translate(-3px,-16px) rotate(-16deg)}
  56%{transform:translate(-3px,-16px) rotate(22deg)}
  70%{transform:translate(-3px,-16px) rotate(-10deg)}
  85%{transform:translate(-3px,-16px) rotate(6deg)}
  100%{transform:translate(0,0) rotate(0)}
}
.ocb-static *{animation:none!important}
@media (prefers-reduced-motion:reduce){.ocb *{animation:none!important;transition:none!important}}
`;

export default OnycoreBot;