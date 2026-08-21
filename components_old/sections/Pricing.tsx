"use client";

import { SectionHeader, type HeadingSegment } from "@/components/SectionHeader";
import { PricingTiers, type PricingTab } from "@/components/PricingTiers";
import { useRevealed } from "@/lib/useRevealed";
import { cn } from "@/lib/cn";

export interface PricingProps {
  eyebrow: string;
  heading: string | HeadingSegment[];
  body: string;
  tabs: PricingTab[];
}

/** Pricing — gradient card, split header, Websites/Apps toggle + tier grid (node 1:391). */
export function Pricing({ eyebrow, heading, body, tabs }: PricingProps) {
  const { ref, has } = useRevealed();
  const rise = (shown: boolean) =>
    cn("w-full transition-all duration-cinematic ease-smooth", shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0");

  return (
    <section
      ref={ref}
      id="pricing"
      className="flex flex-col items-center gap-block rounded-xl border border-glass-divider bg-gradient-blue px-section-x py-section-y text-text-on-dark"
    >
      <div data-reveal={0} className={rise(has(0))}>
        <SectionHeader eyebrow={eyebrow} heading={heading} body={body} split tone="gradient" className="w-full" />
      </div>
      <div data-reveal={1} className={rise(has(1))}>
        <PricingTiers tabs={tabs} />
      </div>
    </section>
  );
}

export default Pricing;
