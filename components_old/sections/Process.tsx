"use client";

import { SectionHeader, type HeadingSegment } from "@/components/SectionHeader";
import { StepCard } from "@/components/StepCard";
import { useRevealed } from "@/lib/useRevealed";
import { cn } from "@/lib/cn";

interface Step {
  number: string;
  title: string;
  body: string;
}

export interface ProcessProps {
  eyebrow: string;
  heading: string | HeadingSegment[];
  steps: Step[];
}

/** Our Process — centered header + a 2×3 grid of numbered step cards (node 1:311). */
export function Process({ eyebrow, heading, steps }: ProcessProps) {
  const { ref, has } = useRevealed();
  // Two explicit rows so the second row's cascade only fires once it enters view.
  const rows = [steps.slice(0, 3), steps.slice(3, 6)];

  return (
    <section
      ref={ref}
      id="process"
      className="flex flex-col items-center gap-block rounded-xl bg-surface-white px-section-x pb-4xl pt-section-y text-text-on-light"
    >
      <div
        data-reveal={0}
        className={cn(
          "w-full transition-all duration-cinematic ease-smooth",
          has(0) ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        )}
      >
        <SectionHeader eyebrow={eyebrow} heading={heading} align="center" level="h3" className="mx-auto max-w-quote" />
      </div>

      <div className="flex w-full flex-col gap-lg">
        {rows.map((row, r) => (
          <div key={r} data-reveal={r + 1} className="grid gap-lg sm:grid-cols-3">
            {row.map((step, i) => (
              <div
                key={step.number}
                className={cn(
                  "h-step transition-all duration-slowest ease-smooth",
                  has(r + 1) ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0",
                )}
                style={{ transitionDelay: has(r + 1) ? `${i * 100}ms` : "0ms" }}
              >
                <StepCard number={step.number} title={step.title} body={step.body} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Process;
