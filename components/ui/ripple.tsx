"use client";
// Extracted from the provided modern-animated-sign-in reference. The
// original's inline borderColor used a bare `var(--foreground)`, which
// only works if that variable holds a full color value — in this project
// --foreground stores an "H S% L%" triple for use with hsl(), so it's
// wrapped properly here to actually render instead of silently failing.
export function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className = "",
}: {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
}) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(circle,black,transparent_80%)] ${className}`}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = Math.max(0.02, mainCircleOpacity - i * 0.025);
        const animationDelay = `${i * 0.12}s`;
        const borderOpacity = Math.min(0.5, 0.08 + i * 0.03);

        return (
          <span
            key={i}
            className="absolute animate-ripple rounded-full border bg-royal-500/10"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay,
              borderWidth: "1px",
              borderColor: `hsl(var(--primary) / ${borderOpacity})`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </div>
  );
}
