import { HandwritingText } from "@/components/ui/handwriting-text";
import { HowWeWork, type ProcessStep } from "@/components/ui/how-it-works";

const STEPS: ProcessStep[] = [
  {
    title: "Discover & Plan",
    description: "We understand your goals, define what success looks like, and map a clear roadmap.",
    theme: "royal",
  },
  {
    title: "Design & Prototype",
    description: "Interactive prototypes and interface decisions you can react to before a line of code ships.",
    theme: "ink",
  },
  {
    title: "Build & Test",
    description: "Clean, typed, tested code — built to be maintained, not just demoed once.",
    theme: "royal",
  },
  {
    title: "Launch & Grow",
    description: "A smooth deployment, documentation your team can use, and ongoing support after launch.",
    theme: "ink",
  },
];

export function Process() {
  return (
    <section className="border-t border-border py-16 sm:py-20 md:py-10">
      <div className="container-lab mb-4 md:mb-0">
        <p className="eyebrow mb-3">05 / How We Work</p>
        <h2 className="mb-2 font-display font-semibold tracking-tight text-3xl leading-[1.1] sm:text-5xl">
          A process with{" "}
          <HandwritingText text="no surprises" height="0.9em" className="text-primary" duration={1.5} />.
        </h2>
      </div>
      <HowWeWork steps={STEPS} />
    </section>
  );
}
