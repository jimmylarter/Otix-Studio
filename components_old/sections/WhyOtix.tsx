"use client";

import { SectionHeader, type HeadingSegment } from "@/components/SectionHeader";
import { WorkCard, type WorkCardStat } from "@/components/WorkCard";
import { Cta } from "@/components/Cta";
import { useRevealed } from "@/lib/useRevealed";
import { cn } from "@/lib/cn";

interface WhyProject {
  image: string;
  tag: string;
  title: string;
  body: string;
  href?: string;
  stats?: WorkCardStat[];
}

export interface WhyOtixProps {
  eyebrow: string;
  heading: string | HeadingSegment[];
  body: string;
  /** the Work section's top two cards — narrow tall (left) + wide featured (right) */
  tall: WhyProject;
  featured: WhyProject;
  cta: { label: string; href: string };
}

export function WhyOtix({ eyebrow, heading, body, tall, featured, cta }: WhyOtixProps) {
  const { ref, has } = useRevealed();
  const rise = (shown: boolean) =>
    cn("transition-all duration-cinematic ease-smooth", shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0");
  const cardCls = (shown: boolean, i: number, extra?: string) => ({
    className: cn(
      "h-full transition-all duration-slowest ease-smooth",
      extra,
      shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0",
    ),
    style: { transitionDelay: shown ? `${i * 120}ms` : "0ms" },
  });

  return (
    <section
      ref={ref}
      id="why-otix"
      className="flex flex-col items-center gap-block rounded-xl border border-glass-divider bg-gradient-blue px-section-x py-section-y text-text-on-dark"
    >
      <div data-reveal={0} className={cn("w-full", rise(has(0)))}>
        <SectionHeader eyebrow={eyebrow} heading={heading} body={body} split tone="gradient" className="w-full" />
      </div>

      {/* Work's top two cards — tall (left) + featured (right); gradient at rest → navy on hover */}
      <div data-reveal={1} className="grid w-full gap-lg lg:grid-cols-3">
        <div {...cardCls(has(1), 0)}>
          <WorkCard {...tall} tallImage tone="navy" />
        </div>
        <div {...cardCls(has(1), 1, "lg:col-span-2")}>
          <WorkCard {...featured} tallImage tone="navy" />
        </div>
      </div>

      <div data-reveal={2} className={cn("w-fit", rise(has(2)))}>
        <Cta variant="arrow" tone="gradient" label={cta.label} href={cta.href} />
      </div>
    </section>
  );
}

export default WhyOtix;
